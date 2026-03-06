async function handleAutomod(message, client) {
    const settings = client.settings.automod;
    if (!settings || !settings.enabled) return false;

    const rules = settings.rules;
    if (!rules) return false;

    // Link blocking
    if (rules.links?.enabled) {
        const linkRegex = /https?:\/\/[^\s]+/i;
        if (linkRegex.test(message.content)) {
            await applyAction(message, rules.links.action, 'Link Blocking');
            return true;
        }
    }

    // Invite blocking
    if (rules.invites?.enabled) {
        const inviteRegex = /(discord\.gg|discordapp\.com\/invite|discord\.com\/invite)\/[^\s]+/i;
        if (inviteRegex.test(message.content)) {
            await applyAction(message, rules.invites.action, 'Invite Blocking');
            return true;
        }
    }

    // Mass mentions
    if (rules.mentions?.enabled) {
        const mentionCount = message.mentions.users.size + message.mentions.roles.size;
        if (mentionCount > (rules.mentions.limit || 5)) {
            await applyAction(message, rules.mentions.action, 'Mass Mentions');
            return true;
        }
    }

    // Bad words
    if (rules.badWords?.enabled) {
        const words = rules.badWords.words || [];
        const content = message.content.toLowerCase();
        if (words.some(word => content.includes(word.toLowerCase()))) {
            await applyAction(message, rules.badWords.action, 'Bad Words Filter');
            return true;
        }
    }

    // Caps
    if (rules.caps?.enabled) {
        const capsLimit = rules.caps.limit || 70;
        const totalChars = message.content.length;
        if (totalChars > 10) {
            const capsCount = message.content.replace(/[^A-Z]/g, '').length;
            const capsPercentage = (capsCount / totalChars) * 100;
            if (capsPercentage > capsLimit) {
                await applyAction(message, rules.caps.action, 'Excessive Caps');
                return true;
            }
        }
    }

    // Anti-Emoji
    if (rules.emoji?.enabled) {
        const emojiRegex = /<a?:.+?:\d+>|[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu;
        const emojiCount = (message.content.match(emojiRegex) || []).length;
        if (emojiCount > (rules.emoji.limit || 10)) {
            await applyAction(message, rules.emoji.action, 'Too many emojis');
            return true;
        }
    }

    // Anti-GhostPing logic is handled in MessageDelete, but here we can check for mass pings
    if (rules.ghostPing?.enabled) {
        // Just a placeholder, actual ghost ping detection is in messageDelete
    }

    return false;
}

async function applyAction(message, action, reason) {
    if (action.includes('delete')) {
        await message.delete().catch(() => {});
    }
    
    if (action.includes('warn')) {
        // Here we would call the warn command logic
        // For simplicity, we'll just send a warning message for now
        message.channel.send(`${message.author}, your message was flagged for: ${reason}`).then(m => setTimeout(() => m.delete(), 5000));
    }
}

module.exports = { handleAutomod };
