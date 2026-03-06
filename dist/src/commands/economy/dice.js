"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');
const settings = require('../../../settings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll a die and bet money')
        .addIntegerOption(option => 
            option.setName('guess')
                .setDescription('Your guess (1-6)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(6))
        .addIntegerOption(option => option.setName('amount').setDescription('The amount to bet').setRequired(true).setMinValue(1)),
    command: {
        name: 'dice',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const user = isSlash ? interaction.user : interaction.author;
            const guildId = interaction.guild.id;
            
            const guess = isSlash ? interaction.options.getInteger('guess') : parseInt(args[0]);
            const bet = isSlash ? interaction.options.getInteger('amount') : parseInt(args[1]);

            if (isNaN(guess) || guess < 1 || guess > 6 || isNaN(bet) || bet <= 0) {
                return interaction.reply({ content: 'Invalid guess or bet amount!', ephemeral: true });
            }

            let userData = await User.findOne({ guildId, userId: user.id });
            if (!userData || userData.wallet < bet) {
                return interaction.reply({ content: 'You don\'t have enough money in your wallet!', ephemeral: true });
            }

            userData.wallet -= bet;
            const result = Math.floor(Math.random() * 6) + 1;
            const currency = settings.economy?.currency || '💰';
            const embed = new EmbedBuilder().setTimestamp();

            if (guess === result) {
                const winAmount = bet * 5;
                userData.wallet += winAmount;
                embed.setTitle('Dice - You Won!')
                    .setDescription(`The die landed on **${result}**!\nYou won **${currency} ${winAmount.toLocaleString()}**! (5x)`)
                    .setColor('#00ff00');
            } else {
                embed.setTitle('Dice - You Lost!')
                    .setDescription(`The die landed on **${result}**!\nYou lost **${currency} ${bet.toLocaleString()}**.`)
                    .setColor('#ff0000');
            }

            await userData.save();
            embed.setFooter({ text: `New Balance: ${currency} ${userData.wallet.toLocaleString()}` });
            await interaction.reply({ embeds: [embed] });
        }
    }
};
