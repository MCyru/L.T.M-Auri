const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Provides information about available commands'),
    async execute(interaction) {
        const helpMessage = `
**Available Commands:**
/help - Provides information about available commands
/inventory - Manage your inventory
/checkdata - Check your own data
/setuser - Set a user field in the database
/adduser - Add or update a user in the database
/work - Perform work on an abnormality
/usercheckdata - Check anyone's data (Admin only)
        `;
        await interaction.reply({ content: helpMessage, ephemeral: true });
    }
};