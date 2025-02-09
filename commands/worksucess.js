const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readDatabase } = require('../database.js');
const { PermissionFlagsBits } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('worksuccess')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
        .setDescription('Work on an abnormality')
        .addStringOption(option => 
            option.setName('abnormality')
                .setDescription('The name of the abnormality')
                .setRequired(true))         .addIntegerOption(option => 
            option.setName('baseprobability')
                .setDescription('The base success probability of the abnormality (0-100)')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('temperance')
                .setDescription('The temperance stat of the agent (0-400)')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('min_pe_boxes')
                .setDescription('The minimum number of PE boxes')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('max_pe_boxes')
                .setDescription('The maximum number of PE boxes')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('work_result')
                .setDescription('The work result (Bad, Normal, Good)')
                .setRequired(true)
                .addChoices(
                    { name: 'Bad', value: 'Bad' },
                    { name: 'Normal', value: 'Normal' },
                    { name: 'Good', value: 'Good' }
                ))
        .addBooleanOption(option => 
            option.setName('success')
                .setDescription('Whether the work is a success or failure')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('abno_dmg_min')
                .setDescription('The minimum damage dealt by the abnormality')
                .setRequired(false))
            .addIntegerOption(option => 
            option.setName('chancemodifier')
                .setDescription('An optional chance modifier (can be positive or negative)')
                .setRequired(false))

        .addIntegerOption(option => 
            option.setName('abno_dmg_max')
                .setDescription('The maximum damage dealt by the abnormality')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('dmg_type')
                .setDescription('The type of damage dealt by the abnormality')
                .setRequired(false)
                .addChoices(
                    { name: 'Red', value: 'Red' },
                    { name: 'White', value: 'White' },
                    { name: 'Black', value: 'Black' },
                    { name: 'Pale', value: 'Pale' }
                ))
        .addIntegerOption(option => 
            option.setName('fortitude')
                .setDescription('The fortitude stat of the agent (required for Pale damage)')
                .setRequired(false))
        .addNumberOption(option => 
            option.setName('ego_suit_endurance')
                .setDescription('The EGO suit endurance multiplier (2.0 to 0)')
                .setRequired(false))
        .addIntegerOption(option => 
            option.setName('agent_hp')
                .setDescription('The current HP percentage of the agent (0-100)')
                .setRequired(false))
        .addBooleanOption(option => 
            option.setName('favoritework')
                .setDescription('Is this the agent\'s favorite work?')
                .setRequired(false))
                .addIntegerOption(option => 
            option.setName('threatlevel')
                .setDescription('The threat level of the abnormality (1-5, Zayin to Aleph)')
                .setRequired(false)
                .addChoices(
                    { name: 'Zayin', value: 1 },
                    { name: 'Teth', value: 2 },
                    { name: 'He', value: 3 },
                    { name: 'Waw', value: 4 },
                    { name: 'Aleph', value: 5 }
                ))
        .addIntegerOption(option => 
            option.setName('ego_suit_tier')
                .setDescription('The tier of the EGO suit (1-5, Zayin to Aleph)')
                .setRequired(false)
                .addChoices(
                    { name: 'Zayin', value: 1 },
                    { name: 'Teth', value: 2 },
                    { name: 'He', value: 3 },
                    { name: 'Waw', value: 4 },
                    { name: 'Aleph', value: 5 }
                )),
    async execute(interaction) {
        
        const abnoName = interaction.options.getString('abnormality');
        const baseProbability = interaction.options.getInteger('baseprobability') || 0;
        const temperance = interaction.options.getInteger('temperance');
        const minPEBoxes = interaction.options.getInteger('min_pe_boxes');
        const maxPEBoxes = interaction.options.getInteger('max_pe_boxes');
        const workResult = interaction.options.getString('work_result');
        const success = interaction.options.getBoolean('success');
        const abnoDmgMin = interaction.options.getInteger('abno_dmg_min') || 0;
        const abnoDmgMax = interaction.options.getInteger('abno_dmg_max') || 0;
        const dmgType = interaction.options.getString('dmg_type') || 'Red';
        const fortitude = interaction.options.getInteger('fortitude') || 100; // Default fortitude if not provided
        const egoSuitEndurance = interaction.options.getNumber('ego_suit_endurance') || 1.0; // Default endurance multiplier if not provided
        const agentHP = interaction.options.getInteger('agent_hp') || 100; // Default HP percentage if not provided
        const egoSuitTier = interaction.options.getInteger('ego_suit_tier') || 5; // Default to Aleph if not provided
        const threatLevel = interaction.options.getInteger('threatlevel') || 1;
        const favoriteWork = interaction.options.getBoolean('favoritework') || false;
        const chanceModifier = interaction.options.getInteger('chancemodifier') || 0;
        

        //favorite work
        let favoritebonus = []
        if (favoriteWork == true) {favoritebonus = Math.floor(Math.random() * 10) + 1}
        // Calculate the final success rate
        const temperanceBonus = Math.min(temperance * 0.2, 80); // Max 400 temperance points
        const successRate = Math.min(baseProbability + temperanceBonus + chanceModifier + favoritebonus, 95); // Max success rate capped at 95%
        
        // Calculate PE boxes collected based on work result
        let peBoxesCollected;
        if (workResult === 'Bad') {
            peBoxesCollected = Math.floor(Math.random() * (maxPEBoxes * 0.5 - minPEBoxes + 1)) + minPEBoxes;
        } else if (workResult === 'Normal') {
            peBoxesCollected = Math.floor(Math.random() * (maxPEBoxes * 0.7 - maxPEBoxes * 0.5 + 1)) + maxPEBoxes * 0.5;
        } else {
            peBoxesCollected = Math.floor(Math.random() * (maxPEBoxes - maxPEBoxes * 0.7 + 1)) + maxPEBoxes * 0.7;
        }
        let ata = (peBoxesCollected)
        // Calculate damage taken by the agent
        let damageTakenPerPEBox = 0;
        const abnoDmg = Math.floor(Math.random() * (abnoDmgMax - abnoDmgMin + 1)) + abnoDmgMin;

        // Calculate damage modifier based on agent's current HP
        let damageModifier = 1.0;
        if (agentHP <= 10) {
            damageModifier = 1.5;
        } else if (agentHP <= 20) {
            damageModifier = 1.3;
        } else if (agentHP <= 30) {
            damageModifier = 1.1;
        } else if (agentHP <= 40) {
            damageModifier = 0.9;
        } else if (agentHP <= 50) {
            damageModifier = 0.7;
        } else if (agentHP <= 60) {
            damageModifier = 0.5;
        } else if (agentHP <= 70) {
            damageModifier = 0.4;
        }

        // Calculate tier difference multiplier
        const tierDifference = Math.max(0.3, 2.0 - Math.abs(threatLevel - egoSuitTier) * 0.2);

        if (dmgType === 'Pale') {
            damageTakenPerPEBox = Math.max(abnoDmg, Math.floor(abnoDmg * (1 - successRate / 100) * (fortitude / 100))) * egoSuitEndurance * damageModifier * tierDifference;
        } else {
            damageTakenPerPEBox = abnoDmg * (1 - successRate / 100) * egoSuitEndurance * damageModifier * tierDifference;
        }

        const totalDamageTaken = damageTakenPerPEBox * peBoxesCollected;
        const agentHPSPLeft = Math.max(0, agentHP - totalDamageTaken);
        const agentDecimalHP = Math.max(fortitude - totalDamageTaken);

        let message = "You are either dead or panicking!";
        if (agentHPSPLeft > 0) {
            message = "You are still alive!";
        }

        // Calculate possible increase of the agent's stat
        let statIncrease = 0;
        for (let i = 0; i < peBoxesCollected; i++) {
            const statIncreaseChance = successRate / 100 * (1 + (favoriteWork ? 0.1 : 0)) * (1 + (threatLevel * 0.1)) * 0.4; // 60% failure rate
            if (Math.random() <= statIncreaseChance) {
                statIncrease++;
            }
        }

        // Determine embed color based on work result
        let embedColor;
        if (workResult === 'Good') {
            embedColor = 'Green';
        } else if (workResult === 'Normal') {
            embedColor = 'Yellow';
        } else {
            embedColor = 'Red';
        }

        const embed = new EmbedBuilder()
            .setTitle(`Working on ${abnoName}`)
            .addFields(
                { name: 'Base Probability', value: `${baseProbability}%`, inline: true },
                { name: 'Temperance Stat', value: `${temperance}`, inline: true },
                { name: 'Temperance Bonus', value: `${temperanceBonus}%`, inline: true },
                { name: 'Chance Modifier', value: `${chanceModifier}`, inline: true },
                { name: 'Final Success Rate', value: `${successRate}%`, inline: true },
                { name: 'E.G.O Gift Result', value: success ? 'Success in acquisition' : 'Failure in acquisition', inline: true },
                { name: 'Work Quality', value: workResult, inline: true },
                { name: 'PE Boxes Collected', value: `${ata}/${maxPEBoxes} (max)`, inline: true },
                                { name: 'Damage Taken per N.E Box and Total Damage Taken', value: `${damageTakenPerPEBox.toFixed(2)} (${totalDamageTaken.toFixed(2)})`, inline: true },
                { name: 'Agent HP or SP Left (ignore decimal if white dmg)', value: `${agentHPSPLeft.toFixed(2)}% (${agentDecimalHP.toFixed(2)})`, inline: true },
                { name: 'Damage Type', value: `${dmgType}`, inline: true },
                { name: 'Stat Increase', value: `${statIncrease}`, inline: true },
                { name: 'Status', value: `${message}`, inline: true },
            )
            .setColor(embedColor);
        
        await interaction.reply({ embeds: [embed] });
    },
};
