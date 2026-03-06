"use strict";
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChatInputCommandInteraction } = require('discord.js');
const settings = require('../../../settings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify-setup')
        .setDescription('Set up the verification system in a channel')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to send verification message to').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    command: {
        name: 'verify-setup',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const channel = interaction.options.getChannel('channel');
            const config = settings.verification || {};

            const embed = new EmbedBuilder()
                .setTitle('Server Verification')
                .setDescription(config.message || 'Click the button below to verify and gain access to the server!')
                .setColor('#00ff00')
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('verify_user')
                        .setLabel(config.buttonLabel || 'Verify Me')
                        .setStyle(ButtonStyle.Success)
                );

            await channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: `Verification message sent to ${channel}!`, ephemeral: true });
        }
    }
};
