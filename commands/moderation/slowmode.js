const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { parseDuration } = require('../../utils/duration');
const { moderationError, sendModLog } = require('../../utils/moderationUtils');

module.exports = {
  name: 'slowmode',
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set channel slowmode')
    .addStringOption(option => option.setName('duration').setDescription('Duration like 5s, 1m, 2h, or off').setRequired(true))
    .addChannelOption(option => option.setName('channel').setDescription('Channel to update'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction, client) {
    const input = interaction.options.getString('duration', true);
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    if (!channel.isTextBased()) return interaction.reply({ embeds: [moderationError(client, 'Text channel required', 'Slowmode only works in text-based channels.')], flags: 64 });

    let seconds = 0;
    if (!['0', 'off', 'disable', 'disabled'].includes(input.toLowerCase())) {
      seconds = Math.floor((parseDuration(input) || 0) / 1000);
      if (seconds < 1 || seconds > 21600) {
        return interaction.reply({ embeds: [moderationError(client, 'Invalid slowmode', 'Slowmode must be between `1s` and `6h`, or `off`.')], flags: 64 });
      }
    }

    try {
      await channel.setRateLimitPerUser(seconds, `Set by ${interaction.user.tag}`);
      await interaction.reply({
        embeds: [createEmbed('moderation', client)
          .setTitle('Slowmode updated')
          .setDescription(seconds === 0 ? `Slowmode is disabled in ${channel}.` : `Slowmode is **${input}** in ${channel}.`)],
      });
      await sendModLog(interaction, client, 'Slowmode updated', [
        { name: 'Channel', value: `${channel}`, inline: true },
        { name: 'Duration', value: seconds === 0 ? 'Disabled' : `${seconds} seconds`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
      ]);
      return null;
    } catch (error) {
      console.error('Slowmode command error:', error);
      return interaction.reply({ embeds: [moderationError(client, 'Slowmode failed', `Check my channel permissions:\n\`${error.message}\``)], flags: 64 });
    }
  },
};
