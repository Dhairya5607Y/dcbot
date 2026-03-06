"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');
const StoreItem = require('../../models/StoreItem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View your items')
        .addUserOption(option => option.setName('user').setDescription('The user to view inventory for').setRequired(false)),
    command: {
        name: 'inventory',
        aliases: ['inv'],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const target = isSlash 
                ? (interaction.options.getUser('user') || interaction.user)
                : (interaction.mentions.users.first() || interaction.author);
            
            const guildId = interaction.guild.id;
            const userData = await User.findOne({ guildId, userId: target.id });

            const embed = new EmbedBuilder()
                .setTitle(`${target.username}'s Inventory`)
                .setColor('#0099ff')
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            if (!userData || !userData.inventory || userData.inventory.length === 0) {
                embed.setDescription('This inventory is empty!');
            } else {
                const itemDetails = await StoreItem.find({ guildId, itemId: { $in: userData.inventory.map(i => i.itemId) } });
                
                let desc = "";
                userData.inventory.forEach(invItem => {
                    const detail = itemDetails.find(d => d.itemId === invItem.itemId);
                    const name = detail ? detail.name : invItem.itemId;
                    desc += `**${name}** (x${invItem.count}) - ID: \`${invItem.itemId}\`\n`;
                });
                embed.setDescription(desc);
            }

            await interaction.reply({ embeds: [embed] });
        }
    }
};
