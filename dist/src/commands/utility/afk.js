"use strict";
const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set an AFK status')
        .addStringOption(option => option.setName('reason').setDescription('The reason for being AFK').setRequired(false)),
    command: {
        name: 'afk',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const user = isSlash ? interaction.user : interaction.author;
            const reason = isSlash ? (interaction.options.getString('reason') || 'AFK') : (args.join(' ') || 'AFK');
            
            const guildId = interaction.guild.id;
            await User.findOneAndUpdate(
                { guildId, userId: user.id },
                { afk: { reason, timestamp: new Date() } },
                { upsert: true }
            );

            await interaction.reply({ content: `You are now AFK: **${reason}**` });
            
            // Try to change nickname
            if (interaction.member.manageable) {
                interaction.member.setNickname(`[AFK] ${interaction.member.displayName}`).catch(() => {});
            }
        }
    }
};
