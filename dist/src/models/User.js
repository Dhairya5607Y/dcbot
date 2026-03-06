const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    
    // Leveling
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    lastXpGain: { type: Date, default: 0 },
    messageCount: { type: Number, default: 0 },
    voiceTime: { type: Number, default: 0 }, // in minutes
    inviteCount: { type: Number, default: 0 },
    
    // Economy
    wallet: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    lastDaily: { type: Date, default: 0 },
    lastWeekly: { type: Date, default: 0 },
    lastMonthly: { type: Date, default: 0 },
    lastWork: { type: Date, default: 0 },
    lastCrime: { type: Date, default: 0 },
    lastRob: { type: Date, default: 0 },
    inventory: [{
        itemId: String,
        count: { type: Number, default: 1 }
    }],
    
    // Social Stats
    hugs: { type: Number, default: 0 },
    kisses: { type: Number, default: 0 },
    slaps: { type: Number, default: 0 },
    pats: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 },
    
    // Game Stats
    gameStats: {
        trivia: {
            wins: { type: Number, default: 0 },
            totalPlayed: { type: Number, default: 0 }
        },
        counting: {
            score: { type: Number, default: 0 },
            lastCount: { type: Number, default: 0 }
        },
        blackjack: {
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 }
        },
        slots: {
            wins: { type: Number, default: 0 },
            totalSpins: { type: Number, default: 0 }
        }
    },
    
    // Utility
    afk: {
        reason: { type: String, default: null },
        timestamp: { type: Date, default: null }
    },
    birthday: {
        day: { type: Number, default: null },
        month: { type: Number, default: null }
    },
    reminders: [{
        reason: String,
        time: Date,
        createdAt: { type: Date, default: Date.now }
    }],
    notes: [{
        content: String,
        moderatorId: String,
        timestamp: { type: Date, default: Date.now }
    }]
});

userSchema.index({ guildId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
