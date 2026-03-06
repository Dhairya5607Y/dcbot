"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snipe')
        .setDescription('Retrieve the last deleted message in this channel'),
    command: {
        name: 'snipe',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const snipe = client.snipes.get(interaction.channel.id);

            if (!snipe) {
                return interaction.reply({ content: 'There is nothing to snipe in this channel!', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setAuthor({ name: snipe.author.tag, iconURL: snipe.author.displayAvatarURL({ dynamic: true }) })
                .setDescription(snipe.content || '[No text content]')
                .setColor('#0099ff')
                .setFooter({ text: `Sent <t:${Math.floor(snipe.timestamp / 1000)}:R>` });

            if (snipe.image) embed.setImage(snipe.image);

            await interaction.reply({ embeds: [embed] });
        }
    }
};
