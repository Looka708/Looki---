const { createEmbed } = require('./embedBuilder');
const { getOrCreateConfig } = require('../models/ServerConfig');

async function sendModLog(interaction, client, title, fields) {
  try {
    const config = await getOrCreateConfig(interaction.guildId);
    if (!config?.modlog_channel) return;

    const channel = interaction.guild.channels.cache.get(config.modlog_channel);
    if (!channel?.isTextBased()) return;

    const embed = createEmbed('moderation', client)
      .setTitle(title)
      .addFields(fields);

    await channel.send({ embeds: [embed] }).catch(() => null);
  } catch (error) {
    console.error('[ModLog] Failed to send moderation log:', error);
  }
}

function moderationError(client, title, description) {
  return createEmbed('error', client)
    .setTitle(title)
    .setDescription(description);
}

module.exports = { moderationError, sendModLog };
