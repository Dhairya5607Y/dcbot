"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');
const settings = require('../../../settings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward'),
    command: {
        name: 'daily',
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
            const lastDaily = userData.lastDaily ? userData.lastDaily.getTime() : 0;
            const cooldown = 24 * 60 * 60 * 1000; // 24 hours

            if (now - lastDaily < cooldown) {
                const remaining = cooldown - (now - lastDaily);
                const hours = Math.floor(remaining / (60 * 60 * 1000));
                const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
                return interaction.reply({ 
                    content: `You've already claimed your daily reward! Come back in ${hours}h ${minutes}m.`, 
                    ephemeral: true 
                });
            }

            const amount = settings.economy?.dailyAmount || 100;
            userData.wallet += amount;
            userData.lastDaily = now;
            await userData.save();

            const currency = settings.economy?.currency || '💰';
            const embed = new EmbedBuilder()
                .setTitle('Daily Reward')
                .setDescription(`You've claimed your daily reward of **${currency} ${amount.toLocaleString()}**!`)
                .setColor('#00ff00')
                .setFooter({ text: `New Balance: ${currency} ${userData.wallet.toLocaleString()}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};
