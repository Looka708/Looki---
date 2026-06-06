const axios = require('axios');

const SUPPORTED_REACTIONS = new Set([
  'blush',
  'cry',
  'dance',
  'highfive',
  'hug',
  'kiss',
  'pat',
  'slap',
  'wink',
]);

async function getReactionGif(category) {
  if (!SUPPORTED_REACTIONS.has(category)) {
    return null;
  }

  try {
    const response = await axios.get(`https://nekos.best/api/v2/${category}`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'LookiDiscordBot/1.0',
      },
    });

    return response.data?.results?.[0]?.url || null;
  } catch (error) {
    console.error(`[Reaction GIF] Failed to fetch "${category}":`, error.message);
    return null;
  }
}

module.exports = {
  getReactionGif,
  getRandomGif: getReactionGif,
};
