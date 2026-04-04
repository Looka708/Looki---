const { Innertube, UniversalCache } = require('youtubei.js');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
let yt;

function parseCookies(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
            const parts = line.split('\t');
            return parts.length >= 7 ? `${parts[5]}=${parts[6]}` : null;
        })
        .filter(Boolean)
        .join('; ');
}

async function getYouTubeClient(forceNew = false) {
    if (!yt || forceNew) {
        const cookiePath = path.join(__dirname, '../Cookies.txt');
        const cookie = parseCookies(cookiePath);
        
        yt = await Innertube.create({
            cache: new UniversalCache(false),
            generate_session_locally: true,
            client_type: 'IOS',
            cookie: cookie || undefined
        });

        if (cookie) console.log('🌸 [YouTube] Cookies.txt loaded for youtubei.js');
    }
    return yt;
}

/**
 * Gets a YouTube stream using youtubei.js
 * This is our ultimate fallback when play-dl and ytdl-core are blocked.
 */
async function getRobustYouTubeStream(url) {
    const client = await getYouTubeClient();
    const video = await client.getInfo(url);
    
    // Check if the video has active streaming data
    if (!video.streaming_data) {
        throw new Error('This video is not available for streaming.');
    }

    const stream = await client.download(video.basic_info.id, {
        type: 'audio',
        quality: 'best',
        format: 'any'
    });

    // Innertube's download returns a Web ReadableStream.
    // We need to convert it to a Node.js Readable stream for Discord.
    const { Readable } = require('stream');
    const nodeStream = Readable.fromWeb(stream);
    
    return { stream: nodeStream, type: 'arbitrary' };
}

async function getRobustYouTubeInfo(url) {
    const client = await getYouTubeClient();
    const video = await client.getInfo(url);
    return {
        title: video.basic_info.title,
        url: `https://www.youtube.com/watch?v=${video.basic_info.id}`,
        thumbnail: video.basic_info.thumbnail?.[0]?.url,
        durationRaw: new Date(video.basic_info.duration * 1000).toISOString().substr(11, 8).replace(/^00:/, '')
    };
}

async function getYouTubeSearch(query) {
    const yts = require('yt-search');
    const r = await yts(query);
    const video = r.videos[0];
    if (!video) return null;
    return {
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnail,
        durationRaw: video.timestamp
    };
}

module.exports = {
    getYouTubeClient,
    getRobustYouTubeStream,
    getRobustYouTubeInfo,
    getYouTubeSearch,
    parseCookies
};
