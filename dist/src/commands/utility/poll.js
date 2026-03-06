"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll with up to 5 options')
        .addStringOption(option => option.setName('question').setDescription('The question for the poll').setRequired(true))
        .addStringOption(option => option.setName('option1').setDescription('First option').setRequired(true))
        .addStringOption(option => option.setName('option2').setDescription('Second option').setRequired(true))
        .addStringOption(option => option.setName('option3').setDescription('Third option').setRequired(false))
        .addStringOption(option => option.setName('option4').setDescription('Fourth option').setRequired(false))
        .addStringOption(option => option.setName('option5').setDescription('Fifth option').setRequired(false)),
    command: {
        name: 'poll',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            if (!(interaction instanceof ChatInputCommandInteraction)) {
                return interaction.reply({ content: 'Poll command is only available as a slash command!', ephemeral: true });
            }

            const question = interaction.options.getString('question');
            const options = [
                interaction.options.getString('option1'),
                interaction.options.getString('option2'),
                interaction.options.getString('option3'),
                interaction.options.getString('option4'),
                interaction.options.getString('option5')
            ].filter(opt => opt !== null);

            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
            let desc = "";
            for (let i = 0; i < options.length; i++) {
                desc += `${emojis[i]} ${options[i]}\n\n`;
            }

            const embed = new EmbedBuilder()
                .setTitle(`📊 ${question}`)
                .setDescription(desc)
                .setColor('#0099ff')
                .setFooter({ text: `Poll by ${interaction.user.username}` })
                .setTimestamp();

            const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
            
            for (let i = 0; i < options.length; i++) {
                await msg.react(emojis[i]);
            }
        }
    }
};
