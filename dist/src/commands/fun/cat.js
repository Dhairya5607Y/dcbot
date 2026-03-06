"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat')
        .setDescription('Get a random cat image'),
    command: {
        name: 'cat',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            try {
                const response = await axios.get('https://api.thecatapi.com/v1/images/search');
                const url = response.data[0].url;

                const embed = new EmbedBuilder()
                    .setTitle('🐱 Meow!')
                    .setImage(url)
                    .setColor('#00ff00')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Error fetching cat:', error);
                await interaction.reply({ content: 'Failed to fetch a cat image!', ephemeral: true });
            }
        }
    }
};
