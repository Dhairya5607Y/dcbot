"use strict";
const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require('discord.js');

exports.data = new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Mass delete messages with filters')
    .addIntegerOption(option => option.setName('amount').setDescription('Number of messages to check (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .addStringOption(option => 
        option.setName('filter')
            .setDescription('Filter messages to delete')
            .addChoices(
                { name: 'Links', value: 'links' },
                { name: 'Invites', value: 'invites' },
                { name: 'Bots', value: 'bots' },
                { name: 'Attachments', value: 'attachments' },
                { name: 'Matches Word', value: 'word' }
            ))
    .addUserOption(option => option.setName('user').setDescription('Delete messages from a specific user'))
    .addStringOption(option => option.setName('word').setDescription('Word to match (if Matches Word filter is selected)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

exports.command = {
    name: 'purge',
    aliases: ['clear'],
    enabled: true,
    execute: async (interaction, args, client) => {
        if (!(interaction instanceof ChatInputCommandInteraction)) {
            return interaction.reply({ content: 'Advanced purge is only available via slash command!', ephemeral: true });
        }

        const amount = interaction.options.getInteger('amount');
        const filter = interaction.options.getString('filter');
        const targetUser = interaction.options.getUser('user');
        const matchWord = interaction.options.getString('word');

        let messages = await interaction.channel.messages.fetch({ limit: amount });

        if (targetUser) {
            messages = messages.filter(m => m.author.id === targetUser.id);
        }

        if (filter === 'links') {
            const linkRegex = /https?:\/\/[^\s]+/i;
            messages = messages.filter(m => linkRegex.test(m.content));
        } else if (filter === 'invites') {
            const inviteRegex = /(discord\.gg|discordapp\.com\/invite|discord\.com\/invite)\/[^\s]+/i;
            messages = messages.filter(m => inviteRegex.test(m.content));
        } else if (filter === 'bots') {
            messages = messages.filter(m => m.author.bot);
        } else if (filter === 'attachments') {
            messages = messages.filter(m => m.attachments.size > 0);
        } else if (filter === 'word' && matchWord) {
            messages = messages.filter(m => m.content.toLowerCase().includes(matchWord.toLowerCase()));
        }

        if (messages.size === 0) {
            return interaction.reply({ content: 'No messages found matching your filters!', ephemeral: true });
        }

        await interaction.channel.bulkDelete(messages, true).catch(err => {
            console.error('Error in bulkDelete:', err);
            return interaction.reply({ content: 'Failed to delete some messages (they might be older than 14 days).', ephemeral: true });
        });

        await interaction.reply({ content: `Successfully deleted **${messages.size}** messages.`, ephemeral: true });
    }
};
