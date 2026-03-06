"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Get a random meme from Reddit'),
    command: {
        name: 'meme',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            try {
                const response = await axios.get('https://meme-api.com/gimme');
                const { title, url, postLink, subreddit, ups } = response.data;

                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setURL(postLink)
                    .setImage(url)
                    .setColor('#00ff00')
                    .setFooter({ text: `r/${subreddit} | 👍 ${ups}` })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Error fetching meme:', error);
                await interaction.reply({ content: 'Failed to fetch a meme. Try again later!', ephemeral: true });
            }
        }
    }
};
