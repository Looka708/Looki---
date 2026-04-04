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
  const { spawn } = require('child_process');
  const { PassThrough } = require('stream');
  const { StreamType } = require('@discordjs/voice');

  const YTDLP_PATH = fs.existsSync('/tmp/yt-dlp') ? '/tmp/yt-dlp' : (fs.existsSync(path.join(__dirname, '../yt-dlp')) ? path.join(__dirname, '../yt-dlp') : 'yt-dlp');
  const cookiePath = path.join(__dirname, '../cookies.txt');

  const ytArgs = [
      '-f', 'bestaudio',
      '--no-playlist',
      '--no-warnings',
      '--quiet',
      '-o', '-',
  ];

  if (fs.existsSync(cookiePath)) {
      ytArgs.push('--cookies', cookiePath);
      console.log('🌸 [yt-dlp] Using cookies.txt');
  }

  ytArgs.push(url);

  const ffArgs = [
      '-hide_banner',
      '-loglevel', 'error',
      '-i', 'pipe:0',
      '-f', 's16le',    // raw PCM
      '-ar', '48000',   // Discord sample rate
      '-ac', '2',       // stereo
      'pipe:1',
  ];

  return new Promise((resolve, reject) => {
      // Determine if we should use python fallback
      let finalYtdlpCmd = YTDLP_PATH;
      let finalYtdlpArgs = ytArgs;
      
      if (YTDLP_PATH === 'yt-dlp') {
          // Check if system yt-dlp exists, otherwise use python
          try {
              require('child_process').execSync('yt-dlp --version');
          } catch(e) {
              finalYtdlpCmd = process.platform === 'win32' ? 'python' : 'python3';
              finalYtdlpArgs = ['-m', 'yt_dlp', ...ytArgs];
              console.log(`🌸 [yt-dlp] Falling back to ${finalYtdlpCmd} -m yt_dlp`);
          }
      }

      const ytdlp = spawn(finalYtdlpCmd, finalYtdlpArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
      const ffmpeg = spawn(ffmpegPath || 'ffmpeg', ffArgs, { stdio: ['pipe', 'pipe', 'pipe'] });

      ytdlp.stdout.pipe(ffmpeg.stdin);

      ytdlp.stderr.on('data', d => {
          const msg = d.toString().trim();
          if (msg && !msg.includes('Extracting')) console.error('[yt-dlp stderr]', msg);
      });

      ffmpeg.stderr.on('data', d => {
          const msg = d.toString().trim();
          if (msg) console.error('[ffmpeg stderr]', msg);
      });

      ytdlp.on('error', err => reject(new Error(`yt-dlp spawn failed: ${err.message}`)));
      ffmpeg.on('error', err => reject(new Error(`ffmpeg spawn failed: ${err.message}`)));

      ytdlp.on('close', code => {
          if (code !== 0 && code !== null) {
              console.error(`[yt-dlp] exited with code ${code}`);
          }
      });

      const passthrough = new PassThrough();
      ffmpeg.stdout.pipe(passthrough);

      passthrough.once('data', () => {
          console.log('🌸 [yt-dlp] PCM stream flowing');
      });

      ffmpeg.on('spawn', () => {
          console.log('🌸 [yt-dlp] yt-dlp → ffmpeg pipeline ready');
          resolve({
              stream: passthrough,
              type: StreamType.Raw,  // Raw PCM
          });
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
