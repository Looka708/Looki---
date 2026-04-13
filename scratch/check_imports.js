const { Kazagumo, Plugins } = require('kazagumo');
try {
    const Spotify = require('kazagumo-spotify');
    console.log('✅ Spotify plugin loaded successfully');
    console.log('Spotify type:', typeof Spotify);
} catch (e) {
    console.error('❌ Failed to load Spotify plugin:', e.message);
}
