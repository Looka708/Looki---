const axios = require('axios');

const CACHE_TTL_MS = 10 * 60 * 1000;

const REACTION_CATEGORIES = {
  blush: { nekosBest: 'blush', waifuPics: 'blush' },
  cry: { nekosBest: 'cry', waifuPics: 'cry' },
  dance: { nekosBest: 'dance', waifuPics: 'dance' },
  highfive: { nekosBest: 'highfive', waifuPics: 'highfive' },
  hug: { nekosBest: 'hug', waifuPics: 'hug' },
  kiss: { nekosBest: 'kiss', waifuPics: 'kiss' },
  pat: { nekosBest: 'pat', waifuPics: 'pat' },
  slap: { nekosBest: 'slap', waifuPics: 'slap' },
  wink: { nekosBest: 'wink', waifuPics: 'wink' },
};

const cache = new Map();

function normalizeCategory(category) {
  return String(category || '').toLowerCase().replace(/[-_\s]/g, '');
}

function isValidImageUrl(url) {
  return typeof url === 'string'
    && /^https:\/\//i.test(url)
    && /\.(gif|png|jpe?g|webp)(\?.*)?$/i.test(url);
}

async function fetchNekosBest(category) {
  const response = await axios.get(`https://nekos.best/api/v2/${category}`, {
    timeout: 3500,
    headers: { 'User-Agent': 'LookiDiscordBot/1.0' },
  });

  return response.data?.results?.[0]?.url || null;
}

async function fetchWaifuPics(category) {
  const response = await axios.get(`https://api.waifu.pics/sfw/${category}`, {
    timeout: 3500,
    headers: { 'User-Agent': 'LookiDiscordBot/1.0' },
  });

  return response.data?.url || null;
}

async function getReactionGif(category) {
  const normalized = normalizeCategory(category);
  const providers = REACTION_CATEGORIES[normalized];
  if (!providers) return null;

  const cached = cache.get(normalized);
  if (cached && cached.expiresAt > Date.now()) return cached.url;

  const attempts = [
    ['nekos.best', () => fetchNekosBest(providers.nekosBest)],
    ['waifu.pics', () => fetchWaifuPics(providers.waifuPics)],
  ];

  for (const [providerName, fetchGif] of attempts) {
    try {
      const url = await fetchGif();
      if (!isValidImageUrl(url)) {
        console.warn(`[Reaction GIF] ${providerName} returned an invalid ${normalized} image URL.`);
        continue;
      }

      cache.set(normalized, {
        url,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return url;
    } catch (error) {
      console.warn(`[Reaction GIF] ${providerName} failed for "${normalized}": ${error.message}`);
    }
  }

  return null;
}

module.exports = {
  getReactionGif,
  getRandomGif: getReactionGif,
};
