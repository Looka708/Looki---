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
  return new Promise((resolve, reject) => {
    const cookiePath = path.join(__dirname, '../cookies.txt');
    const localDlPath = path.join(__dirname, '../yt-dlp');
    
    let cmd, args;
    
    if (fs.existsSync(localDlPath)) {
      cmd = localDlPath;
      args = [
        '--no-playlist',
        '--no-warnings',
        '--ignore-errors',
        '--no-part',         
        '-f', 'bestaudio/best', 
        '-o', '-',           
        url
      ];
      console.log('🌸 [yt-dlp] Using standalone binary');
    } else {
      cmd = process.platform === 'win32' ? 'python' : 'python3';
      args = [
        '-m', 'yt_dlp',
        '--no-playlist',
        '--no-warnings',
        '--ignore-errors',
        '--no-part',
        '-f', 'bestaudio/best',
        '-o', '-',
        url
      ];
      console.log(`🌸 [yt-dlp] Falling back to ${cmd} -m yt_dlp`);
    }

    if (fs.existsSync(cookiePath)) {
      args.push('--cookies', cookiePath);
      console.log('🌸 [yt-dlp] Adding cookies.txt for authentication');
    }

    // Pipeline: yt-dlp -> ffmpeg -> passthrough
    const ytdlp = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const ffmpeg = spawn(ffmpegPath, [
        '-i', 'pipe:0',        // input from stdin
        '-f', 's16le',         // raw PCM output
        '-ar', '48000',        // 48kHz (Discord requirement)
        '-ac', '2',            // stereo
        '-loglevel', 'error',
        'pipe:1'               // output to stdout
    ], { stdio: ['pipe', 'pipe', 'pipe'] });

    ytdlp.stdout.pipe(ffmpeg.stdin);

    const passthrough = new PassThrough();
    ffmpeg.stdout.pipe(passthrough);

    ffmpeg.stderr.on('data', d => console.error('[ffmpeg]', d.toString().trim()));
    ytdlp.stderr.on('data', d => {
        const msg = d.toString().trim();
        if (msg) console.error('[yt-dlp]', msg);
    });

    ytdlp.on('error', err => reject(new Error(`yt-dlp error: ${err.message}`)));
    ffmpeg.on('error', err => reject(new Error(`ffmpeg error: ${err.message}`)));

    ffmpeg.on('spawn', () => {
        console.log('🌸 [yt-dlp] ffmpeg pipeline ready');
        resolve({ 
            stream: passthrough, 
            type: StreamType.Raw   // Raw PCM = no guessing, Discord plays it directly
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
