const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lollang')
        .setDescription('Replies with Lollang!'),
    async execute(interaction) {
        await interaction.reply('Lollang!');
    },
};
