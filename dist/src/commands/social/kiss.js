"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('Give someone a kiss')
        .addUserOption(option => option.setName('user').setDescription('The user to kiss').setRequired(true)),
    command: {
        name: 'kiss',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const sender = isSlash ? interaction.user : interaction.author;
            const target = isSlash ? interaction.options.getUser('user') : interaction.mentions.users.first();

            if (!target) return interaction.reply({ content: 'Who do you want to kiss?', ephemeral: true });
            if (target.id === sender.id) return interaction.reply({ content: 'You can\'t kiss yourself!', ephemeral: true });

            const guildId = interaction.guild.id;
            await User.findOneAndUpdate(
                { guildId, userId: target.id },
                { $inc: { kisses: 1 } },
                { upsert: true }
            );

            let gifUrl = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eG56eG56eG56eG56eG56eG56eG56eG56eG56eG56JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/lTQF0ODLLjhza/giphy.gif';
            try {
                const response = await axios.get('https://nekos.life/api/v2/img/kiss');
                gifUrl = response.data.url;
            } catch (e) { console.error('Error fetching kiss gif:', e); }

            const embed = new EmbedBuilder()
                .setDescription(`**${sender.username}** kissed **${target.username}**!`)
                .setImage(gifUrl)
                .setColor('#ff0000')
                .setTimestamp();

            await interaction.reply({ content: `${target}`, embeds: [embed] });
        }
    }
};
