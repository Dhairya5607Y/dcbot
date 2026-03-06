"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('Calculate love percentage between two users')
        .addUserOption(option => option.setName('user1').setDescription('First user').setRequired(true))
        .addUserOption(option => option.setName('user2').setDescription('Second user').setRequired(false)),
    command: {
        name: 'ship',
        aliases: ['love'],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            let user1, user2;

            if (isSlash) {
                user1 = interaction.options.getUser('user1');
                user2 = interaction.options.getUser('user2') || interaction.user;
            } else {
                user1 = interaction.mentions.users.first();
                user2 = interaction.mentions.users.at(1) || interaction.author;
            }

            if (!user1) return interaction.reply({ content: 'Mention at least one user!', ephemeral: true });

            const percentage = Math.floor(Math.random() * 101);
            let status = "";
            let color = "";

            if (percentage < 25) { status = "No chance. 💔"; color = "#ff0000"; }
            else if (percentage < 50) { status = "Maybe... but unlikely. 😕"; color = "#ffa500"; }
            else if (percentage < 75) { status = "There's a spark! ✨"; color = "#ffff00"; }
            else { status = "A match made in heaven! ❤️"; color = "#00ff00"; }

            const embed = new EmbedBuilder()
                .setTitle('Love Match')
                .setDescription(`**${user1.username}** & **${user2.username}**\n\n**${percentage}%**\n${status}`)
                .setColor(color)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};
