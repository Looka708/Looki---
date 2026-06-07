const TemporaryBan = require('../models/TemporaryBan');
const ServerMusicSettings = require('../models/ServerMusicSettings');
const { safeJoin, waitForOnlineMusicNode } = require('../utils/audioPlayer');
const { ActivityType } = require('discord.js');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log('Looki is online.');

    await restoreExpiredBans(client);
    await restore247Connections(client);

    const statuses = [
      { name: 'over the server', type: ActivityType.Watching },
      { name: 'music for everyone', type: ActivityType.Playing },
      { name: 'the queue', type: ActivityType.Watching },
    ];

    let currentStatus = 0;
    setInterval(() => {
      const status = statuses[currentStatus];
      client.user.setActivity(status.name, { type: status.type });
      currentStatus = (currentStatus + 1) % statuses.length;
    }, 30000);

    setInterval(async () => {
      await restoreExpiredBans(client);
    }, 5 * 60 * 1000);
  },
};

async function restore247Connections(client) {
  try {
    const settingsList = await ServerMusicSettings.get247Guilds();
    if (settingsList.length && !await waitForOnlineMusicNode(client, 30000)) {
      console.warn('[24/7] Skipping restore because no Lavalink node is online.');
      return;
    }

    for (const settings of settingsList) {
      try {
        if (!settings.music_channel_id) continue;
        const guild = client.guilds.cache.get(settings.guild_id)
          || await client.guilds.fetch(settings.guild_id);
        const voiceChannel = await guild.channels.fetch(settings.music_channel_id);

        if (!voiceChannel?.isVoiceBased()) {
          console.warn(`[24/7] Voice channel missing in guild ${settings.guild_id}`);
          continue;
        }

        const player = await safeJoin(client.kazagumo, guild.id, voiceChannel.id, guild.shardId);
        player.textId = settings.music_text_channel_id || null;
        player.data.set('stay247', true);
        if (settings.default_volume !== undefined) player.setVolume(settings.default_volume);
        const loopModes = ['none', 'track', 'queue'];
        player.setLoop(loopModes[settings.loop_default_mode] || 'none');
        console.log(`[24/7] Restored ${guild.name} -> ${voiceChannel.name}`);
      } catch (error) {
        console.error(`[24/7] Failed to restore guild ${settings.guild_id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('[24/7] Failed to load saved connections:', error.message);
  }
}

async function restoreExpiredBans(client) {
  try {
    const expiredBans = await TemporaryBan.getAllExpiredBans();

    for (const ban of expiredBans) {
      try {
        const guild = await client.guilds.fetch(ban.guild_id);
        await guild.members.unban(ban.user_id, 'Temporary ban expired');
        await TemporaryBan.markAsExpired(ban.id);
        console.log(`[TempBan] Unbanned user ${ban.user_id} in guild ${ban.guild_id}`);
      } catch (error) {
        console.error(`[TempBan] Error unbanning user ${ban.user_id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('[TempBan] Restore error:', error);
  }
}
