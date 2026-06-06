// Direct media URLs with stable Giphy IDs. Keeping them in one place makes
// broken links easy to replace without editing every reaction command.
const GIFS = {
  blush: [
    'https://media.giphy.com/media/v0z6ST7vX7g6Q/giphy.gif',
    'https://media.giphy.com/media/5S4IdkvvB7i4M/giphy.gif',
  ],
  cry: [
    'https://media.giphy.com/media/ROF8OQvDsvvNu/giphy.gif',
    'https://media.giphy.com/media/L95W4wv8n4qze/giphy.gif',
    'https://media.giphy.com/media/2rtQMJvhzOnRe/giphy.gif',
    'https://media.giphy.com/media/qQdL532ZANbjy/giphy.gif',
  ],
  dance: [
    'https://media.giphy.com/media/5S4IdkvvB7i4M/giphy.gif',
    'https://media.giphy.com/media/v0z6ST7vX7g6Q/giphy.gif',
  ],
  highfive: [
    'https://media.giphy.com/media/l41YtzJvVlK4RnsMo/giphy.gif',
    'https://media.giphy.com/media/s2qXK8wAvkHTO/giphy.gif',
    'https://media.giphy.com/media/UvPLmK0wKKhH2/giphy.gif',
  ],
  hug: [
    'https://media.giphy.com/media/lrr9cScdxK0NO/giphy.gif',
    'https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif',
    'https://media.giphy.com/media/PHZ7v9tfQu0o0/giphy.gif',
    'https://media.giphy.com/media/u9BxQbM5bxvwY/giphy.gif',
  ],
  kiss: [
    'https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif',
    'https://media.giphy.com/media/nyGFcsP0kAobm/giphy.gif',
    'https://media.giphy.com/media/hnNyVPIXgALV6/giphy.gif',
    'https://media.giphy.com/media/QGc8RgRvMonFm/giphy.gif',
  ],
  pat: [
    'https://media.giphy.com/media/L2z7dnOduqEow/giphy.gif',
    'https://media.giphy.com/media/109OqaoamDwwXEQ/giphy.gif',
    'https://media.giphy.com/media/108M7gCS1JSoO4/giphy.gif',
    'https://media.giphy.com/media/Ye3c10H0R5sQM/giphy.gif',
  ],
  slap: [
    'https://media.giphy.com/media/RXGNsyRb1hDJm/giphy.gif',
    'https://media.giphy.com/media/Zau0yrl17uzdK/giphy.gif',
    'https://media.giphy.com/media/tX29X2Dx3sAXS/giphy.gif',
    'https://media.giphy.com/media/Gf3AUz3eBNbTW/giphy.gif',
  ],
  wink: [
    'https://media.giphy.com/media/12V5fmTj0tDqH6/giphy.gif',
    'https://media.giphy.com/media/v0z6ST7vX7g6Q/giphy.gif',
  ],
};

function getRandomGif(category) {
  const gifs = GIFS[category] || [];
  return gifs.length ? gifs[Math.floor(Math.random() * gifs.length)] : null;
}

function getGifs(category) {
  return [...(GIFS[category] || [])];
}

module.exports = { ...GIFS, getRandomGif, getGifs };
