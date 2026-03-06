"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');
const settings = require('../../../settings.json');

const jobs = [
    "Software Developer", "Doctor", "Teacher", "Engineer", "Farmer", "Chef", "Artist", "Writer",
    "Astronaut", "Pilot", "Police Officer", "Firefighter", "Musician", "Photographer", "Scientist",
    "Uber Driver", "Deliverer", "Streamer", "YouTuber", "Professional Gamer", "Discord Mod"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work to earn some money'),
    command: {
        name: 'work',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const user = isSlash ? interaction.user : interaction.author;
            const guildId = interaction.guild.id;
            
            let userData = await User.findOne({ guildId, userId: user.id });
            if (!userData) {
                userData = new User({ guildId, userId: user.id });
            }

            const now = Date.now();
            const lastWork = userData.lastWork ? userData.lastWork.getTime() : 0;
            const cooldown = 60 * 60 * 1000; // 1 hour

            if (now - lastWork < cooldown) {
                const remaining = cooldown - (now - lastWork);
                const minutes = Math.floor(remaining / (60 * 1000));
                const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
                return interaction.reply({ 
                    content: `You're too tired to work! Come back in ${minutes}m ${seconds}s.`, 
                    ephemeral: true 
                });
            }

            const min = settings.economy?.workMin || 50;
            const max = settings.economy?.workMax || 150;
            const amount = Math.floor(Math.random() * (max - min + 1)) + min;
            const job = jobs[Math.floor(Math.random() * jobs.length)];

            userData.wallet += amount;
            userData.lastWork = now;
            await userData.save();

            const currency = settings.economy?.currency || '💰';
            const embed = new EmbedBuilder()
                .setTitle('Work')
                .setDescription(`You worked as a **${job}** and earned **${currency} ${amount.toLocaleString()}**!`)
                .setColor('#00ff00')
                .setFooter({ text: `New Balance: ${currency} ${userData.wallet.toLocaleString()}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};
