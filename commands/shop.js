const { SlashCommandBuilder, MessageEmbed } = require('discord.js');
const { readDatabase, writeDatabase } = require('../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Buy items from the shop')
        .addStringOption(option => 
            option.setName('abno')
                .setDescription('The abnormality shop to buy from')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('item')
                .setDescription('The item to buy')
                .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const abnoName = interaction.options.getString('abno');
        const itemName = interaction.options.getString('item');
        const dbUsers = readDatabase('users.json');
        const dbAbno = readDatabase('abno.json');
        const dbEgo = readDatabase('ego.json');
        const dbInventory = readDatabase('inventory.json');

        if (!dbUsers.users[userId]) {
            return interaction.reply('You are not in the database.');
        }

        const user = dbUsers.users[userId];
        const abno = Object.values(dbAbno.abnos).find(a => a.uuid === abnoName);

        if (!abno) {
            return interaction.reply('Abnormality shop not found.');
        }

        const peBoxes = abno.pe_boxes[userId] || 0;

        let item;
        if (dbEgo.egogifts[itemName]) {
            item = dbEgo.egogifts[itemName];
        } else if (dbEgo.egoweapons[itemName]) {
            item = dbEgo.egoweapons[itemName];
        } else if (dbEgo.egosuits[itemName]) {
            item = dbEgo.egosuits[itemName];
        } else {
            return interaction.reply('Item not found.');
        }

        if (peBoxes < item.cost) {
            return interaction.reply('You do not have enough PE boxes to buy this item.');
        }

        // Deduct PE boxes and add item to inventory
        abno.pe_boxes[userId] -= item.cost;
        if (!dbInventory[userId]) {
            dbInventory[userId] = { items: [], equipped: null };
        }
        dbInventory[userId].items.push(item);

        // Save updated data
        writeDatabase('abno.json', dbAbno);
        writeDatabase('inventory.json', dbInventory);

        const embed = new MessageEmbed()
            .setTitle(`Shop - ${abno.nickname}`)
            .setDescription(`You have successfully bought ${item.name}.`)
            .addFields(
                { name: 'Item', value: item.name, inline: true },
                { name: 'Cost', value: `${item.cost} PE boxes`, inline: true },
                { name: 'Remaining PE boxes', value: `${abno.pe_boxes[userId]}`, inline: true }
            )
            .setColor('#00FF00');

        await interaction.reply({ embeds: [embed] });
    },
};