const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const egoDataPath = path.join(__dirname, '../data/ego.json');
const egoData = JSON.parse(fs.readFileSync(egoDataPath, 'utf8'));
const inventoryPath = path.join(__dirname, '../data/inventory.json');

function getDefaultItem() {
    const defaultGift = Object.keys(egoData.egogifts).find(key => key.endsWith('001'));
    const defaultWeapon = Object.keys(egoData.egoweapons).find(key => key.endsWith('001'));
    const defaultSuit = Object.keys(egoData.egosuits).find(key => key.endsWith('001'));
    return defaultGift || defaultWeapon || defaultSuit;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Manage your inventory')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View your inventory'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('equip')
                .setDescription('Equip an item from your inventory')
                .addStringOption(option => 
                    option.setName('item')
                        .setDescription('The item to equip')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unequip')
                .setDescription('Unequip the currently equipped item')),
    async execute(interaction) {
        const userId = interaction.user.id;

        // Load inventory data
        let inventoryData;
        try {
            inventoryData = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
        } catch (error) {
            inventoryData = {};
        }

        if (!inventoryData[userId]) {
            inventoryData[userId] = {
                items: [],
                equipped: null
            };
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'view') {
            const userInventory = inventoryData[userId].items;
            const equippedItem = inventoryData[userId].equipped;

            const embed = new MessageEmbed()
                .setTitle(`${interaction.user.username}'s Inventory`)
                .setDescription(userInventory.length ? userInventory.join(', ') : 'Your inventory is empty.')
                .addField('Equipped Item', equippedItem ? equippedItem : 'None', true);

            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'equip') {
            const itemToEquip = interaction.options.getString('item');

            if (!inventoryData[userId].items.includes(itemToEquip)) {
                await interaction.reply(`You don't have the item "${itemToEquip}" in your inventory.`);
                return;
            }

            inventoryData[userId].equipped = itemToEquip;

            // Save inventory data
            fs.writeFileSync(inventoryPath, JSON.stringify(inventoryData, null, 2));

            await interaction.reply(`You have equipped "${itemToEquip}".`);
        } else if (subcommand === 'unequip') {
            inventoryData[userId].equipped = getDefaultItem();

            // Save inventory data
            fs.writeFileSync(inventoryPath, JSON.stringify(inventoryData, null, 2));

            await interaction.reply(`You have unequipped your item. Default item "${inventoryData[userId].equipped}" is now equipped.`);
        }
    }
};
