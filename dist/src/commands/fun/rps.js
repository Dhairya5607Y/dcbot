"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play Rock, Paper, Scissors with the bot')
        .addStringOption(option => 
            option.setName('choice')
                .setDescription('Rock, Paper, or Scissors')
                .setRequired(true)
                .addChoices(
                    { name: 'Rock', value: 'rock' },
                    { name: 'Paper', value: 'paper' },
                    { name: 'Scissors', value: 'scissors' }
                )),
    command: {
        name: 'rps',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const choice = isSlash ? interaction.options.getString('choice') : args[0]?.toLowerCase();

            if (!choice || !['rock', 'paper', 'scissors'].includes(choice)) {
                return interaction.reply({ content: 'Invalid choice! Choose rock, paper, or scissors.', ephemeral: true });
            }

            const choices = ['rock', 'paper', 'scissors'];
            const botChoice = choices[Math.floor(Math.random() * choices.length)];

            let result = "";
            let color = "";

            if (choice === botChoice) {
                result = "It's a tie!";
                color = "#ffff00";
            } else if (
                (choice === 'rock' && botChoice === 'scissors') ||
                (choice === 'paper' && botChoice === 'rock') ||
                (choice === 'scissors' && botChoice === 'paper')
            ) {
                result = "You won! 🎉";
                color = "#00ff00";
            } else {
                result = "You lost! 😞";
                color = "#ff0000";
            }

            const embed = new EmbedBuilder()
                .setTitle('Rock, Paper, Scissors')
                .addFields(
                    { name: 'Your Choice', value: choice.charAt(0).toUpperCase() + choice.slice(1), inline: true },
                    { name: 'Bot Choice', value: botChoice.charAt(0).toUpperCase() + botChoice.slice(1), inline: true },
                    { name: 'Result', value: result }
                )
                .setColor(color)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};
