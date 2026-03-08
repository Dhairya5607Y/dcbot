const { GiveawaysManager } = require("discord-giveaways");
const Discord = require("discord.js");
const fs = require('fs');

const giveawayModel = require("../../database/models/giveaways");

module.exports = (client) => {
    const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
        async getAllGiveaways() {
            return await giveawayModel.find().lean().exec();
        }

        async saveGiveaway(messageId, giveawayData) {
            await giveawayModel.create(giveawayData);
            return true;
        }

        async editGiveaway(messageId, giveawayData) {
            await giveawayModel.updateOne({ messageId }, giveawayData, { omitUndefined: true }).exec();
            return true;
        }

        async deleteGiveaway(messageId) {
            await giveawayModel.deleteOne({ messageId }).exec();
            return true;
        }

        async refreshStorage() {
            return this.giveawaysManager.getAllGiveaways();
        }
    };

    let manager;
    try {
        // Compatibility Hack: Ensure intents is a number before passing to the library
        // This fixes 'Invalid bitfield' errors in multi-version environments
        const originalIntents = client.options.intents;
        if (client.options.intents && typeof client.options.intents !== 'number') {
            client.options.intents = Number(client.options.intents.bitfield || client.options.intents);
        }

        manager = new GiveawayManagerWithOwnDatabase(client, {
            default: {
                botsCanWin: false,
                embedColor: client.config?.colors?.normal || "#5865F2",
                embedColorEnd: client.config?.colors?.error || "#ED4245",
                reaction: '🥳'
            }
        }, true);

        // Restore original intents object
        client.options.intents = originalIntents;
    } catch (e) {
        console.error(`[ERROR] Failed to initialize GiveawaysManager: ${e.message}`);
        console.error(e.stack); // Print full stack for debugging
        return;
    }

    client.giveawaysManager = manager;

    const events = fs.readdirSync(`./src/events/giveaway`).filter(files => files.endsWith('.js'));

    for (const file of events) {
        const event = require(`../../events/giveaway/${file}`);
        manager.on(file.split(".")[0], event.bind(null, client)).setMaxListeners(0);
    };
}