"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } = require('discord.js');
const User = require('../../models/User');
const settings = require('../../../settings.json');

const successMessages = [
    "You successfully robbed a bank!",
    "You hacked into a billionaire's account!",
    "You stole a candy from a baby (shame on you, but profit!)",
    "You sold some 'sugar' on the street corner.",
    "You pulled off a successful heist!"
];

const failMessages = [
    "You got caught by the police!",
    "The security alarm went off and you had to run!",
    "You tripped while running away and lost some money!",
    "Your hack was traced and you had to pay a fine!",
    "The baby fought back and beat you up!"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crime')
        .setDescription('Commit a crime to earn big money (or lose it)'),
    command: {
        name: 'crime',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const isSlash = interaction instanceof ChatInputCommandInteraction;
            const user = isSlash ? interaction.user : interaction.author;
            const guildId = interaction.guild.id;
            
            let userData = await User.findOne({ guildId, userId: user.id });
            if (!userData) {
                userData = new User({ guildId, userId: user.id });
            }

            const now = Date.now();
            const lastCrime = userData.lastCrime ? userData.lastCrime.getTime() : 0;
            const cooldown = 4 * 60 * 60 * 1000; // 4 hours

            if (now - lastCrime < cooldown) {
                const remaining = cooldown - (now - lastCrime);
                const hours = Math.floor(remaining / (60 * 60 * 1000));
                const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
                return interaction.reply({ 
                    content: `You're laying low! Come back in ${hours}h ${minutes}m.`, 
                    ephemeral: true 
                });
            }

            const successRate = settings.economy?.crimeSuccessRate || 45;
            const isSuccess = Math.random() * 100 < successRate;
            const currency = settings.economy?.currency || '💰';
            const embed = new EmbedBuilder().setTimestamp();

            if (isSuccess) {
                const min = settings.economy?.crimeMin || 100;
                const max = settings.economy?.crimeMax || 500;
                const amount = Math.floor(Math.random() * (max - min + 1)) + min;
                const msg = successMessages[Math.floor(Math.random() * successMessages.length)];

                userData.wallet += amount;
                embed.setTitle('Crime - Success!')
                    .setDescription(`${msg}\nYou earned **${currency} ${amount.toLocaleString()}**!`)
                    .setColor('#00ff00')
                    .setFooter({ text: `New Balance: ${currency} ${userData.wallet.toLocaleString()}` });
            } else {
                const lossMin = 50;
                const lossMax = 200;
                const amount = Math.floor(Math.random() * (lossMax - lossMin + 1)) + lossMin;
                const msg = failMessages[Math.floor(Math.random() * failMessages.length)];

                userData.wallet = Math.max(0, userData.wallet - amount);
                embed.setTitle('Crime - Failed!')
                    .setDescription(`${msg}\nYou lost **${currency} ${amount.toLocaleString()}**!`)
                    .setColor('#ff0000')
                    .setFooter({ text: `New Balance: ${currency} ${userData.wallet.toLocaleString()}` });
            }

            userData.lastCrime = now;
            await userData.save();
            await interaction.reply({ embeds: [embed] });
        }
    }
};
