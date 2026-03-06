"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Give someone a hug')
        .addUserOption(option => option.setName('user').setDescription('The user to hug').setRequired(true)),
    command: {
        name: 'hug',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const sender = isSlash ? interaction.user : interaction.author;
            const target = isSlash ? interaction.options.getUser('user') : interaction.mentions.users.first();

            if (!target) return interaction.reply({ content: 'Who do you want to hug?', ephemeral: true });
            if (target.id === sender.id) return interaction.reply({ content: 'You can\'t hug yourself! (But here\'s a virtual hug from me ❤️)', ephemeral: true });

            // Update stats
            const guildId = interaction.guild.id;
            await User.findOneAndUpdate(
                { guildId, userId: target.id },
                { $inc: { hugs: 1 } },
                { upsert: true }
            );

            // Get GIF
            let gifUrl = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eG56eG56eG56eG56eG56eG56eG56eG56eG56eG56eG56JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3M4NpbLCTxBqU/giphy.gif';
            try {
                const response = await axios.get('https://nekos.life/api/v2/img/hug');
                gifUrl = response.data.url;
            } catch (e) { console.error('Error fetching hug gif:', e); }

            const embed = new EmbedBuilder()
                .setDescription(`**${sender.username}** gave **${target.username}** a big hug!`)
                .setImage(gifUrl)
                .setColor('#ff69b4')
                .setTimestamp();

            await interaction.reply({ content: `${target}`, embeds: [embed] });
        }
    }
};
