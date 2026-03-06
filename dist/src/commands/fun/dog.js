"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dog')
        .setDescription('Get a random dog image'),
    command: {
        name: 'dog',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            try {
                const response = await axios.get('https://dog.ceo/api/breeds/image/random');
                const url = response.data.message;

                const embed = new EmbedBuilder()
                    .setTitle('🐶 Woof!')
                    .setImage(url)
                    .setColor('#00ff00')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Error fetching dog:', error);
                await interaction.reply({ content: 'Failed to fetch a dog image!', ephemeral: true });
            }
        }
    }
};
