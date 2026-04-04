const { Innertube, UniversalCache } = require('youtubei.js');
const fs = require('fs');
const path = require('path');

let yt;

function parseCookies(filePath) {
    if (process.env.YOUTUBE_COOKIE) {
        return process.env.YOUTUBE_COOKIE.trim();
    }

    const possiblePaths = [filePath, filePath.replace('cookies.txt', 'Cookies.txt')];
    let content = null;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            content = fs.readFileSync(p, 'utf8');
            break;
        }
    }
    if (!content) return null;
    
    // Parse Netscape format into modern JSON format
    const cookies = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
            const parts = line.split('\t');
            if (parts.length >= 7) {
                const domain = parts[0].trim();
                // Filter for YouTube/Google
                if (domain.includes('youtube.com') || domain.includes('google.com')) {
                    return {
                        name: parts[5].trim(),
                        value: parts[6].trim(),
                        domain: parts[0].trim(),
                        path: parts[2].trim(),
                        secure: parts[3].trim() === 'TRUE',
                        expiry: parseInt(parts[4].trim())
                    };
                }
            }
            return null;
        })
        .filter(Boolean);

    if (cookies.length > 0) {
        console.log(`🌸 [YouTube] Successfully parsed ${cookies.length} relevant cookies`);
    }
    return cookies;
}

// Helper to convert structured cookies back to string if needed
function cookiesToString(cookies) {
    if (!Array.isArray(cookies)) return cookies;
    return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}

async function getYouTubeClient(forceNew = false) {
    if (!yt || forceNew) {
        const cookiePath = path.join(__dirname, '../cookies.txt');
        const cookies = parseCookies(cookiePath);
        
        // Innertube prefers string or array of strings, so we convert back for this specifically
        const cookieString = cookiesToString(cookies);

        yt = await Innertube.create({
            cache: new UniversalCache(false),
            client_type: 'WEB',
            generate_session_locally: false,
            retrieve_player: true,
            cookie: cookieString || undefined,
        });

        console.log(cookieString 
            ? '🌸 [YouTube] Client ready with cookies'
            : '⚠️ [YouTube] Client ready WITHOUT cookies'
        );
    }
    return yt;
}

async function getRobustYouTubeStream(url) {
    const client = await getYouTubeClient();
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    try {
        const info = await client.getInfo(videoId);
        
        // Use download method as it handles signatures better with cookies
        const stream = await client.download(videoId, {
            type: 'audio',
            quality: 'best',
            format: 'any',
        });

        const { Readable } = require('stream');
        const nodeStream = Readable.fromWeb(stream);
        return { stream: nodeStream, type: 'arbitrary' };
    } catch (e) {
        console.error(`❌ [YouTube] Robust stream error: ${e.message}`);
        throw e;
    }
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
    parseCookies,
    cookiesToString
};
