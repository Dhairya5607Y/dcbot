const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const logger = require("./logger");

module.exports = async (client) => {
  const commands = [];
  const commandsPath = path.join(__dirname, "../commands");
  const commandFolders = fs.readdirSync(commandsPath);

  // Load all commands
  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.lstatSync(folderPath).isDirectory()) continue;

    const commandFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);

      if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
      }
    }
  }

  // --- Load AIO commands for registration (up to 100 limit) ---
  const aioPath = path.join(__dirname, "../../../../All-In-One-Bot/src/commands");
  if (fs.existsSync(aioPath)) {
    const aioFolders = fs.readdirSync(aioPath);
    for (const folder of aioFolders) {
      const folderPath = path.join(aioPath, folder);
      if (!fs.lstatSync(folderPath).isDirectory()) continue;

      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));
      for (const file of commandFiles) {
        // Stop if we reach Discord's global limit of 100 slash commands
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
