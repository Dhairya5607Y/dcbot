const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const logger = require("./logger");

module.exports = async (client) => {
  const commands = [];
  
  // --- 1. Load AIO commands for registration FIRST (as requested by user) ---
  const aioPath = path.join(__dirname, "../../../../All-In-One-Bot/src/commands");
  if (fs.existsSync(aioPath)) {
    const aioFolders = fs.readdirSync(aioPath);
    for (const folder of aioFolders) {
      const folderPath = path.join(aioPath, folder);
      if (!fs.lstatSync(folderPath).isDirectory()) continue;

      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));
      for (const file of commandFiles) {
        if (commands.length >= 100) break;

        try {
          const command = require(path.join(folderPath, file));
          if (command.name && command.slashCommand?.enabled) {
            commands.push({
              name: command.name,
              description: (command.description || "No description").substring(0, 100),
              options: command.slashCommand.options || [],
              type: 1 // ChatInput
            });
          }
        } catch (e) { /* skip */ }
      }
      if (commands.length >= 100) break;
    }
  }

  // --- 2. Load AIO contexts for registration ---
  const aioContextsPath = path.join(__dirname, "../../../../All-In-One-Bot/src/contexts");
  if (fs.existsSync(aioContextsPath)) {
    const contextFiles = fs.readdirSync(aioContextsPath).filter(file => file.endsWith(".js"));
    for (const file of contextFiles) {
      if (commands.length >= 100) break;
      try {
        const context = require(path.join(aioContextsPath, file));
        if (context.name && context.enabled) {
          commands.push({
            name: context.name,
            type: context.type,
          });
        }
      } catch (e) { /* skip */ }
    }
  }

  // --- 3. Load Vantyx commands ONLY if they don't collide with AIO (Disabled by user request) ---
  /*
  const commandsPath = path.join(__dirname, "../commands");
  if (fs.existsSync(commandsPath)) {
    const commandFolders = fs.readdirSync(commandsPath);
    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      if (!fs.lstatSync(folderPath).isDirectory()) continue;

      const commandFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        if (commands.length >= 100) break;
        const command = require(path.join(folderPath, file));

        if ("data" in command && "execute" in command) {
          // Check for collision
          if (!commands.some(c => c.name === command.data.name)) {
            commands.push(command.data.toJSON());
          }
        }
      }
      if (commands.length >= 100) break;
    }
  }
  */

  // Deploy commands
  const rest = new REST({ version: "10" }).setToken(
    client.config.DISCORD_TOKEN
  );

  try {
    logger.info(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // Register globally
    const data = await rest.put(
      Routes.applicationCommands(client.config.CLIENT_ID),
      { body: commands }
    );

    logger.info(
      `Successfully registered ${data.length} application (/) commands globally.`
    );
  } catch (error) {
    logger.error(`Error deploying commands: ${error.message}`);
  }
};
