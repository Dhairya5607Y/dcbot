"use strict";
const { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('softban')
        .setDescription('Ban and immediately unban a user to clear their messages')
        .addUserOption(option => option.setName('user').setDescription('The user to softban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for softban'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    command: {
        name: 'softban',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const target = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'Softban';

            if (!target) return interaction.reply({ content: 'Please provide a valid user!', ephemeral: true });

            const member = interaction.guild.members.cache.get(target.id);
            if (member && !member.bannable) {
                return interaction.reply({ content: 'I cannot softban this user!', ephemeral: true });
            }

            await interaction.guild.members.ban(target, { deleteMessageSeconds: 7 * 24 * 60 * 60, reason });
            await interaction.guild.members.unban(target, 'Softban unban');

            await interaction.reply({ content: `Successfully softbanned **${target.tag}**. Their messages from the last 7 days have been cleared.` });
        }
    }
};
