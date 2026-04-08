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
  },
};