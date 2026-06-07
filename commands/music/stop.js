const { SlashCommandBuilder } = require('discord.js');
const ServerMusicSettings = require('../../models/ServerMusicSettings');
const { createMusicEmbed } = require('../../utils/musicEmbed');
const { canControlMusic, requirePlayer, requireSameVoice } = require('../../utils/musicCommandUtils');

module.exports = {
  name: 'stop',
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop music and clear the queue'),

  async execute(interaction, client) {
    await interaction.deferReply();

    const { player, error } = requirePlayer(interaction, client, { requireTrack: false });
    if (error) return interaction.editReply({ embeds: [error] });

    const voiceCheck = requireSameVoice(interaction, client, player);
    if (voiceCheck.error) return interaction.editReply({ embeds: [voiceCheck.error] });

    if (!await canControlMusic(interaction, player)) {
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          type: 'error',
          title: 'Music control restricted',
          description: 'Only the requester, configured DJ role, or a moderator can stop the session.',
        })],
      });
    }

    const settings = await ServerMusicSettings.getSettings(interaction.guildId);
    const stay247 = Boolean(settings?.stay_247 || player.data.get('stay247'));

    if (stay247) {
      player.queue.clear();
      if (player.queue.current) player.skip();
      player.data.set('stay247', true);
      return interaction.editReply({
        embeds: [createMusicEmbed(client, {
          title: 'Queue cleared',
          description: 'Music stopped, but 24/7 mode is enabled so I will stay in voice.',
          footer: 'Use /247 disable to disconnect completely',
        })],
      });
    }

    await player.destroy();
    return interaction.editReply({
      embeds: [createMusicEmbed(client, {
        title: 'Music stopped',
        description: 'I cleared the queue and left the voice channel.',
      })],
    });
  },
};
