"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check your or another user\'s level and XP')
        .addUserOption(option => option.setName('user').setDescription('The user to check rank for').setRequired(false)),
    command: {
        name: 'rank',
        aliases: ['level', 'lvl'],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const target = isSlash 
                ? (interaction.options.getUser('user') || interaction.user)
                : (interaction.mentions.users.first() || interaction.author);
            
            const guildId = interaction.guild.id;
            const userData = await User.findOne({ guildId, userId: target.id });

            if (!userData) {
                return interaction.reply({ content: 'This user hasn\'t earned any XP yet!', ephemeral: true });
            }

            const xpNeeded = Math.pow((userData.level + 1) / 0.1, 2);
            const progress = (userData.xp / xpNeeded) * 100;

            const embed = new EmbedBuilder()
                .setTitle(`${target.username}'s Rank`)
                .setColor('#0099ff')
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Level', value: `\`${userData.level}\``, inline: true },
                    { name: 'XP', value: `\`${userData.xp.toLocaleString()} / ${Math.floor(xpNeeded).toLocaleString()}\``, inline: true },
                    { name: 'Progress', value: `\`${progress.toFixed(1)}%\``, inline: true },
                    { name: 'Messages', value: `\`${userData.messageCount.toLocaleString()}\``, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};
