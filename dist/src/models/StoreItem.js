const mongoose = require('mongoose');

const storeItemSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    roleId: { type: String, default: null }, // If the item gives a role
    stock: { type: Number, default: -1 }, // -1 for infinite
});

storeItemSchema.index({ guildId: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('StoreItem', storeItemSchema);
