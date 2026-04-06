const { EmbedBuilder } = require('discord.js');

const CATEGORY_COLORS = {
  default: 0xFFB6C1, // blush pink / pookie pink
  info: 0xFFB6C1,
  moderation: 0xFFB6C1,
  danger: 0xFFC0CB, // slightly different pink
  ban: 0xFFC0CB,
  success: 0xFFB6C1,
  xp: 0xFFB6C1,
  levels: 0xFFB6C1,
  music: 0xFFB6C1, // pookie color for music player
  fun: 0xFFB6C1,
  games: 0xFFB6C1,
  error: 0xFFC0CB,
  utility: 0xFFB6C1,
  config: 0xFFB6C1
};

const CATEGORY_ICONS = {
  default: '🎀',
  info: '🌸',
  moderation: '🧸',
  danger: '🥺',
  ban: '🦋',
  success: '✨',
  xp: '💖',
  levels: '🎀',
  music: '🎀', // pookie emoji for music player
  fun: '🦋',
  games: '🧸',
  error: '🥺',
  utility: '🌸',
  config: '✨'
};

const CATEGORY_GIFS = {
  default: 'https://cdn.discordapp.com/attachments/1110915631720370216/1110915721839185970/Looki_Default.gif',
  music: 'https://cdn.discordapp.com/attachments/1110915631720370216/1110915721839185970/Looki_Default.gif',
  success: 'https://cdn.discordapp.com/attachments/1110915631720370216/1110915721839185970/Looki_Default.gif',
  error: 'https://cdn.discordapp.com/attachments/1110915631720370216/1110915721839185970/Looki_Default.gif',
  info: 'https://cdn.discordapp.com/attachments/1110915631720370216/1110915721839185970/Looki_Default.gif',
  moderation: 'https://cdn.discordapp.com/attachments/1110915631720370216/1110915721839185970/Looki_Default.gif',
  fun: 'https://cdn.discordapp.com/attachments/1110915631720370216/1110915721839185970/Looki_Default.gif',
};

function createEmbed(category = 'default', client) {
  const embed = new EmbedBuilder()
    .setColor(CATEGORY_COLORS[category] || CATEGORY_COLORS.default)
    .setAuthor({ name: 'Looki 🎀', iconURL: client.user.displayAvatarURL() })
    .setFooter({ text: '🎀 looki~ • made with pookie dust ✨', iconURL: client.user.displayAvatarURL() })
    .setTimestamp();

  // Set aesthetic GIF image if it exists for this category
  if (CATEGORY_GIFS[category]) {
    embed.setImage(CATEGORY_GIFS[category]);
  } else {
    embed.setImage(CATEGORY_GIFS.default);
  }

  return embed;
}

module.exports = { createEmbed, CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_GIFS };