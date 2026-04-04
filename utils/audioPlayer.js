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

// Use ffmpeg-static to ensure ffmpeg is available without manual installation
const ffmpegPath = require('ffmpeg-static');
process.env.FFMPEG_PATH = ffmpegPath; 

const players = new Map(); // guildId -> AudioPlayer

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

async function getYouTubeStream(url) {
  try {
    // 1. Try play-dl (Fastest)
    console.log(`[Music] Attempting play-dl for ${url}...`);
    const streamData = await play.stream(url, { discordPlayerCompatibility: true });
    return { stream: streamData.stream, type: streamData.type };
  } catch (playError) {
    console.log(`[Music] play-dl blocked. Switching to raw yt-dlp stream...`);
  }

  // 2. yt-dlp Subprocess (Raw output)
  return new Promise((resolve, reject) => {
    const cookiePath = path.join(__dirname, '../cookies.txt');
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    
    // Simpler, faster command for streaming
    const args = [
      '-m', 'yt_dlp',
      '--no-playlist',
      '--no-warnings',
      '--ignore-errors',
      '--no-part',         // Stay in memory, no temporary files
      '-f', 'bestaudio/best', // Fetch the cleanest bitstream
      '-o', '-',           // Pipe to stdout
      url
    ];

    if (fs.existsSync(cookiePath)) {
      args.push('--cookies', cookiePath);
      console.log('🌸 [yt-dlp] Using cookies.txt for auth');
    }

    const ytdlp = spawn(pythonCmd, args);
    const passthrough = new PassThrough();

    ytdlp.stdout.pipe(passthrough);

    ytdlp.stderr.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('ERROR:')) {
        console.error('[yt-dlp Error]', msg.trim());
      }
    });

    ytdlp.on('error', (err) => {
      reject(new Error(`yt-dlp error: ${err.message}`));
    });

    ytdlp.on('spawn', () => {
      console.log('🌸 [yt-dlp] Stream pipeline established');
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
            console.log(`🔊 [Player] Volume set to ${queue.volume ?? 1}`);
        }

        queue.connection.subscribe(player);
        player.play(resource);
        setPlaying(guildId, true);

        // Debug log for actual playback start
        player.once(AudioPlayerStatus.Playing, () => {
            console.log(`🌸 [Player] Now live: ${song.title}`);
        });

        player.removeAllListeners(AudioPlayerStatus.Idle);
        player.removeAllListeners('error');

        player.once(AudioPlayerStatus.Idle, () => {
            console.log(`🌸 [Player] Finished track, moving to next...`);
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
        console.error(`[Player] Playback loop failed:`, err.message);
        if (channel) {
            channel.send(`❌ Streaming failed. Skipping...`).catch(() => {});
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

module.exports = { getYouTubeStream, playNext, stopPlayer, getPlayer };
