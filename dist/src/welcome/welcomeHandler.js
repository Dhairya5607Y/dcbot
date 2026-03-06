const { EmbedBuilder } = require('discord.js');

async function handleWelcome(member, client) {
    const settings = client.settings.welcome;
    if (!settings || !settings.enabled) return;

    const guild = member.guild;
    const user = member.user;
    const memberCount = guild.memberCount;

    function replaceVars(text) {
        if (!text) return '';
        return text
            .split('{user}').join(user.toString())
            .split('{server}').join(guild.name)
            .split('{memberCount}').join(memberCount.toString());
    }

    // Channel Welcome
    if (settings.channelId) {
        const channel = guild.channels.cache.get(settings.channelId);
        if (channel) {
            if (settings.embed && settings.embed.enabled) {
                const embed = new EmbedBuilder()
                    .setTitle(replaceVars(settings.embed.title))
                    .setDescription(replaceVars(settings.embed.description))
                    .setColor(settings.embed.color || '#3498db');

                if (settings.embed.thumbnail) {
                    embed.setThumbnail(user.displayAvatarURL({ dynamic: true }));
                }

                if (settings.embed.image) {
                    embed.setImage(settings.embed.image);
                }

                if (settings.embed.footer) {
                    embed.setFooter({ text: replaceVars(settings.embed.footer) });
                }

                if (settings.embed.timestamp) {
                    embed.setTimestamp();
                }

                channel.send({ content: replaceVars(settings.message), embeds: [embed] }).catch(console.error);
            } else {
                channel.send({ content: replaceVars(settings.message) }).catch(console.error);
            }
        }
    }

    // DM Welcome
    if (settings.dm && settings.dm.enabled && settings.dm.message) {
        user.send(replaceVars(settings.dm.message)).catch(() => {
            console.log(`Could not send welcome DM to ${user.tag}`);
        });
    }
}

module.exports = { handleWelcome };
