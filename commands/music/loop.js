const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getQueue } = require('../../utils/musicManager');

module.exports = {
  name: 'loop',
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('🔁 Toggle between track loop, queue loop, and off')
    .addStringOption(option => 
      option.setName('mode')
        .setDescription('The loop mode')
        .setRequired(true)
        .addChoices(
          { name: 'Track', value: 'one' },
          { name: 'Queue', value: 'all' },
          { name: 'Off', value: 'off' }
        )
    ),
  execute: async (interaction, client) => {
    const voiceChannel = interaction.member?.voice?.channel;

    if (!voiceChannel) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Join a Voice Channel')
        .setDescription('You must be in a voice channel to change loop settings! 🎵');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const queue = getQueue(interaction.guildId);
    
    if (!queue.audioPlayer) {
      const emptyEmbed = createEmbed('error', client)
        .setDescription('There is no music playing right now.');
      return interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
    }

    const mode = interaction.options.getString('mode');
    queue.repeat = mode;

    let modeText = 'Off';
    if (mode === 'one') modeText = 'Current Track 🔂';
    if (mode === 'all') modeText = 'Entire Queue 🔁';

    const embed = createEmbed('music', client)
      .setTitle('🔁 Loop Updated')
      .setDescription(`Loop mode has been set to: **${modeText}**\ndone bestie ✦`);

    await interaction.reply({ embeds: [embed] });
  },
};
