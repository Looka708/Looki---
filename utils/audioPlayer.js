const ytdl = require('@distube/ytdl-core');
const play = require('play-dl');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { PassThrough } = require('stream');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior, StreamType } = require('@discordjs/voice');
const { getRobustYouTubeStream, parseCookies } = require('./youtube');
const { getQueue, setPlaying, skipSong } = require('./musicManager');
const { createEmbed } = require('./embedBuilder');

const players = new Map(); // guildId -> AudioPlayer

function getPlayer(guildId) {
    if (!players.has(guildId)) {
        const player = createAudioPlayer({
            behaviors: { noSubscriber: NoSubscriberBehavior.Pause }
        });
        players.set(guildId, player);
    }
    return players.get(guildId);
}

/**
 * Gets a playable stream using yt-dlp as a robust backup
 */
async function getYouTubeStream(url) {
  // 1. Try play-dl (Primary/Fastest)
  try {
    console.log(`[Music] Attempting play-dl for ${url}...`);
    const streamData = await play.stream(url, { discordPlayerCompatibility: true });
    return { stream: streamData.stream, type: streamData.type };
  } catch (playError) {
    console.log(`[Music] play-dl blocked. Switching to yt-dlp (Nuclear Option)...`);
  }

  // 2. yt-dlp Subprocess (Best for bypassing Koyeb IP blocks)
  return new Promise((resolve, reject) => {
    const cookiePath = path.join(__dirname, '../cookies.txt');
    
    // yt-dlp Arguments for high-performance audio streaming
    const args = [
      '--no-playlist',
      '-x', // Extract audio
      '--audio-format', 'opus', // Best for Discord
      '-o', '-', // Output to stdout
      '--no-warnings',
      '--ignore-errors',
      url
    ];

    // Add cookies if available
    if (fs.existsSync(cookiePath)) {
      args.push('--cookies', cookiePath);
      console.log('🌸 [yt-dlp] Using cookies.txt for auth');
    }

    const ytdlp = spawn('yt-dlp', args);
    const passthrough = new PassThrough();

    // Pipe stdout to our stream
    ytdlp.stdout.pipe(passthrough);

    // Logging errors from yt-dlp
    ytdlp.stderr.on('data', (data) => {
      const msg = data.toString();
      if (!msg.includes('WARNING')) {
        console.error('[yt-dlp Log]', msg.trim());
      }
    });

    ytdlp.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(new Error('yt-dlp not found! Make sure "pip install yt-dlp" is in your start script.'));
      } else {
        reject(err);
      }
    });

    ytdlp.on('spawn', () => {
      console.log('🌸 [yt-dlp] Subprocess spawned successfully');
      resolve({ stream: passthrough, type: StreamType.Arbitrary });
    });
  });
}

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

        player.removeAllListeners(AudioPlayerStatus.Idle);
        player.removeAllListeners('error');

        player.once(AudioPlayerStatus.Idle, () => {
            skipSong(guildId);
            playNext(guildId, client, channel);
        });

        player.once('error', (err) => {
            console.error(`[Player] Guild ${guildId} Error:`, err.message);
            skipSong(guildId);
            playNext(guildId, client, channel);
        });

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
        console.error(`[Player] Failed to load ${song.title}:`, err.message);
        if (channel) {
            channel.send(`❌ Failed to stream **${song.title}**. This might be due to a strict YouTube IP block on Koyeb. Skipping...`).catch(() => {});
        }
        skipSong(guildId);
        playNext(guildId, client, channel);
    }
}

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
