const play = require('play-dl');
const path = require('path');
const { parseCookies, cookiesToString } = require('../utils/youtube');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log('✦ Looki is online! 🌸');
    
    const statuses = [
      { name: '🌸 watching over the server', type: 'WATCHING' },
      { name: '💕 protecting looki\'s world', type: 'PLAYING' },
      { name: '✦ keeping it cute & safe', type: 'WATCHING' },
    ];

    let currentStatus = 0;
    setInterval(() => {
      const status = statuses[currentStatus];
      client.user.setActivity(status.name, { type: status.type });
      currentStatus = (currentStatus + 1) % statuses.length;
    }, 30000);

    try {
        const cookiePath = path.join(__dirname, '../cookies.txt');
        const cookies = parseCookies(cookiePath);
        const cookieString = cookiesToString(cookies);
        
        if (cookieString) {
            await play.setToken({ youtube: { cookie: cookieString } });
            console.log('🌸 [Play-dl] Cookies loaded for YouTube auth');
        } else {
            await play.setToken({});
        }
    } catch(e) {
        console.error("Play-dl init optional auth error:", e);
    }
  },
};