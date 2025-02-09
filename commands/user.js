const { SlashCommandBuilder } = require('discord.js');
const { readDatabase, writeDatabase } = require('../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adduser')
        .setDescription('Add or update a user in the database')
        .addStringOption(option => 
            option.setName('nickname')
                .setDescription('Nickname of the user')
                .setRequired(true)),
    async execute(interaction) {
        const db = readDatabase('users.json');
        const userId = interaction.user.id;
        const nickname = interaction.options.getString('nickname') || `Agent ${Object.keys(db.users).length + 1}`;

        if (!db.users[userId]) {
            db.users[userId] = {
                userId: userId,
                nickname: nickname,
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
        } else {
            db.users[userId].nickname = nickname;
        }

        writeDatabase('users.json', db);
        await interaction.reply(`User ${nickname} has been added/updated.`);
    }
};