"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');
const settings = require('../../../settings.json');

const emojis = ["🍎", "🍊", "🍇", "🍒", "💎", "🔔", "7️⃣"];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Play the slot machine')
        .addIntegerOption(option => option.setName('amount').setDescription('The amount to bet').setRequired(true).setMinValue(1)),
    command: {
        name: 'slots',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const user = isSlash ? interaction.user : interaction.author;
            const guildId = interaction.guild.id;
            
            const bet = isSlash ? interaction.options.getInteger('amount') : parseInt(args[0]);
            if (isNaN(bet) || bet <= 0) return interaction.reply({ content: 'Invalid bet amount!', ephemeral: true });

            let userData = await User.findOne({ guildId, userId: user.id });
            if (!userData || userData.wallet < bet) {
                return interaction.reply({ content: 'You don\'t have enough money in your wallet!', ephemeral: true });
            }

            userData.wallet -= bet;
            userData.gameStats.slots.totalSpins += 1;

            const slot1 = emojis[Math.floor(Math.random() * emojis.length)];
            const slot2 = emojis[Math.floor(Math.random() * emojis.length)];
            const slot3 = emojis[Math.floor(Math.random() * emojis.length)];

            const currency = settings.economy?.currency || '💰';
            const embed = new EmbedBuilder()
                .setTitle('Slot Machine')
                .setTimestamp();

            let winAmount = 0;
            if (slot1 === slot2 && slot2 === slot3) {
                winAmount = bet * 10;
                userData.wallet += winAmount;
                userData.gameStats.slots.wins += 1;
                embed.setColor('#00ff00').setDescription(`**[ ${slot1} | ${slot2} | ${slot3} ]**\n\nJACKPOT! You won **${currency} ${winAmount.toLocaleString()}**! (10x)`);
            } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
                winAmount = bet * 2;
                userData.wallet += winAmount;
                userData.gameStats.slots.wins += 1;
                embed.setColor('#ffff00').setDescription(`**[ ${slot1} | ${slot2} | ${slot3} ]**\n\nNice! You won **${currency} ${winAmount.toLocaleString()}**! (2x)`);
            } else {
                embed.setColor('#ff0000').setDescription(`**[ ${slot1} | ${slot2} | ${slot3} ]**\n\nYou lost **${currency} ${bet.toLocaleString()}**. Better luck next time!`);
            }

            await userData.save();
            embed.setFooter({ text: `New Balance: ${currency} ${userData.wallet.toLocaleString()}` });
            await interaction.reply({ embeds: [embed] });
        }
    }
};
