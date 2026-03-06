"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');
const settings = require('../../../settings.json');

exports.data = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top users in the server')
    .addStringOption(option => 
        option.setName('type')
            .setDescription('Type of leaderboard')
            .setRequired(true)
            .addChoices(
                { name: 'Economy (Rich)', value: 'economy' },
                { name: 'Leveling (XP)', value: 'leveling' },
                { name: 'Reputation', value: 'rep' }
            ));

exports.command = {
    name: 'leaderboard',
    aliases: ['lb', 'top'],
    enabled: true,
    execute: async (interaction, args, client) => {
        const isSlash = interaction instanceof ChatInputCommandInteraction;
        const type = isSlash ? interaction.options.getString('type') : (args[0] || 'economy');
        const guildId = interaction.guild.id;

        let users;
        let title = "";
        let currency = settings.economy?.currency || '💰';

        if (type === 'economy') {
            users = await User.find({ guildId }).sort({ wallet: -1, bank: -1 }).limit(10);
            title = "💰 Economy Leaderboard";
        } else if (type === 'leveling') {
            users = await User.find({ guildId }).sort({ xp: -1 }).limit(10);
            title = "📈 Leveling Leaderboard";
        } else {
            users = await User.find({ guildId }).sort({ reputation: -1 }).limit(10);
            title = "⭐ Reputation Leaderboard";
        }

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setColor('#0099ff')
            .setTimestamp();

        if (users.length === 0) {
            embed.setDescription('No data found for this leaderboard.');
        } else {
            let desc = "";
            for (let i = 0; i < users.length; i++) {
                const u = users[i];
                let userTag = "Unknown User";
                try {
                    const fetchedUser = await client.users.fetch(u.userId);
                    userTag = fetchedUser.tag;
                } catch (e) {}

                if (type === 'economy') {
                    desc += `**${i + 1}.** ${userTag} - ${currency} ${(u.wallet + u.bank).toLocaleString()}\n`;
                } else if (type === 'leveling') {
                    desc += `**${i + 1}.** ${userTag} - Level ${u.level} (${u.xp.toLocaleString()} XP)\n`;
                } else {
                    desc += `**${i + 1}.** ${userTag} - ${u.reputation} Rep\n`;
                }
            }
            embed.setDescription(desc);
        }

        await interaction.reply({ embeds: [embed] });
    }
};
