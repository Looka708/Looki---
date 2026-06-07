const ServerMusicSettings = require('../models/ServerMusicSettings');
const { createEmbed } = require('../utils/embedBuilder');
const { resolveMusicChannel, sendMusicMessage } = require('../utils/audioPlayer');

const DEFAULT_IDLE_TIMEOUT_MS = 2 * 60 * 1000;

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    const player = client.kazagumo.players.get(oldState.guild.id);
    if (!player) return;

    if (oldState.channelId !== player.voiceId && newState.channelId !== player.voiceId) return;

    const voiceChannel = oldState.guild.channels.cache.get(player.voiceId);
    if (!voiceChannel?.isVoiceBased()) return;

    const listeners = voiceChannel.members.filter(member => !member.user.bot);
    const existingTimer = player.data.get('idleDisconnectTimer');

    if (listeners.size > 0) {
      if (existingTimer) clearTimeout(existingTimer);
      player.data.delete('idleDisconnectTimer');
      return;
    }

    if (player.data.get('stay247') || existingTimer) return;

    const configuredTimeout = Number(process.env.MUSIC_IDLE_TIMEOUT_MS);
    const timeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout >= 15000
      ? configuredTimeout
      : DEFAULT_IDLE_TIMEOUT_MS;

    const timer = setTimeout(async () => {
      const activePlayer = client.kazagumo.players.get(oldState.guild.id);
      if (!activePlayer || activePlayer !== player) return;

      const activeChannel = oldState.guild.channels.cache.get(activePlayer.voiceId);
      const activeListeners = activeChannel?.members?.filter(member => !member.user.bot).size || 0;
      if (activeListeners > 0 || activePlayer.data.get('stay247')) {
        activePlayer.data.delete('idleDisconnectTimer');
        return;
      }

      try {
        const settings = await ServerMusicSettings.getSettings(oldState.guild.id);
        const textChannel = await resolveMusicChannel(client, activePlayer, settings);
        if (textChannel) {
          await sendMusicMessage(client, textChannel, {
            embeds: [createEmbed('music', client)
              .setTitle('Left the voice channel')
              .setDescription('I disconnected because the voice channel stayed empty.')],
          }, 'idle disconnect', oldState.guild.id);
        }
        await activePlayer.destroy();
      } catch (error) {
        console.error(`[Music] Idle disconnect failed in guild ${oldState.guild.id}:`, error);
      }
    }, timeoutMs);

    player.data.set('idleDisconnectTimer', timer);
  },
};
