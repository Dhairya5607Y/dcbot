const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");
const GlobalCommands = require("../database/models/GlobalCommands");

/**
 * Loads and registers all commands from the commands directory.
 * Also synchronizes the command list with the database for the dashboard.
 */
module.exports = async (client) => {
  // --- 1. AIO commands are now loaded intrinsically by the AIO handlers ---
  // The new ALL-IN-ONE-Discord-Bot automatically populates client.commands
  // during initialization in `bot/index.js`

  // --- 2. Load Vantyx commands ONLY if they don't collide (Disabled by user request) ---
  /*
  const commandsPath = path.join(__dirname, "../commands");
  if (fs.existsSync(commandsPath)) {
    const commandFolders = fs.readdirSync(commandsPath);
    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      if (!fs.lstatSync(folderPath).isDirectory()) continue;

      const commandFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if ("data" in command && "execute" in command) {
          if (!client.commands.has(command.data.name)) {
            command.category = folder;
            client.commands.set(command.data.name, command);
            logger.info(`Loaded Vantyx command: ${command.data.name}`);
          } else {
            logger.info(`Skipping Vantyx command ${command.data.name} (Collides with AIO)`);
          }
        }
      }
    }
  }
  */

  // Map commands to a clean format for database synchronization
  const commandsList = client.commands.map((cmd) => {
    // New AIO bot stores slash command data in `cmd.data`
    const data = cmd.data?.toJSON ? cmd.data.toJSON() : cmd.data;

    return {
      name: data?.name || "Unknown",
      description: data?.description || "No description",
      category: cmd.category || "General",
      options: (data?.options || []).map((opt) => cleanOption(opt)),
    };
  });

  /**
   * Recursively cleans command options for database storage.
   */
  function cleanOption(opt) {
    return {
      name: opt.name,
      description: opt.description || "",
      type: opt.type,
      options: (opt.options || []).map((sub) => cleanOption(sub)),
      choices: opt.choices || undefined,
      min_value: opt.min_value || undefined,
      max_value: opt.max_value || undefined,
      required: opt.required || false,
      channel_types: opt.channel_types || undefined,
    };
  }

  try {
    // Sync the local command list with the database to keep the dashboard updated
    await GlobalCommands.deleteMany({});
    await GlobalCommands.create({ commands: commandsList });
    logger.info(`Synchronized ${commandsList.length} commands with database`);
  } catch (error) {
    logger.error(`Database command sync failed: ${error.message}`);
  }
};
