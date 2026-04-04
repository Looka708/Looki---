const { createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const play = require('play-dl');
const ytdl = require('@distube/ytdl-core');
const { getYouTubeClient, getRobustYouTubeStream, getYouTubeSearch, parseCookies } = require('./youtube');
const { getQueue, deleteQueue } = require('./musicManager');
const { EmbedBuilder } = require('discord.js');
const { createEmbed } = require('./embedBuilder');
const path = require('path');

async function getYouTubeStream(url) {
  try {
    // 1. Try play-dl (Fastest, best performance)
    console.log(`[Music] Attempting play-dl for ${url}...`);
    const streamData = await play.stream(url, { discordPlayerCompatibility: true });
    return { stream: streamData.stream, type: streamData.type };
  } catch (error) {
    if (error.message?.includes('Sign in to confirm you’re not a bot') || error.message?.includes('403') || error.message?.includes('Unrecoverable')) {
      console.log(`[Music] play-dl blocked for ${url}. Trying robust fallback (youtubei.js)...`);
      try {
        // 2. Robust fallback (Innertube) - Much more stable than ytdl-core right now
        return await getRobustYouTubeStream(url);
      } catch (robustError) {
        console.log(`[Music] youtubei.js also failed. Trying ytdl-core (last resort)...`);
        try {
          // 3. Final resort: ytdl-core with IOS client and cookies
          const cookiePath = path.join(__dirname, '../cookies.txt');
          const cookie = parseCookies(cookiePath);
          
          const stream = ytdl(url, {
            filter: 'audioonly',
            playerClients: ['IOS'],
            highWaterMark: 1 << 25,
            requestOptions: {
               headers: {
                  cookie: cookie || ''
               }
            }
          });
          return { stream, type: 'opus' };
        } catch (finalError) {
          throw new Error('All streaming methods are currently blocked by YouTube Bot-Guard.');
        }
      }
    }
    throw error;
  }
}

async function safeSearch(query) {
    try {
        const results = await play.search(query, { limit: 1 });
        if (results.length > 0) return results[0];
        return await getYouTubeSearch(query);
    } catch (e) {
        return await getYouTubeSearch(query);
    }
}

async function playNext(guildId, client, textChannel) {
  const queue = getQueue(guildId);
  if (!queue || !queue.connection) return;

  if (queue.songs.length === 0 && !queue.currentSong) {
    queue.isPlaying = false;
    queue.connection.destroy();
    deleteQueue(guildId);
    if (textChannel) {
      const embed = createEmbed('music', client)
        .setTitle('⏹️ Queue empty')
        .setDescription('No more songs to play! Leaving voice channel...');
      textChannel.send({ embeds: [embed] }).catch(() => {});
    }
    return;
  }

  // Get next song
  let song;
  if (queue.repeat === 'one' && queue.currentSong) {
    song = queue.currentSong;
  } else {
    song = queue.songs.shift();
  }

  if (!song) {
    playNext(guildId, client, textChannel);
    return;
  }
  
  queue.currentSong = song;
  queue.isPlaying = true;

  try {
    let stream;
    let type;
    
    // Check if it's a youtube url or search query
    if (song.url.includes('youtube.com') || song.url.includes('youtu.be')) {
      const result = await getYouTubeStream(song.url);
      stream = result.stream;
      type = result.type;
    } else if (song.url.includes('spotify.com')) {
       // Spotify support with play-dl
       if (play.is_expired()) await play.refreshToken();
       const sp_data = await play.spotify(song.url);
       const search = await safeSearch(`${sp_data.name} ${sp_data.artists[0]?.name || ''}`);
       if (!search) throw new Error("Could not find Spotify track on YouTube");
       const result = await getYouTubeStream(search.url);
       stream = result.stream;
       type = result.type;
    } else {
      const search = await safeSearch(song.title);
      if (!search) throw new Error("Track not found");
      const result = await getYouTubeStream(search.url);
      stream = result.stream;
      type = result.type;
      song.url = search.url; // update the url
      if(!song.thumbnail && (search.thumbnails?.length || search.thumbnail)) {
          song.thumbnail = search.thumbnails?.[0]?.url || search.thumbnail;
      }
    }

    const resource = createAudioResource(stream, { inputType: type, inlineVolume: true });
    resource.volume.setVolume(queue.volume);

    if (!queue.audioPlayer) {
      queue.audioPlayer = createAudioPlayer();

      queue.audioPlayer.on(AudioPlayerStatus.Idle, () => {
        queue.currentSong = null;
        if (queue.repeat === 'all' && song) {
          queue.songs.push(song);
        }
        playNext(guildId, client, textChannel);
      });

      queue.audioPlayer.on('error', error => {
        console.error('AudioPlayerError:', error);
        queue.currentSong = null;
        playNext(guildId, client, textChannel);
      });

      queue.connection.on(VoiceConnectionStatus.Disconnected, () => {
         queue.audioPlayer?.stop(true);
         deleteQueue(guildId);
      });

      queue.connection.subscribe(queue.audioPlayer);
    }

    queue.audioPlayer.play(resource);

    if (textChannel) {
      const embed = createEmbed('music', client)
        .setTitle('🎶 Now Playing')
        .setDescription(`**[${song.title}](${song.url})**\n\n**Requested by:** ${song.requester}`);
      
      if (song.thumbnail) {
        embed.setThumbnail(song.thumbnail);
      }
      textChannel.send({ embeds: [embed] }).catch(() => {});
    }
  } catch (error) {
    console.error(`Error playing song ${song.url}:`, error);
    if (textChannel) {
      const errEmbed = createEmbed('error', client).setTitle('❌ Playback Error').setDescription(`Failed to play ${song.title}\n*Tip: YouTube is being strict with bots lately.*`);
      textChannel.send({ embeds: [errEmbed] }).catch(() => {});
    }
    queue.currentSong = null;
    playNext(guildId, client, textChannel);
  }
}

module.exports = { playNext };

