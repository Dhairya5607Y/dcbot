"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, PermissionFlagsBits } = require('discord.js');

exports.data = new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Delete and recreate a channel (clears all messages)')
    .addChannelOption(option => option.setName('channel').setDescription('The channel to nuke (defaults to current)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

exports.command = {
    name: 'nuke',
    aliases: [],
    enabled: true,
    execute: async (interaction, args, client) => {
        const isSlash = interaction instanceof ChatInputCommandInteraction;
        const channel = isSlash ? (interaction.options.getChannel('channel') || interaction.channel) : interaction.channel;

        if (!channel.isTextBased()) return interaction.reply({ content: 'I can only nuke text-based channels!', ephemeral: true });

        const position = channel.position;
        const parent = channel.parent;
        const name = channel.name;
        const topic = channel.topic;
        const nsfw = channel.nsfw;
        const overwrites = channel.permissionOverwrites.cache;

        await interaction.reply({ content: `☢️ Nuking **#${name}**...` });

        try {
            const newChannel = await channel.clone({
                name,
                parent,
                position,
                topic,
                nsfw,
                permissionOverwrites: overwrites,
                reason: 'Nuke command executed'
            });

            await channel.delete('Nuke command executed');

            const embed = new EmbedBuilder()
                .setTitle('☢️ Channel Nuked')
                .setDescription(`This channel was recreated by **${isSlash ? interaction.user.username : interaction.author.username}**.`)
                .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eG56eG56eG56eG56eG56eG56eG56eG56eG56eG56eG56JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/HhTXt43pk1I1W/giphy.gif')
                .setColor('#ff0000')
                .setTimestamp();

            await newChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in nuke command:', error);
            await interaction.editReply({ content: 'Failed to nuke the channel! Make sure I have the necessary permissions.' });
        }
    }
};
