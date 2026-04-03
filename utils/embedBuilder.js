const { EmbedBuilder } = require('discord.js');

const CATEGORY_COLORS = {
  default: 0xFFB6C1, // blush pink
  info: 0xFFB6C1,
  moderation: 0xC8A2C8, // soft lavender
  danger: 0xFF9EAE, // rose alert
  ban: 0xFF9EAE,
  success: 0xB5EAD7, // mint cream
  xp: 0xFFDAC1, // peach glow
  levels: 0xFFDAC1,
  music: 0xAEC6CF, // pastel blue
  fun: 0xFFFACD, // lemon chiffon
  games: 0xFFFACD,
  error: 0xF4C2C2, // soft red
  utility: 0xFFB6C1,
  config: 0xFFB6C1
};

const CATEGORY_ICONS = {
  default: '🌸',
  info: '🌸',
  moderation: '🛡️',
  danger: '⚠️',
  ban: '🚫',
  success: '✅',
  xp: '⭐',
  levels: '📈',
  music: '🎵',
  fun: '🎉',
  games: '🎮',
  error: '❌',
  utility: '📊',
  config: '⚙️'
};

function createEmbed(category = 'default', client) {
  const embed = new EmbedBuilder()
    .setColor(CATEGORY_COLORS[category] || CATEGORY_COLORS.default)
    .setAuthor({ name: 'Looki ✦', iconURL: client.user.displayAvatarURL() })
    .setFooter({ text: '✦ looki~ • made with ♡', iconURL: client.user.displayAvatarURL() })
    .setTimestamp();

  // Set thumbnail if available
  if (CATEGORY_ICONS[category]) {
    // For now, use emoji as thumbnail, but Discord embeds don't support emoji thumbnails directly
    // Perhaps set a default image or leave for now
  }

  return embed;
}

module.exports = { createEmbed, CATEGORY_COLORS, CATEGORY_ICONS };