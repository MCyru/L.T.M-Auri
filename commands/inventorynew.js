const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readDatabase, writeDatabase } = require('../database.js');

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
                .setName('inspect')
                .setDescription('Inspect an item in your inventory')
                .addStringOption(option => 
                    option.setName('item')
                        .setDescription('The name of the item to inspect')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('equip')
                .setDescription('Equip an item from your inventory')
                .addStringOption(option => 
                    option.setName('item')
                        .setDescription('The name of the item to equip')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unequip')
                .setDescription('Unequip an item from your inventory')
                .addStringOption(option => 
                    option.setName('item')
                        .setDescription('The name of the item to unequip')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('itemtype')
                        .setDescription('The type of item to unequip')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Weapon or Suit', value: 'ws' },
                            { name: 'Gifts', value: 'gifts' }
                        ))),
    async execute(interaction) {
        const userId = interaction.user.id;
        const dbInventory = readDatabase('inventory.json');
        const dbEgo = readDatabase('ego.json');

        if (!dbInventory[userId]) {
            dbInventory[userId] = { 
                items: [
                    { item_id: '01-00-001' }, 
                    { item_id: '02-00-001' }, 
                    { item_id: '03-00-001' }
                ], 
                equipped: {} 
            };
            writeDatabase('inventory.json', dbInventory);
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'view') {
            const userInventory = dbInventory[userId].items;
            const dbUsers = readDatabase('users.json');
            const characterName = dbUsers.users[userId].nickname;

            const weapons = userInventory.filter(item => dbEgo.egoweapons[item.item_id]).map(item => dbEgo.egoweapons[item.item_id].name);
            const suits = userInventory.filter(item => dbEgo.egosuits[item.item_id]).map(item => dbEgo.egosuits[item.item_id].name);
            const gifts = userInventory.filter(item => dbEgo.egogifts[item.item_id]).map(item => dbEgo.egogifts[item.item_id].name);

            const equippedItems = dbInventory[userId].equipped;
            const equippedWeapons = Object.values(equippedItems).filter(item => dbEgo.egoweapons[item.item_id]).map(item => dbEgo.egoweapons[item.item_id].name);
            const equippedSuits = Object.values(equippedItems).filter(item => dbEgo.egosuits[item.item_id]).map(item => dbEgo.egosuits[item.item_id].name);
            
            const equippedNormalGifts = Object.values(equippedItems.gifts).filter(item => dbEgo.egogifts[item.item_id] && dbEgo.egogifts[item.item_id].sub_type === 'normal').map(item => dbEgo.egogifts[item.item_id].name);
            const equippedPSyncGifts = Object.values(equippedItems.gifts).filter(item => dbEgo.egogifts[item.item_id] && dbEgo.egogifts[item.item_id].sub_type === 'psync').map(item => dbEgo.egogifts[item.item_id].name);
            const equippedFusionGifts = Object.values(equippedItems.gifts).filter(item => dbEgo.egogifts[item.item_id] && dbEgo.egogifts[item.item_id].sub_type === 'fusion').map(item => dbEgo.egogifts[item.item_id].name);
            const equippedSyncGifts = Object.values(equippedItems.gifts).filter(item => dbEgo.egogifts[item.item_id] && dbEgo.egogifts[item.item_id].sub_type === 'sync').map(item => dbEgo.egogifts[item.item_id].name);


            const embed = new EmbedBuilder()
                .setTitle(`${characterName}'s Inventory`)
                .setColor('#00FF00')
                .addFields(
                    { name: 'Weapons', value: weapons.join(', ') || 'None', inline: true },
                    { name: 'Suits', value: suits.join(', ') || 'None', inline: true },
                    { name: 'Gifts', value: gifts.join(', ') || 'None', inline: false },
                    { name: 'Equipped Weapons', value: equippedWeapons.join(', ') || 'None', inline: true },
                    { name: 'Equipped Suits', value: equippedSuits.join(', ') || 'None', inline: true }
                );

            if (equippedNormalGifts.length > 0) {
                embed.addFields({ name: 'Equipped Normal Gifts', value: equippedNormalGifts.join(', '), inline: true });
            }
            if (equippedPSyncGifts.length > 0) {
                embed.addFields({ name: 'Equipped PSync Gifts', value: equippedPSyncGifts.join(', '), inline: true });
            }
            if (equippedFusionGifts.length > 0) {
                embed.addFields({ name: 'Equipped Fusion Gifts', value: equippedFusionGifts.join(', '), inline: true });
            }
            if (equippedSyncGifts.length > 0) {
                embed.addFields({ name: 'Equipped Sync Gifts', value: equippedSyncGifts.join(', '), inline: true });
            }

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'inspect') {
            const itemName = interaction.options.getString('item').toLowerCase();
            const userInventory = dbInventory[userId].items;
            const item = userInventory.find(item => {
                const egoItem = dbEgo.egogifts[item.item_id] || dbEgo.egoweapons[item.item_id] || dbEgo.egosuits[item.item_id];
                return egoItem && egoItem.name.toLowerCase() === itemName;
            });

            if (!item) {
                return interaction.reply('Item not found in your inventory.');
            }

            const egoItem = dbEgo.egogifts[item.item_id] || dbEgo.egoweapons[item.item_id] || dbEgo.egosuits[item.item_id];
            const embed = new EmbedBuilder()
                .setTitle(egoItem.name)
                .setDescription(egoItem.description || 'No description available')
                .addFields(
                    { name: 'Type', value: egoItem.type || 'Unknown', inline: true }
                )
                .setColor('#00FF00');

            if (egoItem.type === 'gift') {
                embed.addFields(
                    { name: 'Subtype', value: egoItem.sub_type || 'None', inline: true }
                );
            }

            if (egoItem.type === 'gift') {
                embed.addFields(
                    { name: 'Stats +', value: egoItem.stats ? Object.entries(egoItem.stats).map(([key, value]) => `${key}: ${value}`).join('\n') : 'No stats available', inline: true }
                );
            } else if (egoItem.type === 'weapon') {
                embed.addFields(
                    { name: 'Subtype', value: egoItem.sub_type || 'None', inline: true },
                    { name: 'Damage', value: egoItem.damage.toString(), inline: true },
                    { name: 'Damage Type', value: egoItem.damageType, inline: true },
                    { name: 'Tier', value: egoItem.tier.toString(), inline: true }
                );
            } else if (egoItem.type === 'suit') {
                embed.addFields(
                    { name: 'Subtype', value: egoItem.sub_type || 'None', inline: true },
                    { name: 'Tier', value: egoItem.tier.toString(), inline: true },
                    { name: 'Resistance', value: egoItem.resistance ? Object.entries(egoItem.resistance).map(([key, value]) => `${key}: ${value.toFixed(1)}`).join('\n') : 'No resistance available', inline: true }
                );
            }

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'equip') {
            const itemName = interaction.options.getString('item').toLowerCase();
            const userInventory = dbInventory[userId].items;
            const item = userInventory.find(item => {
                const egoItem = dbEgo.egogifts[item.item_id] || dbEgo.egoweapons[item.item_id] || dbEgo.egosuits[item.item_id];
                return egoItem && egoItem.name.toLowerCase() === itemName;
            });

            if (!item) {
                return interaction.reply('Item not found in your inventory.');
            }

            const egoItem = dbEgo.egogifts[item.item_id] || dbEgo.egoweapons[item.item_id] || dbEgo.egosuits[item.item_id];
            const itemType = egoItem.type;
            const itemSubType = egoItem.sub_type;

            if (itemType === 'gift') {
                const equippedGifts = Object.values(dbInventory[userId].equipped.gifts).filter(equippedItem => {
                    const equippedEgoItem = dbEgo.egogifts[equippedItem.item_id];
                    return equippedEgoItem && equippedEgoItem.type === 'gift';
                });
            
                if (equippedGifts.some(equippedItem => equippedItem.item_id === item.item_id)) {
                    return interaction.reply('This item is already equipped.');
                }
            
                if (itemSubType === 'psync') {
                    const totalSlots = equippedGifts.length + (dbInventory[userId].equipped.gifts['psync'] ? 2 : 0);
                    if (totalSlots >= 9) {
                        return interaction.reply('You cannot equip more gifts or PSync items.');
                    }
                    dbInventory[userId].equipped.gifts['psync'] = item;
                } else {
                    const totalSlots = equippedGifts.length + (dbInventory[userId].equipped.gifts['psync'] ? 2 : 0);
                    if (totalSlots >= 8) {
                        return interaction.reply('You cannot equip more gifts.');
                    }
                    const universalSlots = equippedGifts.filter(equippedItem => equippedItem.sub_type !== 'psync').length;
                    if (universalSlots >= 5) {
                        return interaction.reply('You cannot equip more universal gifts.');
                    }
                    dbInventory[userId].equipped.gifts[`gifts_${itemSubType}_${equippedGifts.length}`] = item;
                }
            } else {
                if (dbInventory[userId].equipped[itemType]) {
                    return interaction.reply(`You already have a ${itemType} equipped.`);
                }
                dbInventory[userId].equipped[itemType] = item;
            }

            writeDatabase('inventory.json', dbInventory);
            await interaction.reply(`You have equipped ${egoItem.name}.`);

        } else if (subcommand === 'unequip') {
            const itemName = interaction.options.getString('item').toLowerCase();
            const itemType = interaction.options.getString('itemtype').toLowerCase();
            const equippedItems = dbInventory[userId].equipped;
            if (!equippedItems) {
                return interaction.reply('You have no equipped items.');
            } 
        
            let itemKey;
        
            // Check for equipped items in both the main equipped object and the gifts sub-object
            for (const key in equippedItems) {
                const egoItem = dbEgo.egogifts[equippedItems[key].item_id] || dbEgo.egoweapons[equippedItems[key].item_id] || dbEgo.egosuits[equippedItems[key].item_id];
                if (egoItem && egoItem.name.toLowerCase() === itemName) {
                    itemKey = key;
                    break;
                }
            }
        
            if (!itemKey && equippedItems.gifts) {
                for (const key in equippedItems.gifts) {
                    const egoItem = dbEgo.egogifts[equippedItems.gifts[key].item_id] || dbEgo.egoweapons[equippedItems.gifts[key].item_id] || dbEgo.egosuits[equippedItems.gifts[key].item_id];
                    if (egoItem && egoItem.name.toLowerCase() === itemName) {
                        itemKey = key;
                        break;
                    }
                }
            }
        
            if (!itemKey) {
                return interaction.reply('Item not found in your equipped items.');
            }
        
            if (equippedItems[itemKey]) {
                delete dbInventory[userId].equipped[itemKey];
            } else if (equippedItems.gifts && equippedItems.gifts[itemKey]) {
                delete dbInventory[userId].equipped.gifts[itemKey];
            }
        
            writeDatabase('inventory.json', dbInventory);
            await interaction.reply(`You have unequipped ${itemName}.`);
        }
    }
};