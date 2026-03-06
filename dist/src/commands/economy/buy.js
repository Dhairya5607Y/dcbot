"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');
const StoreItem = require('../../models/StoreItem');
const settings = require('../../../settings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Purchase an item from the shop')
        .addStringOption(option => option.setName('item_id').setDescription('The ID of the item to buy').setRequired(true)),
    command: {
        name: 'buy',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const user = isSlash ? interaction.user : interaction.author;
            const guildId = interaction.guild.id;
            
            const itemId = isSlash ? interaction.options.getString('item_id') : args[0];
            if (!itemId) return interaction.reply({ content: 'Please provide an item ID!', ephemeral: true });

            const item = await StoreItem.findOne({ guildId, itemId });
            if (!item) return interaction.reply({ content: 'Item not found!', ephemeral: true });

            if (item.stock === 0) return interaction.reply({ content: 'This item is out of stock!', ephemeral: true });

            let userData = await User.findOne({ guildId, userId: user.id });
            if (!userData || userData.wallet < item.price) {
                return interaction.reply({ content: 'You don\'t have enough money in your wallet!', ephemeral: true });
            }

            // Purchase logic
            userData.wallet -= item.price;
            
            const invItem = userData.inventory.find(i => i.itemId === itemId);
            if (invItem) {
                invItem.count += 1;
            } else {
                userData.inventory.push({ itemId, count: 1 });
            }

            if (item.stock > 0) {
                item.stock -= 1;
                await item.save();
            }

            // If item gives a role
            if (item.roleId) {
                const role = interaction.guild.roles.cache.get(item.roleId);
                if (role) {
                    await interaction.member.roles.add(role).catch(console.error);
                }
            }

            await userData.save();

            const currency = settings.economy?.currency || '💰';
            const embed = new EmbedBuilder()
                .setTitle('Purchase Successful')
                .setDescription(`You bought **${item.name}** for **${currency} ${item.price.toLocaleString()}**!`)
                .setColor('#00ff00')
                .setFooter({ text: `New Balance: ${currency} ${userData.wallet.toLocaleString()}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};
