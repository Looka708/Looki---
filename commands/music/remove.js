const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('🗑️ Remove a song from the queue')
    .addIntegerOption(option =>
      option.setName('position')
        .setDescription('Queue position (1-based index)')
        .setRequired(true)
        .setMinValue(2) // Can't remove currently playing song
    ),

  async execute(interaction, client) {
    try {
      const position = interaction.options.getInteger('position');
      const voiceChannel = interaction.member.voice.channel;

      if (!voiceChannel) {
        return await interaction.reply({
          content: '🥺 You must be in a voice channel!',
          ephemeral: true
        });
      }

      const player = client.riffy.players.get(interaction.guildId);

      if (!player || !player.current) {
        return await interaction.reply({
          content: '❌ No music is currently playing!',
          ephemeral: true
        });
      }

      if (voiceChannel.id !== player.voiceChannel) {
        return await interaction.reply({
          content: '🥺 You must be in the same voice channel as Looki!',
          ephemeral: true
        });
      }

      // Permission check
      const isMod = interaction.member.permissions.has('ManageChannels');
      const isRequester = player.queue[position - 1]?.info.requester?.tag === interaction.user.tag;

      if (!isMod && !isRequester) {
        return await interaction.reply({
          content: '🥺 You must be a Moderator or the song requester to remove it!',
          ephemeral: true
        });
      }

      if (position < 1 || position > player.queue.length) {
        return await interaction.reply({
          content: `❌ Invalid position! Queue has **${player.queue.length}** songs.`,
          ephemeral: true
        });
      }

      const removedSong = [...player.queue][position - 1];
      player.queue.remove(position - 1);

      await interaction.reply({
        embeds: [createEmbed('music', client)
          .setTitle('🗑️ Song Removed')
          .setDescription(`Removed **${removedSong.info.title}** from position **#${position}**`)]
      });
    } catch (error) {
      console.error('Error in remove command:', error);
      await interaction.reply({
        content: '❌ Failed to remove song from queue',
        ephemeral: true
      });
    }
  },
};
