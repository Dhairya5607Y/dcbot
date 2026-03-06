"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');
const settings = require('../../../settings.json');

exports.data = new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your or another user\'s balance')
    .addUserOption(option => 
        option.setName('user')
            .setDescription('The user to check balance for')
            .setRequired(false));

exports.command = {
    name: 'balance',
    aliases: ['bal', 'money'],
    enabled: true,
    execute: async (interaction, args, client) => {
        const isSlash = interaction instanceof ChatInputCommandInteraction;
        const target = isSlash 
            ? (interaction.options.getUser('user') || interaction.user)
            : (interaction.mentions.users.first() || interaction.author);
        
        const guildId = interaction.guild.id;
        let userData = await User.findOne({ guildId, userId: target.id });
        
        if (!userData) {
            userData = new User({ guildId, userId: target.id });
            await userData.save();
        }

        const currency = settings.economy?.currency || '💰';
        const embed = new EmbedBuilder()
            .setTitle(`${target.username}'s Balance`)
            .setColor('#00ff00')
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Wallet', value: `${currency} ${userData.wallet.toLocaleString()}`, inline: true },
                { name: 'Bank', value: `${currency} ${userData.bank.toLocaleString()}`, inline: true },
                { name: 'Total', value: `${currency} ${(userData.wallet + userData.bank).toLocaleString()}`, inline: true }
            )
            .setFooter({ text: `Requested by ${isSlash ? interaction.user.username : interaction.author.username}` })
            .setTimestamp();

        if (isSlash) {
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply({ embeds: [embed] });
        }
    }
};
