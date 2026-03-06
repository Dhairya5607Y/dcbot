const User = require('../models/User');

async function handleLeveling(message, client) {
    const settings = client.settings.leveling;
    if (!settings || !settings.enabled) return;

    if (settings.ignoredChannels?.includes(message.channel.id)) return;
    if (message.member.roles.cache.some(r => settings.ignoredRoles?.includes(r.id))) return;

    const cooldown = settings.cooldown || 60000;
    const guildId = message.guild.id;
    const userId = message.author.id;

    let user = await User.findOne({ guildId, userId });
    if (!user) {
        user = new User({ guildId, userId, lastXpGain: 0 });
    }

    const now = Date.now();
    if (now - user.lastXpGain.getTime() < cooldown) return;

    const xpToGain = Math.floor(Math.random() * (settings.xpPerMessage.max - settings.xpPerMessage.min + 1)) + settings.xpPerMessage.min;
    user.xp += xpToGain;
    user.lastXpGain = now;
    user.messageCount += 1;

    const currentLevel = user.level;
    const nextLevel = Math.floor(0.1 * Math.sqrt(user.xp));

    if (nextLevel > currentLevel) {
        user.level = nextLevel;
        
        // Handle rewards
        const reward = settings.rewards?.find(r => r.level === nextLevel);
        if (reward) {
            const role = message.guild.roles.cache.get(reward.roleId);
            if (role) {
                await message.member.roles.add(role).catch(console.error);
            }
        }

        // Announcement
        if (settings.announcement?.enabled) {
            const msg = settings.announcement.message
                .split('{user}').join(message.author.toString())
                .split('{level}').join(nextLevel.toString())
                .split('{xp}').join(user.xp.toString());

            if (settings.announcement.channel === 'current') {
                message.channel.send(msg).catch(console.error);
            } else if (settings.announcement.channel === 'dm') {
                message.author.send(msg).catch(() => {});
            } else {
                const channel = message.guild.channels.cache.get(settings.announcement.channel);
                if (channel) channel.send(msg).catch(console.error);
            }
        }
    }

    await user.save();
}

module.exports = { handleLeveling };
