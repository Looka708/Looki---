const { EmbedBuilder } = require('discord.js');

const CATEGORY_COLORS = {
  default: 0xF4A7C1,
  info: 0x8ECAE6,
  moderation: 0xF4A261,
  danger: 0xE76F51,
  ban: 0xE76F51,
  success: 0x72C69B,
  xp: 0xFFD166,
  levels: 0xC77DFF,
  music: 0xB86BFF,
  fun: 0xFF8FAB,
  games: 0x7BDFF2,
  error: 0xED6A8A,
  utility: 0x8ECAE6,
  config: 0xA8DADC,
};

const CATEGORY_ICONS = {
  default: '🎀',
  info: 'ℹ️',
  moderation: '🛡️',
  danger: '⚠️',
  ban: '🔨',
  success: '✅',
  xp: '✨',
  levels: '🏆',
  music: '🎵',
  fun: '🌸',
  games: '🎮',
  error: '❌',
  utility: '🧰',
  config: '⚙️',
};

// Kept for compatibility with older imports. Embeds no longer receive a
// remote image automatically; commands should add an intentional image.
const CATEGORY_GIFS = {};

function createEmbed(category = 'default', client) {
  const avatar = client?.user?.displayAvatarURL?.();
  const embed = new EmbedBuilder()
    .setColor(CATEGORY_COLORS[category] || CATEGORY_COLORS.default)
    .setAuthor({ name: `Looki ${CATEGORY_ICONS[category] || CATEGORY_ICONS.default}`, iconURL: avatar })
    .setFooter({ text: 'Looki • Helpful, cute, and clear', iconURL: avatar })
    .setTimestamp();

  return embed;
}

module.exports = { createEmbed, CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_GIFS };
