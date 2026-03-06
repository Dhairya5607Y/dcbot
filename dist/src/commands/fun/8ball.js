"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');

const responses = [
    "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes - definitely.",
    "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.",
    "Yes.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.",
    "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.",
    "Don't count on it.", "My reply is no.", "My sources say no.",
    "Outlook not so good.", "Very doubtful."
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question')
        .addStringOption(option => option.setName('question').setDescription('Your question').setRequired(true)),
    command: {
        name: '8ball',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const question = isSlash ? interaction.options.getString('question') : args.join(' ');
            
            if (!question) return interaction.reply({ content: 'Please ask a question!', ephemeral: true });

            const answer = responses[Math.floor(Math.random() * responses.length)];

            const embed = new EmbedBuilder()
                .setTitle('Magic 8-Ball')
                .addFields(
                    { name: 'Question', value: question },
                    { name: 'Answer', value: answer }
                )
                .setColor('#000000')
                .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/8_ball_icon.svg/1200px-8_ball_icon.svg.png')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};
