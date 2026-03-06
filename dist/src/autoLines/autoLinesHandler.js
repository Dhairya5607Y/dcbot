const intervals = new Map();

async function initAutoLines(client) {
    const settings = client.settings.autoLines;
    if (!settings || !settings.enabled) return;

    // Clear existing intervals
    for (const interval of intervals.values()) {
        clearInterval(interval);
    }
    intervals.clear();

    settings.channels?.forEach(ch => {
        if (!ch.channelId || !ch.messages?.length) return;

        const intervalMs = (ch.interval || 60) * 60000;
        const interval = setInterval(() => {
            const channel = client.channels.cache.get(ch.channelId);
            if (channel) {
                const message = ch.messages[Math.floor(Math.random() * ch.messages.length)];
                channel.send(message).catch(console.error);
            }
        }, intervalMs);

        intervals.set(ch.channelId, interval);
    });
}

module.exports = { initAutoLines };
