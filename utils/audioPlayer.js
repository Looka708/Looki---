const ytdl = require('@distube/ytdl-core');
const play = require('play-dl');
const path = require('path');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const { getRobustYouTubeStream, parseCookies } = require('./youtube');
const { getQueue, setPlaying, skipSong } = require('./musicManager');
const { createEmbed } = require('./embedBuilder');

const players = new Map(); // guildId -> AudioPlayer

/**
 * Gets or creates an AudioPlayer for a specific guild
 */
function getPlayer(guildId) {
    if (!players.has(guildId)) {
        const player = createAudioPlayer({
            behaviors: { 
                noSubscriber: NoSubscriberBehavior.Pause 
            }
        });
        players.set(guildId, player);
    }
    return players.get(guildId);
}

/**
 * Gets a playable stream from a YouTube URL
 */
async function getYouTubeStream(url) {
  try {
    // 1. Try play-dl
    console.log(`[Music] Attempting play-dl for ${url}...`);
    const streamData = await play.stream(url, { discordPlayerCompatibility: true });
    return { stream: streamData.stream, type: streamData.type };
  } catch (error) {
    console.log(`[Music] play-dl blocked for ${url}. Trying robust fallback (youtubei.js)...`);
    
    try {
      // 2. Robust fallback
      return await getRobustYouTubeStream(url);
    } catch (robustError) {
      console.log(`[Music] youtubei.js also failed. Trying ytdl-core (last resort)...`);
      
      try {
        // 3. Final resort: ytdl-core with Agent
        const cookiePath = path.join(__dirname, '../cookies.txt');
        const cookiesArray = parseCookies(cookiePath);
        
        let agent;
        if (cookiesArray && Array.isArray(cookiesArray)) {
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
        throw new Error('All streaming methods blocked by Bot-Guard.');
      }
    }
  }
}

/**
 * Logic to play the next song in the queue
 */
async function playNext(guildId, client, channel) {
    const queue = getQueue(guildId);

    if (!queue || !queue.songs.length) {
        setPlaying(guildId, false);
        return;
    }

    const song = queue.songs[0];
    const player = getPlayer(guildId);

    try {
        const { stream, type } = await getYouTubeStream(song.url);

        const resource = createAudioResource(stream, {
            inputType: type,
            inlineVolume: true
        });
        
        if (resource.volume) {
            resource.volume.setVolume(queue.volume ?? 1);
        }

        queue.connection.subscribe(player);
        player.play(resource);
        setPlaying(guildId, true);

        // Clear existing listeners to prevent memory leaks and "double skips"
        player.removeAllListeners(AudioPlayerStatus.Idle);
        player.removeAllListeners('error');

        // Automatic transition to next song
        player.once(AudioPlayerStatus.Idle, () => {
            skipSong(guildId);
            playNext(guildId, client, channel);
        });

        // Error handling during playback
        player.once('error', (err) => {
            console.error(`[Player] Error in guild ${guildId}:`, err.message);
            if (channel) {
                channel.send(`❌ Encountered a playback error. Skipping...`).catch(() => {});
            }
            skipSong(guildId);
            playNext(guildId, client, channel);
        });

        // Now Playing Notification
        if (channel) {
            const embed = createEmbed('music', client)
                .setTitle('🎵 Now Playing')
                .setDescription(`**[${song.title}](${song.url})**`)
                .addFields(
                    { name: '👤 Requester', value: `<@${song.requesterId}>`, inline: true },
                    { name: '⏱ Duration', value: song.durationRaw || 'Unknown', inline: true }
                );
            if (song.thumbnail) embed.setThumbnail(song.thumbnail);
            channel.send({ embeds: [embed] }).catch(() => {});
        }

    } catch (err) {
        console.error(`[Player] Failed to play ${song.title}:`, err.message);
        if (channel) {
            channel.send(`❌ Failed to stream **${song.title}**. Skipping...`).catch(() => {});
        }
        skipSong(guildId);
        playNext(guildId, client, channel);
    }
}

/**
 * Cleanly stops a player for a server
 */
function stopPlayer(guildId) {
    const player = players.get(guildId);
    if (player) {
        player.removeAllListeners();
        player.stop();
        players.delete(guildId);
    }
}

module.exports = { 
    getYouTubeStream,
    playNext,
    stopPlayer,
    getPlayer
};
