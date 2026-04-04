const { Innertube, UniversalCache } = require('youtubei.js');
const fs = require('fs');
const path = require('path');

let yt;

function parseCookies(filePath) {
    // 1. Check for environment variable first (Highest priority)
    if (process.env.YOUTUBE_COOKIE) {
        return process.env.YOUTUBE_COOKIE.trim();
    }

    // 2. Fallback to physical cookies.txt file
    const possiblePaths = [filePath, filePath.replace('cookies.txt', 'Cookies.txt')];
    let content = null;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            content = fs.readFileSync(p, 'utf8');
            break;
        }
    }
    if (!content) return null;
    
    // Parse Netscape format with domain filtering (Critical for large files)
    const cookieString = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
            const parts = line.split('\t');
            if (parts.length >= 7) {
                const domain = parts[0].trim();
                // Only include cookies for YouTube or Google
                if (domain.includes('youtube.com') || domain.includes('google.com')) {
                    const name = parts[5].trim();
                    const value = parts[6].trim();
                    return `${name}=${value}`;
                }
            }
            return null;
        })
        .filter(Boolean)
        .join('; ');

    if (cookieString) {
        console.log('🌸 [YouTube] Successfully parsed and filtered cookies.txt');
    }
    return cookieString || null;
}

async function getYouTubeClient(forceNew = false) {
    if (!yt || forceNew) {
        const cookiePath = path.join(__dirname, '../cookies.txt');
        const cookie = parseCookies(cookiePath);
        
        yt = await Innertube.create({
            cache: new UniversalCache(false),
            // Optimized settings for cookie-based auth
            client_type: 'WEB',
            generate_session_locally: false,
            retrieve_player: true,
            cookie: cookie || undefined,
        });

        console.log(cookie 
            ? '🌸 [YouTube] Client ready with cookies'
            : '⚠️ [YouTube] Client ready WITHOUT cookies (may fail)'
        );
    }
    return yt;
}

async function getRobustYouTubeStream(url) {
    const client = await getYouTubeClient();

    const videoId = extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    let info = await client.getInfo(videoId);

    if (!info.streaming_data) {
        // Force new client if session is stale
        const freshClient = await getYouTubeClient(true);
        info = await freshClient.getInfo(videoId);
        if (!info.streaming_data) {
            throw new Error('No streaming data - video may be restricted.');
        }
    }

    return await streamFromInfo(client, info, videoId);
}

async function streamFromInfo(client, info, videoId) {
    const { Readable } = require('stream');
    const stream = await client.download(videoId, {
        type: 'audio',
        quality: 'best',
        format: 'any',
    });

    const nodeStream = Readable.fromWeb(stream);
    return { stream: nodeStream, type: 'arbitrary' };
}

function extractVideoId(url) {
    const patterns = [
        /(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
        const match = url.match(p);
        if (match) return match[1];
    }
    return null;
}

async function getRobustYouTubeInfo(url) {
    const client = await getYouTubeClient();
    const videoId = extractVideoId(url);
    const video = await client.getInfo(videoId);

    const duration = video.basic_info.duration || 0;
    const formatted = new Date(duration * 1000)
        .toISOString()
        .substr(11, 8)
        .replace(/^00:/, '');

    return {
        title: video.basic_info.title,
        url: `https://www.youtube.com/watch?v=${video.basic_info.id}`,
        thumbnail: video.basic_info.thumbnail?.[0]?.url,
        durationRaw: formatted,
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
        durationRaw: video.timestamp,
    };
}

module.exports = { 
    getYouTubeClient, 
    getRobustYouTubeStream, 
    getRobustYouTubeInfo, 
    getYouTubeSearch, 
    parseCookies 
};
