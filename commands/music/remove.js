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

      const queue = client.distube.getQueue(interaction.guildId);

      if (!queue || !queue.songs[0]) {
        return await interaction.reply({
          content: '❌ No music is currently playing!',
          ephemeral: true
        });
      }

      if (voiceChannel.id !== queue.voiceChannel?.id) {
        return await interaction.reply({
          content: '🥺 You must be in the same voice channel as Looki!',
          ephemeral: true
        });
      }

      // Permission check
      const isMod = interaction.member.permissions.has('ManageChannels');
      const isRequester = queue.songs[position - 1]?.user?.tag === interaction.user.tag;

      if (!isMod && !isRequester) {
        return await interaction.reply({
          content: '🥺 You must be a Moderator or the song requester to remove it!',
          ephemeral: true
        });
      }

      if (position < 1 || position > queue.songs.length) {
        return await interaction.reply({
          content: `❌ Invalid position! Queue has **${queue.songs.length - 1}** songs (excluding current).`,
          ephemeral: true
        });
      }

      const removedSong = queue.songs[position - 1];
      queue.songs.splice(position - 1, 1);

      await interaction.reply({
        embeds: [createEmbed('music', client)
          .setTitle('🗑️ Song Removed')
          .setDescription(`Removed **${removedSong.name}** from position **#${position}**`)]
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
