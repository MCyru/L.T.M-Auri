const { SlashCommandBuilder } = require('discord.js');
const { readDatabase } = require('../database.js');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageEvents)
        .setName('usercheckdata')
        .setDescription('Check anyone data')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to set data for')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const userId = user.id;
        const db = readDatabase('users.json');

        if (!db.users[userId]) {
            return interaction.reply('Not in the database.');
        }

        const userData = db.users[userId];
        let userDataString = 'Data retrieved:\n';
        for (const [key, value] of Object.entries(userData)) {
            userDataString += `${key}: ${JSON.stringify(value, null, 2)}\n`;
        }

        await interaction.reply(userDataString);
    }
};