const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const statsSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },
  totalGuilds: { type: Number, default: 0 },
  totalUsers: { type: Number, default: 0 },
  totalCommands: { type: Number, default: 0 },
  startTime: { type: Number, default: Date.now() },
  lastUpdated: { type: Date, default: Date.now },
  previousGuilds: { type: Number, default: 0 },
  previousUsers: { type: Number, default: 0 },
  previousCommands: { type: Number, default: 0 },
  commandUsage: [{ command: String, count: { type: Number, default: 0 } }],
  dailyCommands: [{ date: String, count: { type: Number, default: 0 } }],
  averageResponseTime: { type: Number, default: 0 },
  activeServersCount: { type: Number, default: 0 },
  guildIds: [{ type: String }],
  guildData: [{ id: String, name: String, memberCount: Number, icon: String }]
});
const globalCommandsSchema = new mongoose.Schema({
  commands: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    options: [{
      name: { type: String, required: true },
      description: { type: String, required: true },
      type: { type: String, required: true },
      options: { type: Array, default: [] }
    }]
  }],
  lastUpdated: { type: Date, default: Date.now }
});
const guildSchema = new mongoose.Schema({
  _id: String,
  commands: {
    disabledCategories: [{ type: String }],
    disabledCommands: [{ type: String }]
  }
});
const Stats = mongoose.model('Stats', statsSchema);
const GlobalCommands = mongoose.model('GlobalCommands', globalCommandsSchema);
const Guild = mongoose.model('Guild', guildSchema);
async function syncGlobalCommands(client) {
  const baseDir = path.join(process.cwd(), 'src', 'interactions');
  const categories = fs.readdirSync(baseDir).filter((d) => fs.statSync(path.join(baseDir, d)).isDirectory());
  const items = [];
  const categoryMap = {};
  for (const cat of categories) {
    const files = fs.readdirSync(path.join(baseDir, cat)).filter((f) => f.endsWith('.js'));
    for (const f of files) {
      const mod = require(path.join(baseDir, cat, f));
      const data = mod.data;
      if (!data || !data.name) continue;
      const options = Array.isArray(data.options) ? data.options.map((opt) => ({
        name: opt.name,
        description: opt.description || '',
        type: String(opt.type),
        options: Array.isArray(opt.options) ? opt.options.map((sub) => ({
          name: sub.name,
          description: sub.description || '',
          type: String(sub.type),
          options: []
        })) : []
      })) : [];
      items.push({
        name: data.name,
        description: data.description || '',
        category: cat.charAt(0).toUpperCase() + cat.slice(1),
        options
      });
      categoryMap[data.name] = cat.charAt(0).toUpperCase() + cat.slice(1);
    }
  }
  client.vantyxCategories = categoryMap;
  const doc = await GlobalCommands.findOne({});
  if (!doc) {
    await GlobalCommands.create({ commands: items, lastUpdated: new Date() });
  } else {
    doc.commands = items;
    doc.lastUpdated = new Date();
    await doc.save();
  }
}
function todayKey() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}
async function incrementCommandUsage(commandName) {
  const doc = await Stats.findById('global');
  if (!doc) {
    await Stats.create({
      _id: 'global',
      totalCommands: 1,
      commandUsage: [{ command: commandName, count: 1 }],
      dailyCommands: [{ date: todayKey(), count: 1 }],
      lastUpdated: new Date()
    });
    return;
  }
  doc.previousCommands = doc.totalCommands;
  doc.totalCommands = (doc.totalCommands || 0) + 1;
  const entry = (doc.commandUsage || []).find((e) => e.command === commandName);
  if (entry) {
    entry.count = (entry.count || 0) + 1;
  } else {
    doc.commandUsage.push({ command: commandName, count: 1 });
  }
  const dkey = todayKey();
  const day = (doc.dailyCommands || []).find((e) => e.date === dkey);
  if (day) {
    day.count = (day.count || 0) + 1;
  } else {
    doc.dailyCommands.push({ date: dkey, count: 1 });
  }
  doc.lastUpdated = new Date();
  await doc.save();
}
async function updateStatsOnReady(client) {
  const totalGuilds = client.guilds.cache.size;
  const totalUsers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
  const guildData = client.guilds.cache.map((g) => ({
    id: g.id, name: g.name, memberCount: g.memberCount, icon: g.icon
  }));
  const doc = await Stats.findById('global');
  if (!doc) {
    await Stats.create({
      _id: 'global',
      totalGuilds,
      totalUsers,
      guildIds: client.guilds.cache.map((g) => g.id),
      guildData,
      startTime: Date.now(),
      lastUpdated: new Date(),
      activeServersCount: totalGuilds
    });
    return;
  }
  doc.previousGuilds = doc.totalGuilds || 0;
  doc.previousUsers = doc.totalUsers || 0;
  doc.totalGuilds = totalGuilds;
  doc.totalUsers = totalUsers;
  doc.guildIds = client.guilds.cache.map((g) => g.id);
  doc.guildData = guildData;
  doc.activeServersCount = totalGuilds;
  doc.lastUpdated = new Date();
  await doc.save();
}
async function isCommandDisabled(guildId, commandName, category) {
  if (!guildId) return false;
  const guild = await Guild.findById(guildId);
  if (!guild || !guild.commands) return false;
  const disabledCommands = guild.commands.disabledCommands || [];
  const disabledCategories = guild.commands.disabledCategories || [];
  if (disabledCommands.includes(commandName)) return true;
  if (category && disabledCategories.includes(category)) return true;
  return false;
}
module.exports = {
  syncGlobalCommands,
  incrementCommandUsage,
  updateStatsOnReady,
  isCommandDisabled
};
