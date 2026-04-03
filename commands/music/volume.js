const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { setVolume, getQueue } = require('../../utils/musicManager');

module.exports = {
  name: 'volume',
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('🔊 Control music volume')
    .addIntegerOption(option =>
      option
        .setName('level')
        .setDescription('Volume level (0-200)')
        .setMinValue(0)
        .setMaxValue(200)
        .setRequired(true)
    ),
  execute: async (interaction, client) => {
    const level = interaction.options.getInteger('level');

    if (!interaction.member?.voice.channel) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Join a Voice Channel')
        .setDescription('You must be in a voice channel to control volume! 🎵');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    // Convert 0-200 to decimal 0.1-2.0
    const volumeDecimal = level / 100;
    const newVolume = setVolume(interaction.guildId, volumeDecimal);

    const volumePercentage = Math.round(newVolume * 100);
    const volumeBar = '█'.repeat(Math.round(volumePercentage / 10)) + '░'.repeat(10 - Math.round(volumePercentage / 10));

    const embed = createEmbed('music', client)
      .setTitle('🔊 Volume Control')
      .setDescription(`Volume set to \`${volumePercentage}%\`\n\n${volumeBar}`)
      .addFields(
        { name: '📊 Level', value: `${volumePercentage}% (${newVolume.toFixed(1)}x)`, inline: true },
        { name: '🎵 Current Song', value: getQueue(interaction.guildId).currentSong?.title || 'None', inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
