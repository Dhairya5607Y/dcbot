"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');
const settings = require('../../../settings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin and bet money')
        .addStringOption(option => 
            option.setName('choice')
                .setDescription('Heads or Tails')
                .setRequired(true)
                .addChoices(
                    { name: 'Heads', value: 'heads' },
                    { name: 'Tails', value: 'tails' }
                ))
        .addIntegerOption(option => option.setName('amount').setDescription('The amount to bet').setRequired(true).setMinValue(1)),
    command: {
        name: 'coinflip',
        aliases: ['cf'],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const user = isSlash ? interaction.user : interaction.author;
            const guildId = interaction.guild.id;
            
            const choice = isSlash ? interaction.options.getString('choice') : args[0]?.toLowerCase();
            const bet = isSlash ? interaction.options.getInteger('amount') : parseInt(args[1]);

            if (!choice || !['heads', 'tails'].includes(choice) || isNaN(bet) || bet <= 0) {
                return interaction.reply({ content: 'Invalid choice or bet amount!', ephemeral: true });
            }

            let userData = await User.findOne({ guildId, userId: user.id });
            if (!userData || userData.wallet < bet) {
                return interaction.reply({ content: 'You don\'t have enough money in your wallet!', ephemeral: true });
            }

            userData.wallet -= bet;
            const result = Math.random() < 0.5 ? 'heads' : 'tails';
            const currency = settings.economy?.currency || '💰';
            const embed = new EmbedBuilder().setTimestamp();

            if (choice === result) {
                const winAmount = bet * 2;
                userData.wallet += winAmount;
                embed.setTitle('Coinflip - You Won!')
                    .setDescription(`The coin landed on **${result}**!\nYou won **${currency} ${winAmount.toLocaleString()}**!`)
                    .setColor('#00ff00');
            } else {
                embed.setTitle('Coinflip - You Lost!')
                    .setDescription(`The coin landed on **${result}**!\nYou lost **${currency} ${bet.toLocaleString()}**.`)
                    .setColor('#ff0000');
            }

            await userData.save();
            embed.setFooter({ text: `New Balance: ${currency} ${userData.wallet.toLocaleString()}` });
            await interaction.reply({ embeds: [embed] });
        }
    }
};
