const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { moderationError, sendModLog } = require('../../utils/moderationUtils');

module.exports = {
  name: 'clear',
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Bulk delete recent messages')
    .addIntegerOption(option => option
      .setName('amount')
      .setDescription('Number of messages to delete, 1-100')
      .setMinValue(1)
      .setMaxValue(100)
      .setRequired(true))
    .addUserOption(option => option
      .setName('target')
      .setDescription('Only delete messages from this user'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount', true);
    const target = interaction.options.getUser('target');

    if (!interaction.channel?.isTextBased()) {
      return interaction.reply({ embeds: [moderationError(client, 'Text channel required', 'Messages can only be cleared in text channels.')], flags: 64 });
    }

    await interaction.deferReply({ flags: 64 });

    try {
      const fetched = await interaction.channel.messages.fetch({ limit: Math.min(amount + 10, 100) });
      const filtered = target ? fetched.filter(message => message.author.id === target.id) : fetched;
      const toDelete = [...filtered.values()].slice(0, amount);

      if (!toDelete.length) {
        return interaction.editReply({
          embeds: [moderationError(client, 'No messages found', target ? `No recent messages from ${target} were found.` : 'No recent messages were found.')],
        });
      }

      const deleted = await interaction.channel.bulkDelete(toDelete, true);
      await interaction.editReply({
        embeds: [createEmbed('success', client)
          .setTitle('Messages cleared')
          .setDescription(target
            ? `Deleted **${deleted.size}** recent message(s) from ${target}.`
            : `Deleted **${deleted.size}** recent message(s).`)],
      });
      await sendModLog(interaction, client, 'Messages cleared', [
        { name: 'Channel', value: `${interaction.channel}`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Deleted', value: `${deleted.size}`, inline: true },
        { name: 'Target', value: target ? `${target.tag} (${target.id})` : 'All users' },
      ]);
      return null;
    } catch (error) {
      console.error('Clear command error:', error);
      return interaction.editReply({
        embeds: [moderationError(client, 'Clear failed', `Messages may be older than 14 days or I may lack permissions:\n\`${error.message}\``)],
      });
    }
  },
};
