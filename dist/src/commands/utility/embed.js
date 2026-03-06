"use strict";
const { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Create an embed message')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to send the embed to (defaults to current)').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    command: {
        name: 'embed',
        aliases: [],
        enabled: true,
        execute: async (interaction, args, client) => {
            if (!(interaction instanceof ChatInputCommandInteraction)) {
                return interaction.reply({ content: 'Embed command is only available as a slash command!', ephemeral: true });
            }

            const channel = interaction.options.getChannel('channel') || interaction.channel;

            const modal = new ModalBuilder()
                .setCustomId('embed_modal')
                .setTitle('Create Embed Message');

            const titleInput = new TextInputBuilder()
                .setCustomId('embed_title')
                .setLabel('Title')
                .setPlaceholder('Enter embed title...')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const descriptionInput = new TextInputBuilder()
                .setCustomId('embed_description')
                .setLabel('Description')
                .setPlaceholder('Enter embed description...')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const colorInput = new TextInputBuilder()
                .setCustomId('embed_color')
                .setLabel('Color (Hex Code)')
                .setPlaceholder('#0099ff')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const imageInput = new TextInputBuilder()
                .setCustomId('embed_image')
                .setLabel('Image URL')
                .setPlaceholder('https://...')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const footerInput = new TextInputBuilder()
                .setCustomId('embed_footer')
                .setLabel('Footer Text')
                .setPlaceholder('Enter footer text...')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(titleInput),
                new ActionRowBuilder().addComponents(descriptionInput),
                new ActionRowBuilder().addComponents(colorInput),
                new ActionRowBuilder().addComponents(imageInput),
                new ActionRowBuilder().addComponents(footerInput)
            );

            await interaction.showModal(modal);

            // Wait for modal submission
            const filter = (i) => i.customId === 'embed_modal' && i.user.id === interaction.user.id;
            interaction.awaitModalSubmit({ filter, time: 600000 })
                .then(async (submission) => {
                    const title = submission.fields.getTextInputValue('embed_title');
                    const description = submission.fields.getTextInputValue('embed_description');
                    const color = submission.fields.getTextInputValue('embed_color') || '#0099ff';
                    const image = submission.fields.getTextInputValue('embed_image');
                    const footer = submission.fields.getTextInputValue('embed_footer');

                    const embed = new EmbedBuilder()
                        .setDescription(description)
                        .setColor(color.startsWith('#') ? color : `#${color}`)
                        .setTimestamp();

                    if (title) embed.setTitle(title);
                    if (image) embed.setImage(image);
                    if (footer) embed.setFooter({ text: footer });

                    await channel.send({ embeds: [embed] });
                    await submission.reply({ content: `Successfully sent embed message to ${channel}!`, ephemeral: true });
                })
                .catch(() => {});
        }
    }
};
