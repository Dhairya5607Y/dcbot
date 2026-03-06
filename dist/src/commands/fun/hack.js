"use strict";
const { SlashCommandBuilder, ChatInputCommandInteraction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hack')
        .setDescription('Fake hack a user')
        .addUserOption(option => option.setName('user').setDescription('The user to hack').setRequired(true)),
    command: {
        name: 'hack',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const target = isSlash ? interaction.options.getUser('user') : interaction.mentions.users.first();

            if (!target) return interaction.reply({ content: 'Who do you want to hack?', ephemeral: true });

            const msg = await interaction.reply({ content: `Hacking **${target.username}**...`, fetchReply: true });

            const steps = [
                `Finding IP address...`,
                `IP found: \`192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}\``,
                `Locating login credentials...`,
                `Email: \`${target.username.toLowerCase()}@gmail.com\``,
                `Password: \`********\``,
                `Accessing DMs...`,
                `Found secret: "I like pineapples on pizza"`,
                `Uploading data to dark web...`,
                `Cleaning up traces...`,
                `**${target.username}** has been successfully hacked! 💻`
            ];

            for (const step of steps) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                await interaction.editReply({ content: step });
            }
        }
    }
};
