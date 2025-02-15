const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readDatabase, writeDatabase } = require('../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Perform work on an abnormality')
        .addStringOption(option => 
            option.setName('abno')
                .setDescription('The abnormality to work on')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('worktype')
                .setDescription('The type of work to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'Instinct', value: 'instinct' },
                    { name: 'Insight', value: 'insight' },
                    { name: 'Attachment', value: 'attachment' },
                    { name: 'Repression', value: 'repression' }
                )),
    async execute(interaction) {
        const userId = interaction.user.id;
        const abnoName = interaction.options.getString('abno');
        const workType = interaction.options.getString('worktype');
        const dbUsers = readDatabase('users.json');
        const dbAbno = readDatabase('abno.json');
        const dbEgo = readDatabase('ego.json');

        if (!dbUsers.users[userId]) {
            return interaction.reply('You are not in the database.');
        }

        const user = dbUsers.users[userId];
        let abno = Object.values(dbAbno.abnos).find(a => a.uuid === abnoName);
        if (!abno) {
            abno = Object.values(dbAbno.abnos).find(a => a.nickname.toLowerCase() === abnoName.toLowerCase());
        }
        
        if (!abno) {
            return interaction.reply('Abnormality not found.');
        }

        // Check if user is dead or panicking
        if (user.hp <= 0) {
            return interaction.reply('You are dead and cannot perform any work.');
        }
        if (user.sp <= 0) {
            return interaction.reply('You are panicking and cannot perform any work.');
        }

        // Determine the stat to increase based on work type
        let statToIncrease;
        switch (workType) {
            case 'instinct':
                statToIncrease = 'fortitude';
                break;
            case 'insight':
                statToIncrease = 'prudence';
                break;
            case 'attachment':
                statToIncrease = 'temperance';
                break;
            case 'repression':
                statToIncrease = 'justice';
                break;
        }

        // Calculate work results
        const baseProbability = abno.baseProbability[workType];
        const statValue = user.stats.temperance;
        const statBonus = statValue * 0.2;
        let successRate = baseProbability + statBonus;
        if (successRate > 95) {
            successRate = 95;
        }
        let peBoxesCollected = 0;

        // Calculate damage based on damage type and E.G.O suit resistance
        totalDamage = 0;
        const egoSuit = dbEgo.egosuits[user.egosuit_uuid] || { resistance: 1.0, tier: 1 }; // Default resistance and tier if no suit
        const resistance = egoSuit.resistance[abno.damageType] || 1.0;
        const tierDifference = abno.tier - egoSuit.tier;
        let tierDifferenceMultiplier;
        if (tierDifference === 0) {
            tierDifferenceMultiplier = 1.0;
        } else if (tierDifference > 0) {
            tierDifferenceMultiplier = Math.min(2.0, 1.0 + (tierDifference * 0.2));
        } else {
            tierDifferenceMultiplier = Math.max(0.5, 1.0 + (tierDifference * 0.2));
        }

        for (let i = 0; i < abno.maxPEBoxes; i++) {
             let randomValue = Math.random();
             if (randomValue < successRate / 100) {
                peBoxesCollected += 1;}}
        const neBoxes = abno.maxPEBoxes - peBoxesCollected;
        let damage = abno.damagePerNEBox * resistance * tierDifferenceMultiplier;
        totalDamage = neBoxes * damage;
        switch (abno.damageType) {
            case 'white':
                user.sp -= totalDamage;
                break;
            case 'red':
                 user.hp -= totalDamage;
                 break;
            case 'black':
                 user.hp -= totalDamage;
                 user.sp -= totalDamage;
                 break;
            case 'pale':
                 totalDamage *= user.maxHp * 0.1;
                 user.hp -= totalDamage;
                 break;
                }
                if (user.hp < 0) user.hp = 0;
                if (user.sp < 0) user.sp = 0;
        const peBoxPercentage = (peBoxesCollected / abno.maxPEBoxes) * 100;
        let workResult;
        if (peBoxPercentage >= 70) {
            workResult = 'Good';
        } else if (peBoxPercentage >= 50) {
            workResult = 'Normal';
        } else {
            workResult = 'Bad';
        }
        const agentdecimalHP = user.hp;
        const agentdecimalSP = user.sp;
        let statIncrease = 0;
        for (let i = 0; i < peBoxesCollected; i++) {
            if (Math.random() < 0.3) {
            statIncrease++;
            }
        }
        const msng = workResult === 'Good' ? 'Success' : 'Failure';

        // Update user data
        user.stats[statToIncrease] += statIncrease;
        user.hp = agentdecimalHP;
        user.sp = agentdecimalSP;

        // Save P.E. boxes in the abnormality file
        if (!abno.pe_boxes) {
            abno.pe_boxes = {};
        }
        abno.pe_boxes[userId] = (abno.pe_boxes[userId] || 0) + peBoxesCollected;

        // Check for E.G.O gift acquisition
        let egoSuccess = false;
        const egoGiftId = abno.egoGifts;
        const egoGift = egoGiftId ? dbEgo.egogifts[egoGiftId] : null;
        if (egoGift && workResult === 'Good' && Math.random() * 100 < egoGift.acquisitionChance) {
            if (!user.egogifts_uuid.includes(egoGift.uuid)) {
                user.egogifts_uuid.push(egoGift.uuid);
                egoSuccess = true;
            }
        }

        // Save updated data
        writeDatabase('users.json', dbUsers);
        writeDatabase('abno.json', dbAbno);

        // Check if user is dead or panicking after taking damage
        if (user.hp <= 0) {
            user.hp = 0;
            return interaction.reply('You have died from the damage taken.');
        }
        if (user.sp <= 0) {
            user.sp = 0;
            return interaction.reply('You are panicking from the damage taken.');
        }

        const embed = new EmbedBuilder()
            .setTitle(`Working on ${abno.nickname}`)
            .addFields(
            { name: 'Base Probability', value: `${baseProbability}%`, inline: true },
            { name: 'Stat Bonus to Success (Stat Value)', value: `+${statBonus.toFixed(1)}% (${statValue})`, inline: true },
            { name: 'Final Success Rate', value: `${successRate.toFixed(1)}%`, inline: true },
            { name: 'E.G.O Gift Result', value: egoGift ? (egoSuccess ? `Success in acquisition (${egoGift.acquisitionChance}%)` : `Failure in acquisition (${egoGift.acquisitionChance}%)`) : 'No E.G.O Gift', inline: true },
            { name: 'Work Quality and PE Boxes Collected', value: `${workResult} (${peBoxesCollected}/${abno.maxPEBoxes} max)`, inline: true },
            { name: 'E.G.O Gift', value: egoGift ? egoGift.name : 'None', inline: true },
            { name: 'Damage Taken per NE Box and Total Damage Taken', value: `${abno.damagePerNEBox.toFixed(2)} (${totalDamage.toFixed(2)})`, inline: true },
            { name: 'Agent HP/SP Left', value: `HP: ${user.hp}, SP: ${user.sp}`, inline: true },
            { name: 'Damage Type', value: `${abno.damageType}`, inline: true },
            { name: 'Stat Increase', value: `${statIncrease}`, inline: true },
            { name: 'Status', value: `${msng}`, inline: true },
            )
            .setColor(workResult === 'Good' ? '#00FF00' : workResult === 'Normal' ? '#FFFF00' : '#FF0000'); // Use hex color codes

        await interaction.reply({ embeds: [embed] });
    },
};