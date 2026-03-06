"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');
const settings = require('../../../settings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Withdraw money from your bank to your wallet')
        .addStringOption(option => option.setName('amount').setDescription('The amount to withdraw (or "all")').setRequired(true)),
    command: {
        name: 'withdraw',
        aliases: ['with'],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const user = isSlash ? interaction.user : interaction.author;
            const guildId = interaction.guild.id;
            
            let userData = await User.findOne({ guildId, userId: user.id });
            if (!userData || userData.bank <= 0) {
                return interaction.reply({ content: 'You don\'t have any money in your bank to withdraw!', ephemeral: true });
            }

            const amountInput = isSlash ? interaction.options.getString('amount') : args[0];
            let amount;

            if (amountInput.toLowerCase() === 'all' || amountInput.toLowerCase() === 'max') {
                amount = userData.bank;
            } else {
                amount = parseInt(amountInput);
                if (isNaN(amount) || amount <= 0) {
                    return interaction.reply({ content: 'Please provide a valid amount or "all".', ephemeral: true });
                }
                if (amount > userData.bank) {
                    return interaction.reply({ content: 'You don\'t have that much money in your bank!', ephemeral: true });
                }
            }

            userData.bank -= amount;
            userData.wallet += amount;
            await userData.save();

            const currency = settings.economy?.currency || '💰';
            const embed = new EmbedBuilder()
                .setTitle('Withdrawal Successful')
                .setDescription(`You withdrew **${currency} ${amount.toLocaleString()}** from your bank!`)
                .setColor('#00ff00')
                .addFields(
                    { name: 'Wallet', value: `${currency} ${userData.wallet.toLocaleString()}`, inline: true },
                    { name: 'Bank', value: `${currency} ${userData.bank.toLocaleString()}`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};
