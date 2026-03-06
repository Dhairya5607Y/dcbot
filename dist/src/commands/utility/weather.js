"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Get real-time weather for a city')
        .addStringOption(option => option.setName('city').setDescription('The city to check weather for').setRequired(true)),
    command: {
        name: 'weather',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const city = isSlash ? interaction.options.getString('city') : args.join(' ');

            if (!city) return interaction.reply({ content: 'Please provide a city name!', ephemeral: true });

            try {
                // Using a public free API (wttr.in) which doesn't require a key for basic JSON
                const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
                const data = response.data.current_condition[0];
                const area = response.data.nearest_area[0];

                const embed = new EmbedBuilder()
                    .setTitle(`Weather in ${area.areaName[0].value}, ${area.country[0].value}`)
                    .addFields(
                        { name: 'Temperature', value: `${data.temp_C}°C / ${data.temp_F}°F`, inline: true },
                        { name: 'Condition', value: data.weatherDesc[0].value, inline: true },
                        { name: 'Humidity', value: `${data.humidity}%`, inline: true },
                        { name: 'Wind Speed', value: `${data.windspeedKmph} km/h`, inline: true },
                        { name: 'Feels Like', value: `${data.FeelsLikeC}°C`, inline: true }
                    )
                    .setColor('#0099ff')
                    .setThumbnail(`https://www.wttr.in/${encodeURIComponent(city)}_0pq.png`) // Basic icon
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('Error fetching weather:', error);
                await interaction.reply({ content: 'Failed to fetch weather data for that location!', ephemeral: true });
            }
        }
    }
};
