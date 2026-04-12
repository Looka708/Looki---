const { Innertube, UniversalCache } = require('youtubei.js');
const fs = require('fs');
const path = require('path');

let yt;

function parseCookies(input) {
    let content = '';
    
    if (typeof input === 'string' && (input.includes('/') || input.includes('\\'))) {
        const possiblePaths = [input, input.replace('cookies.txt', 'Cookies.txt')];
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                content = fs.readFileSync(p, 'utf8');
                break;
            }
        }
    } else if (process.env.YOUTUBE_COOKIE) {
        content = process.env.YOUTUBE_COOKIE.trim();
    } else if (typeof input === 'string') {
        content = input;
    }

    if (!content) return null;
    
    try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed;
    } catch (e) {}

    const cookies = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
            const parts = line.split('\t');
            if (parts.length >= 7) {
                const domain = parts[0].trim();
                if (domain.includes('youtube.com') || domain.includes('google.com')) {
                    const cookieName = parts[5].trim();
                    // Netscape format: domain, flag, path, secure, expiration, name, value
                    // flag (parts[1]): TRUE = accessible to all subdomains → hostOnly=false
                    const subdomainFlag = parts[1].trim().toUpperCase() === 'TRUE';
                    const isSecure = parts[3].trim().toUpperCase() === 'TRUE';
                    const expiration = parseInt(parts[4].trim());
                    const isHttpOnly = cookieName.startsWith('__Secure-') || 
                                       cookieName === 'SID' || 
                                       cookieName === 'HSID' ||
                                       cookieName === 'SSID' ||
                                       cookieName === 'LOGIN_INFO';

                    const cookie = {
                        name: cookieName,
                        value: parts[6].trim(),
                        domain: domain,
                        path: parts[2].trim(),
                        secure: isSecure,
                        httpOnly: isHttpOnly,
                        hostOnly: !subdomainFlag,
                        sameSite: 'no_restriction',
                    };

                    // Only set expirationDate for non-session cookies (expiration > 0)
                    // Session cookies (expiration=0) must NOT have expirationDate
                    // so tough-cookie treats them as "Infinity" (never expire)
                    if (expiration > 0) {
                        cookie.expirationDate = expiration;
                    }

                    return cookie;
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

function cookiesToString(cookies) {
    if (!cookies) return '';
    if (typeof cookies === 'string') return cookies;
    if (Array.isArray(cookies)) {
        return cookies.map(c => `${c.name}=${c.value}`).join('; ');
    }
    return '';
}

async function getYouTubeClient(forceNew = false) {
    if (!yt || forceNew) {
        let cookiePath = null;
        const cookieFiles = ['www.youtube.com_cookies.txt', 'cookies.txt', 'Cookies.txt'];
        
        for (const file of cookieFiles) {
            const fullPath = path.join(__dirname, '..', file);
            if (fs.existsSync(fullPath)) {
                cookiePath = fullPath;
                break;
            }
        }

        const cookies = cookiePath ? parseCookies(cookiePath) : null;
        const cookieString = cookiesToString(cookies);

        yt = await Innertube.create({
            cache: new UniversalCache(false),
            client_type: 'WEB',
            generate_session_locally: false,
            retrieve_player: true,
            cookie: cookieString || undefined,
        });

        console.log(cookieString 
            ? `🌸 [YouTube] Client ready with ${cookies.length} cookies`
            : '🥺 [YouTube] Client ready WITHOUT cookies'
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
        
        // Debugging for silence or failure
        console.log('[YTJS] streaming_data exists:', !!info.streaming_data);
        if (!info.streaming_data) throw new Error('No streaming_data returned');

        const stream = await client.download(videoId, {
            type: 'audio',
            quality: 'best',
            format: 'any',
        });

        const { Readable } = require('stream');
        const nodeStream = Readable.fromWeb(stream);
        return { stream: nodeStream, type: 'arbitrary' };
    } catch (e) {
        console.error(`🥺 [YTJS] Full error: ${e.message}`);
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
    const formatted = new Date(duration * 1000).toISOString().substr(11, 8).replace(/^00:/, '');
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

function getCookiePath() {
    const cookieFiles = ['www.youtube.com_cookies.txt', 'cookies.txt', 'Cookies.txt'];
    for (const file of cookieFiles) {
        const fullPath = path.join(__dirname, '..', file);
        if (fs.existsSync(fullPath)) return fullPath;
    }
    return null;
}

module.exports = { 
    getYouTubeClient, 
    getRobustYouTubeStream, 
    getRobustYouTubeInfo, 
    getYouTubeSearch, 
    parseCookies,
    cookiesToString,
    getCookiePath
};
