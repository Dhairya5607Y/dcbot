"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wiki')
        .setDescription('Search Wikipedia for information')
        .addStringOption(option => option.setName('query').setDescription('What to search for').setRequired(true)),
    command: {
        name: 'wiki',
        aliases: ['wikipedia'],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const query = isSlash ? interaction.options.getString('query') : args.join(' ');

            if (!query) return interaction.reply({ content: 'Please provide a search query!', ephemeral: true });

            try {
                const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
                const data = response.data;

                if (data.type === 'disambiguation' || data.type === 'no-match') {
                    return interaction.reply({ content: 'No specific Wikipedia page found. Try a more specific query!', ephemeral: true });
                }

                const embed = new EmbedBuilder()
                    .setTitle(data.title)
                    .setURL(data.content_urls.desktop.page)
                    .setDescription(data.extract)
                    .setColor('#ffffff')
                    .setThumbnail(data.thumbnail ? data.thumbnail.source : 'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Error fetching wiki:', error);
                await interaction.reply({ content: 'Failed to find information on Wikipedia for that query!', ephemeral: true });
            }
        }
    }
};
