"use strict";
const { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('Lock or unlock the entire server')
        .addStringOption(option => 
            option.setName('action')
                .setDescription('Lock or unlock')
                .setRequired(true)
                .addChoices(
                    { name: 'Lock', value: 'lock' },
                    { name: 'Unlock', value: 'unlock' }
                )),
    command: {
        name: 'lockdown',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            const action = interaction.options.getString('action');
            const guild = interaction.guild;

            const channels = guild.channels.cache.filter(c => c.isTextBased());
            
            await interaction.reply({ content: `${action === 'lock' ? 'Locking' : 'Unlocking'} all channels...` });

            for (const [id, channel] of channels) {
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    SendMessages: action === 'unlock'
                }).catch(console.error);
            }

            // Update settings
            const settingsPath = path.join(process.cwd(), 'settings.json');
            const currentSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            currentSettings.serverLock.locked = (action === 'lock');
            fs.writeFileSync(settingsPath, JSON.stringify(currentSettings, null, 4));
            client.settings = currentSettings;

            await interaction.editReply({ content: `Server has been successfully **${action === 'lock' ? 'LOCKED' : 'UNLOCKED'}**.` });
        }
    }
};
