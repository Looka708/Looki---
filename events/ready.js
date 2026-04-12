const TemporaryBan = require('../models/TemporaryBan');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log('✦ Looki is online! 🌸');
    
    // Restore temporary bans that should have expired
    await restoreExpiredBans(client);

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

    // Check for expired bans every 5 minutes
    setInterval(async () => {
      await restoreExpiredBans(client);
    }, 5 * 60 * 1000); // 5 minutes
  },
};

async function restoreExpiredBans(client) {
  try {
    const expiredBans = await TemporaryBan.getAllExpiredBans();
    
    for (const ban of expiredBans) {
      try {
        const guild = await client.guilds.fetch(ban.guild_id);
        
        // Unban the user
        await guild.members.unban(ban.user_id, 'Temporary ban expired');
        
        // Mark as processed
        await TemporaryBan.markAsExpired(ban.id);
        
        console.log(`✨ [Temp Ban] Unbanned user ${ban.user_id} in guild ${ban.guild_id}`);
      } catch (error) {
        console.error(`❌ [Temp Ban] Error unbanning user ${ban.user_id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ [Temp Ban Restore] Error:', error);
  }
}
