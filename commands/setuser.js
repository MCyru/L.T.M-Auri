const { SlashCommandBuilder } = require('discord.js');
const { readDatabase, writeDatabase } = require('../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setuser')
        .setDescription('Set a user field in the database')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to set')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('field')
                .setDescription('The field to set, nested ones go inside dots, e.g. stats.fortitude')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('value')
                .setDescription('The value to set')
                .setRequired(true)),
    async execute(interaction) {
        const db = readDatabase('users.json');
        const user = interaction.options.getUser('user');
        const userId = user.id;
        const field = interaction.options.getString('field');
        const value = interaction.options.getString('value');

        if (!db.users[userId]) {
            db.users[userId] = {
                userId: userId,
                nickname: `User ${Object.keys(db.users).length + 1}`,
                hp: 50,
                sp: 50,
                egosuit_uuid: "E01-00-001",
                egogifts_uuid: [],
                egoweapon_uuid: "E03-00-001",
                stats: { fortitude: 1, prudence: 1, temperance: 1, justice: 1},
                exstats: { critrate: 1.5, critchance: 0.5, break: 100, breakrate: 2, defense: 20, penetration: 5},
                fear: 0,
                currency: 0,
                inventory: [],
            };
        }

        const fieldParts = field.split('.');
        let current = db.users[userId];
        for (let i = 0; i < fieldParts.length - 1; i++) {
            if (!current[fieldParts[i]]) {
                current[fieldParts[i]] = {};
            }
            current = current[fieldParts[i]];
        }
        current[fieldParts[fieldParts.length - 1]] = isNaN(value) ? value : parseInt(value, 10);

        writeDatabase('users.json', db);
        await interaction.reply(`User ${user.username}'s ${field} has been set to ${value}.`);
    }
};