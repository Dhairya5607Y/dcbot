"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require('discord.js');

exports.data = new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set the slowmode for a channel')
    .addIntegerOption(option => option.setName('seconds').setDescription('Number of seconds for slowmode (0 to disable)').setRequired(true).setMinValue(0).setMaxValue(21600))
    .addChannelOption(option => option.setName('channel').setDescription('The channel to set slowmode for (defaults to current)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

exports.command = {
    name: 'slowmode',
    aliases: ['sm'],
    enabled: true,
    execute: async (interaction, args, client) => {
        const isSlash = interaction instanceof ChatInputCommandInteraction;
        const seconds = isSlash ? interaction.options.getInteger('seconds') : parseInt(args[0]);
        const channel = isSlash ? (interaction.options.getChannel('channel') || interaction.channel) : interaction.channel;

        if (isNaN(seconds) || seconds < 0) return interaction.reply({ content: 'Please provide a valid number of seconds!', ephemeral: true });

        await channel.setRateLimitPerUser(seconds, `Slowmode set by ${isSlash ? interaction.user.tag : interaction.author.tag}`);

        const embed = new EmbedBuilder()
            .setTitle('Slowmode Updated')
            .setDescription(`Successfully set slowmode to **${seconds}** seconds for **#${channel.name}**.`)
            .setColor('#00ff00')
            .setTimestamp();

        if (seconds === 0) embed.setDescription(`Successfully disabled slowmode for **#${channel.name}**.`);

        await interaction.reply({ embeds: [embed] });
    }
};
