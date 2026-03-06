"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const StoreItem = require('../../models/StoreItem');
const settings = require('../../../settings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('View items for sale in the shop'),
    command: {
        name: 'shop',
        aliases: ['store'],
        enabled: true,
        execute: async (interaction, args, client) => {
            const guildId = interaction.guild.id;
            const items = await StoreItem.find({ guildId });

            const currency = settings.economy?.currency || '💰';
            const embed = new EmbedBuilder()
                .setTitle(`${interaction.guild.name} Shop`)
                .setColor('#0099ff')
                .setTimestamp();

            if (items.length === 0) {
                embed.setDescription('The shop is currently empty! Admins can add items via the dashboard.');
            } else {
                items.forEach(item => {
                    embed.addFields({
                        name: `${item.name} (ID: ${item.itemId})`,
                        value: `Price: ${currency} ${item.price.toLocaleString()}\nDescription: ${item.description || 'No description'}\nStock: ${item.stock === -1 ? 'Infinite' : item.stock}`,
                        inline: false
                    });
                });
                embed.setFooter({ text: 'Use /buy <itemId> to purchase an item!' });
            }

            await interaction.reply({ embeds: [embed] });
        }
    }
};
