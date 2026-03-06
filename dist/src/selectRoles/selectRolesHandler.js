const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

async function handleSelectRoles(interaction, client) {
    const settings = client.settings.selectRoles;
    if (!settings || !settings.enabled) return;

    if (interaction.isButton()) {
        const customId = interaction.customId;
        if (!customId.startsWith('select_role_')) return;

        const roleId = customId.split('_')[2];
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return;

        const member = interaction.member;
        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
            await interaction.reply({ content: `Removed role: @${role.name}`, ephemeral: true });
        } else {
            await member.roles.add(roleId);
            await interaction.reply({ content: `Added role: @${role.name}`, ephemeral: true });
        }
    }
}

async function sendSelectRolesMessage(channel, client) {
    const settings = client.settings.selectRoles;
    if (!settings || !settings.enabled) return;

    const embed = new EmbedBuilder()
        .setTitle(settings.embed.title)
        .setDescription(settings.embed.description)
        .setColor(settings.embed.color || '#3498db');

    const rows = [];
    settings.groups.forEach(group => {
        const row = new ActionRowBuilder();
        group.roles.forEach(role => {
            const button = new ButtonBuilder()
                .setCustomId(`select_role_${role.roleId}`)
                .setLabel(role.label)
                .setStyle(ButtonStyle.Primary);
            if (role.emoji) button.setEmoji(role.emoji);
            row.addComponents(button);
        });
        rows.push(row);
    });

    await channel.send({ embeds: [embed], components: rows }).catch(console.error);
}

module.exports = { handleSelectRoles, sendSelectRolesMessage };
