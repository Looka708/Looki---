// Shared GIF collections for reaction commands
// To prevent duplication and make maintenance easier

module.exports = {
  blush: [
    'https://media.tenor.com/images/a1e64e5e09c7af0cd47a17a1d3556297/tenor.gif',
    'https://media.tenor.com/images/acc2d77b73b9c1a9a52e46c7b1bff4e5/tenor.gif',
    'https://media.tenor.com/images/6eb53166cf6be32c2ebf96bbcff51e5e/tenor.gif',
    'https://media.tenor.com/images/f4ba25c6defd0b2ecc4e6a7dc2df80dc/tenor.gif',
  ],

  cry: [
    'https://media.tenor.com/images/e8cf7d5f9b8f8b7b7b7b7b7b7b7b7b7b/tenor.gif',
    'https://media.tenor.com/images/a1e64e5e09c7af0cd47a17a1d3556297/tenor.gif',
    'https://media.tenor.com/images/acc2d77b73b9c1a9a52e46c7b1bff4e5/tenor.gif',
    'https://media.tenor.com/images/6eb53166cf6be32c2ebf96bbcff51e5e/tenor.gif',
  ],

  dance: [
    'https://media.tenor.com/images/c6b8eb75d58e7c3debdc0e1b73167cd8/tenor.gif',
    'https://media.tenor.com/images/e3b16f86f36ae28d1fb69ca12c4f2b7f/tenor.gif',
    'https://media.tenor.com/images/6eb53166cf6be32c2ebf96bbcff51e5e/tenor.gif',
    'https://media.tenor.com/images/a1e64e5e09c7af0cd47a17a1d3556297/tenor.gif',
  ],

  wink: [
    'https://media.tenor.com/images/92c0184e806c8f9d5fec2bb19e540fcd/tenor.gif',
    'https://media.tenor.com/images/6330187195a6de27eca97dce86d89219/tenor.gif',
    'https://media.tenor.com/images/ec3b13c11e1e8e2d1b2a3c4d5e6f7g8h/tenor.gif',
    'https://media.tenor.com/images/i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4/tenor.gif',
  ],

  highfive: [
    'https://media.tenor.com/images/88491e31f99fb23dd906c4b3e7349559/tenor.gif',
    'https://media.tenor.com/images/a72b07a7aaab8c3c8d9e0f1g2h3i4j5k/tenor.gif',
    'https://media.tenor.com/images/l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0ab/tenor.gif',
  ],

  hug: [
    'https://media.tenor.com/images/3065c3d3e0a8e6e6e6e6e6e6e6e6e6e6/tenor.gif',
    'https://media.tenor.com/images/cd10bd57c6fa19cfbfbe3c0903c8d42a/tenor.gif',
    'https://media.tenor.com/images/c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6/tenor.gif',
  ],

  kiss: [
    'https://media.tenor.com/images/8b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q/tenor.gif',
    'https://media.tenor.com/images/r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1/tenor.gif',
    'https://media.tenor.com/images/h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7/tenor.gif',
  ],

  pat: [
    'https://media.tenor.com/images/x8y9z0a1b2c3d4e5f6g7h8i9j0k1l2m3/tenor.gif',
    'https://media.tenor.com/images/n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9/tenor.gif',
    'https://media.tenor.com/images/d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5/tenor.gif',
  ],

  slap: [
    'https://media.tenor.com/images/t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1/tenor.gif',
    'https://media.tenor.com/images/j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7/tenor.gif',
    'https://media.tenor.com/images/z8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3/tenor.gif',
  ],

  // Helper function to get random GIF from an array
  getRandomGif(category) {
    const gifs = this[category];
    if (!gifs || gifs.length === 0) {
      console.warn(`⚠️ No GIFs found for category: ${category}`);
      return 'https://cdn.discordapp.com/attachments/1110915631720370216/1110915721839185970/Looki_Default.gif';
    }
    return gifs[Math.floor(Math.random() * gifs.length)];
  },

  // Get a set of GIFs for a category
  getGifs(category) {
    return this[category] || [];
  },
};
