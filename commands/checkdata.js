const { SlashCommandBuilder } = require('discord.js');
const { readDatabase } = require('../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkdata')
        .setDescription('Check your own data'),
    async execute(interaction) {
        const db = readDatabase('users.json');
        const userId = interaction.user.id;

        if (!db.users[userId]) {
            return interaction.reply('You are not in the database.');
        }

        const userData = db.users[userId];
        let userDataString = 'Your data:\n';
        for (const [key, value] of Object.entries(userData)) {
            userDataString += `${key}: ${JSON.stringify(value, null, 2)}\n`;
        }

        await interaction.reply(userDataString);
    }
};