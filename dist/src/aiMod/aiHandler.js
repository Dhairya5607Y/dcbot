const axios = require('axios');

async function analyzeSentiment(text) {
    // In a production environment, you would use a service like:
    // - Perspective API (Google)
    // - Azure Cognitive Services
    // - AWS Comprehend
    // - OpenAI Moderation API
    
    // For this implementation, we will use a basic word-based sentiment analyzer
    // since we don't have API keys in the current environment.
    
    const positiveWords = ['love', 'good', 'great', 'awesome', 'amazing', 'happy', 'cool', 'excellent'];
    const negativeWords = ['hate', 'bad', 'terrible', 'awful', 'angry', 'stupid', 'idiot', 'worst'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
        if (positiveWords.includes(word)) score += 0.2;
        if (negativeWords.includes(word)) score -= 0.3;
    });
    
    return {
        score: Math.max(-1, Math.min(1, score)),
        isToxic: score < -0.6
    };
}

async function handleAIModeration(message, client) {
    const settings = client.settings.aiModeration;
    if (!settings || !settings.enabled) return false;

    const result = await analyzeSentiment(message.content);
    
    if (result.isToxic || result.score < settings.sentimentThreshold) {
        const action = settings.actions.toxic || 'warn';
        await applyAIAction(message, action, `AI detected high toxicity (score: ${result.score.toFixed(2)})`);
        return true;
    }
    
    return false;
}

async function applyAIAction(message, action, reason) {
    if (action === 'warn') {
        message.delete().catch(() => {});
        message.channel.send(`⚠️ ${message.author}, your message was flagged by AI moderation for: **${reason}**`).then(m => setTimeout(() => m.delete(), 5000));
    } else if (action === 'mute') {
        message.delete().catch(() => {});
        await message.member.timeout(3600000, reason).catch(console.error); // 1 hour timeout
    }
}

module.exports = { handleAIModeration };
