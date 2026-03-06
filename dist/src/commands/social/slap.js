"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slap')
        .setDescription('Give someone a slap')
        .addUserOption(option => option.setName('user').setDescription('The user to slap').setRequired(true)),
    command: {
        name: 'slap',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const sender = isSlash ? interaction.user : interaction.author;
            const target = isSlash ? interaction.options.getUser('user') : interaction.mentions.users.first();

            if (!target) return interaction.reply({ content: 'Who do you want to slap?', ephemeral: true });
            if (target.id === sender.id) return interaction.reply({ content: 'Why would you slap yourself?', ephemeral: true });

            const guildId = interaction.guild.id;
            await User.findOneAndUpdate(
                { guildId, userId: target.id },
                { $inc: { slaps: 1 } },
                { upsert: true }
            );

            let gifUrl = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eG56eG56eG56eG56eG56eG56eG56eG56eG56eG56JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/Gf3AUz3eBNbTW/giphy.gif';
            try {
                const response = await axios.get('https://nekos.life/api/v2/img/slap');
                gifUrl = response.data.url;
            } catch (e) { console.error('Error fetching slap gif:', e); }

            const embed = new EmbedBuilder()
                .setDescription(`**${sender.username}** slapped **${target.username}**! Ouch!`)
                .setImage(gifUrl)
                .setColor('#ff0000')
                .setTimestamp();

            await interaction.reply({ content: `${target}`, embeds: [embed] });
        }
    }
};
