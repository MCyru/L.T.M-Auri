const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
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
                .setDescription('Unequip the currently equipped item'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('inspect')
                .setDescription('Inspect an item from your inventory')
                .addStringOption(option => 
                    option.setName('item')
                        .setDescription('The item to inspect')
                        .setRequired(true))),
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

            const embed = new EmbedBuilder()
                .setTitle(`${interaction.user.username}'s Inventory`)
                    .setDescription(userInventory.length ? userInventory.map(item => item.name).join(', ') : 'Your inventory is empty.');
    
                if (equippedItem) {
                    embed.addFields({ name: 'Equipped Items', value: Object.values(equippedItem).map(item => item.name).join(', '), inline: false });
                }

            const equippedItems = inventoryData[userId].equipped || {};
            for (const [slot, item] of Object.entries(equippedItems)) {
                embed.addFields({ name: `Equipped ${slot}`, value: item ? item.name : 'None', inline: true });
            }

            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'equip') {
            const itemToEquip = interaction.options.getString('item');
            const item = inventoryData[userId].items.find(i => i.name === itemToEquip);

            if (!item) {
                await interaction.reply(`You don't have the item "${itemToEquip}" in your inventory.`);
                return;
            }

            const slot = item.type + (item.sub_type ? `_${item.sub_type}` : '');
            inventoryData[userId].equipped = inventoryData[userId].equipped || {};
            inventoryData[userId].equipped[slot] = item;

            // Save inventory data
            fs.writeFileSync(inventoryPath, JSON.stringify(inventoryData, null, 2));

            await interaction.reply(`You have equipped "${itemToEquip}".`);
        } else if (subcommand === 'unequip') {
            inventoryData[userId].equipped = getDefaultItem();

            // Save inventory data
            fs.writeFileSync(inventoryPath, JSON.stringify(inventoryData, null, 2));

            await interaction.reply(`You have unequipped your item. Default item "${inventoryData[userId].equipped}" is now equipped.`);
        } else if (subcommand === 'inspect') {
            const itemToInspect = interaction.options.getString('item');
            const item = inventoryData[userId].items.find(i => i.name === itemToInspect);

            if (!item) {
                await interaction.reply(`You don't have the item "${itemToInspect}" in your inventory.`);
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle(`Inspecting ${item.name}`)
                .addFields(
                    { name: 'Name', value: item.name, inline: true },
                    { name: 'Type', value: item.type, inline: true },
                    { name: 'Subtype', value: item.sub_type || 'None', inline: true },
                    { name: 'Attributes', value: JSON.stringify(item.attributes, null, 2), inline: false }
                );

            await interaction.reply({ embeds: [embed] });
        }
    }
};
