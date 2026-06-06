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
  default: 'Looki',
  info: 'Info',
  moderation: 'Moderation',
  danger: 'Warning',
  ban: 'Moderation',
  success: 'Success',
  xp: 'XP',
  levels: 'Levels',
  music: 'Music',
  fun: 'Fun',
  games: 'Games',
  error: 'Error',
  utility: 'Utility',
  config: 'Settings',
};

// Kept for compatibility with older imports. Commands add intentional images.
const CATEGORY_GIFS = {};

function createEmbed(category = 'default', client) {
  const avatar = client?.user?.displayAvatarURL?.();
  const label = CATEGORY_ICONS[category] || CATEGORY_ICONS.default;
  const author = avatar ? { name: `Looki | ${label}`, iconURL: avatar } : { name: `Looki | ${label}` };
  const footer = avatar
    ? { text: 'Looki | Helpful, cute, and clear', iconURL: avatar }
    : { text: 'Looki | Helpful, cute, and clear' };

  return new EmbedBuilder()
    .setColor(CATEGORY_COLORS[category] || CATEGORY_COLORS.default)
    .setAuthor(author)
    .setFooter(footer)
    .setTimestamp();
}

module.exports = { createEmbed, CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_GIFS };
