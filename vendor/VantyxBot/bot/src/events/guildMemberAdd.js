const { EmbedBuilder, AttachmentBuilder, Events } = require("discord.js");
const { log } = require("../utils/guildLogger");
const Guild = require("../database/models/Guild");
const { generateWelcomeImage } = require("../utils/imageGenerator");
const inviteTracker = require("../utils/inviteTracker");
const lang = require("../utils/language");
const logger = require("../utils/logger");
const { recordGuildStat } = require("../utils/stats");

/**
 * Event: GuildMemberAdd
 * Handles new members joining: tracks statistics, logs join events,
 * assigns auto-roles, and sends welcome messages/images.
 */
module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const { guild, user } = member;
    const language = await lang.getLanguage(guild.id);

    try {
      // 1. Update Guild Statistics
      await recordGuildStat(guild, "joins", guild.memberCount);

      // 2. Log Join Event
      const logEmbed = new EmbedBuilder()
        .setTitle(lang.get(language, "MEMBER_JOINED_TITLE"))
        .setDescription(
          lang.get(language, "MEMBER_JOINED_DESC", {
            user: member.toString(),
            tag: user.tag,
          }),
        )
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          {
            name: lang.get(language, "ACCOUNT_CREATED_LABEL"),
            value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
            inline: true,
          },
          {
            name: lang.get(language, "MEMBER_COUNT_LABEL"),
            value: `${guild.memberCount}`,
            inline: true,
          },
        )
        .setColor("#00FF00")
        .setTimestamp();

      await log(guild, "member", logEmbed);

      // 3. Process Welcome System (Disabled in favor of AIO)
      /*
      const guildSettings = await Guild.findById(guild.id).lean();
      if (guildSettings?.welcome) {
        ...
      }
      */
    } catch (error) {
      logger.error(`Member Join Handler Error: ${error.message}`);
    }
  },
};
