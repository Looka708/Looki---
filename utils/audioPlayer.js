const ytdl = require('@distube/ytdl-core');
const play = require('play-dl');
const path = require('path');
const { getRobustYouTubeStream, parseCookies } = require('./youtube');

/**
 * Gets a playable stream from a YouTube URL using multiple fallback methods
 */
async function getYouTubeStream(url) {
  try {
    // 1. Try play-dl (Fastest)
    console.log(`[Music] Attempting play-dl for ${url}...`);
    const streamData = await play.stream(url, { discordPlayerCompatibility: true });
    return { stream: streamData.stream, type: streamData.type };
  } catch (error) {
    console.log(`[Music] play-dl blocked for ${url}. Trying robust fallback (youtubei.js)...`);
    
    try {
      // 2. Robust fallback (Innertube)
      return await getRobustYouTubeStream(url);
    } catch (robustError) {
      console.log(`[Music] youtubei.js also failed. Trying ytdl-core (last resort)...`);
      
      try {
        // 3. Final resort: ytdl-core with modern Cookie Agent
        const cookiePath = path.join(__dirname, '../cookies.txt');
        const cookiesArray = parseCookies(cookiePath);
        
        let agent;
        if (cookiesArray && Array.isArray(cookiesArray)) {
          console.log(`[Music] Injecting ${cookiesArray.length} cookies into ytdl-core Agent`);
          agent = ytdl.createAgent(cookiesArray);
        }

        const stream = ytdl(url, {
          filter: 'audioonly',
          quality: 'highestaudio',
          highWaterMark: 1 << 25,
          agent: agent || undefined,
          playerClients: ['IOS', 'ANDROID', 'WEB'],
        });
        
        return { stream, type: 'opus' };
      } catch (finalError) {
        console.error('Final resort error:', finalError.message);
        throw new Error('All streaming methods blocked by Bot-Guard. The Koyeb IP might be throttled. Try fresh cookies!');
      }
    }
  }
}

module.exports = { getYouTubeStream };
