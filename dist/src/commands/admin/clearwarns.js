"use strict";
const { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } = require('discord.js');
const Warning = require('../../models/Warning');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearwarns')
        .setDescription('Clear all warnings for a user')
        .addUserOption(option => option.setName('user').setDescription('The user to clear warnings for').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    command: {
        name: 'clearwarns',
        aliases: ['clear-warns'],
        enabled: true,
        execute: async (interaction, args, client) => {
            const target = interaction.options.getUser('user');
            const guildId = interaction.guild.id;

            const result = await Warning.deleteMany({ guildId, userId: target.id });

            await interaction.reply({ content: `Successfully cleared **${result.deletedCount}** warnings for **${target.tag}**.` });
        }
    }
};
