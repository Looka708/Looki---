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

const CATEGORY_GIFS = {
  default: 'https://i.pinimg.com/originals/9f/f0/28/9ff028f2ca3328e93892effaa4f76231.gif', // Sparkle heart
  music: 'https://i.pinimg.com/originals/5d/4d/97/5d4d97e74211f42289c09c91f6305aab.gif', // Headphones
  success: 'https://i.pinimg.com/originals/70/65/20/706520e5e01df342d3ed7b4e13b86550.gif', // Sparkle
  error: 'https://i.pinimg.com/originals/ef/9d/37/ef9d3761f2fd290ec598a729fa900f68.gif', // Nervous sweat
  info: 'https://i.pinimg.com/originals/90/37/dd/9037dd78726f1df0f4621c97a950e304.gif', // Writing
  moderation: 'https://i.pinimg.com/originals/7b/03/6e/7b036e890a5e840d820f4c9c17df5692.gif', // Serious/Search
  fun: 'https://i.pinimg.com/originals/fe/18/84/fe18844837119106037d45145b23d573.gif', // Celebration
};

function createEmbed(category = 'default', client) {
  const embed = new EmbedBuilder()
    .setColor(CATEGORY_COLORS[category] || CATEGORY_COLORS.default)
    .setAuthor({ name: 'Looki ✦', iconURL: client.user.displayAvatarURL() })
    .setFooter({ text: '✦ looki~ • made with ♡', iconURL: client.user.displayAvatarURL() })
    .setTimestamp();

  // Set aesthetic GIF thumbnail if it exists for this category
  if (CATEGORY_GIFS[category]) {
    embed.setThumbnail(CATEGORY_GIFS[category]);
  } else {
    embed.setThumbnail(CATEGORY_GIFS.default);
  }

  return embed;
}

module.exports = { createEmbed, CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_GIFS };