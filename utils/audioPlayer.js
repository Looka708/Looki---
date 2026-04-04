const { createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const play = require('play-dl');
const ytdl = require('@distube/ytdl-core');
const { getQueue, deleteQueue } = require('./musicManager');
const { EmbedBuilder } = require('discord.js');
const { createEmbed } = require('./embedBuilder');

async function getYouTubeStream(url) {
  try {
    // Try play-dl first (faster, generally better performance)
    const streamData = await play.stream(url, { discordPlayerCompatibility: true });
    return { stream: streamData.stream, type: streamData.type };
  } catch (error) {
    // If it's the bot-guard error, fall back to @distube/ytdl-core with IOS client
    if (error.message?.includes('Sign in to confirm you’re not a bot') || error.message?.includes('403')) {
      console.log(`[Music] Bot-Guard detected for ${url}. Falling back to @distube/ytdl-core (IOS client)...`);
      
      const stream = ytdl(url, {
        filter: 'audioonly',
        playerClients: ['IOS'], // Crucial bypass for Bot-Guard
        highWaterMark: 1 << 25,
      });

      return { stream, type: 'opus' };
    }
    throw error; // Re-throw other errors
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
       // search for the song on YouTube
       const search = await play.search(`${sp_data.name} ${sp_data.artists[0]?.name || ''}`, {
           limit: 1
       });
       if (search.length === 0) {
           throw new Error("Could not find Spotify track on YouTube");
       }
       const result = await getYouTubeStream(search[0].url);
       stream = result.stream;
       type = result.type;
    } else {
      const search = await play.search(song.title, { limit: 1 });
      if (search.length === 0) throw new Error("Track not found");
      const result = await getYouTubeStream(search[0].url);
      stream = result.stream;
      type = result.type;
      song.url = search[0].url; // update the url
      if(!song.thumbnail && search[0].thumbnails?.length) song.thumbnail = search[0].thumbnails[0].url;
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

