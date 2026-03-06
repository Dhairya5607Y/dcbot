"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');
const settings = require('../../../settings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Pay another user some money')
        .addUserOption(option => option.setName('user').setDescription('The user to pay').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('The amount to pay').setRequired(true).setMinValue(1)),
    command: {
        name: 'pay',
        aliases: ['give'],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const sender = isSlash ? interaction.user : interaction.author;
            const guildId = interaction.guild.id;
            
            const target = isSlash ? interaction.options.getUser('user') : interaction.mentions.users.first();
            const amount = isSlash ? interaction.options.getInteger('amount') : parseInt(args[1]);

            if (!target || isNaN(amount) || amount <= 0) {
                return interaction.reply({ content: 'Invalid user or amount!', ephemeral: true });
            }

            if (target.id === sender.id) {
                return interaction.reply({ content: 'You cannot pay yourself!', ephemeral: true });
            }

            if (target.bot) {
                return interaction.reply({ content: 'You cannot pay bots!', ephemeral: true });
            }

            let senderData = await User.findOne({ guildId, userId: sender.id });
            if (!senderData || senderData.wallet < amount) {
                return interaction.reply({ content: 'You don\'t have enough money in your wallet!', ephemeral: true });
            }

            let targetData = await User.findOne({ guildId, userId: target.id });
            if (!targetData) {
                targetData = new User({ guildId, userId: target.id });
            }

            senderData.wallet -= amount;
            targetData.wallet += amount;

            await senderData.save();
            await targetData.save();

            const currency = settings.economy?.currency || '💰';
            const embed = new EmbedBuilder()
                .setTitle('Payment Successful')
                .setDescription(`You paid **${target.username}** **${currency} ${amount.toLocaleString()}**!`)
                .setColor('#00ff00')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};
