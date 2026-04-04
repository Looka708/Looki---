const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { parseDuration } = require('../../utils/duration');

module.exports = {
  name: 'tempban',
  data: new SlashCommandBuilder()
    .setName('tempban')
    .setDescription('🔨 temporarily ban a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('the user to ban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('how long? (e.g. 1d, 1w)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('ban reason')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  execute: async (interaction, client) => {
    const targetUser = interaction.options.getUser('user');
    const durationInput = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'no reason provided luv 🌸';

    const durationMs = parseDuration(durationInput);
    if (!durationMs || durationMs < 1000) {
      return interaction.reply({ content: 'Invalid duration! Try `1d` or `1w` 🎀', ephemeral: true });
    }

    try {
      // Pre-emptively DM the user before banning, since you can't DM them after.
      try {
        const dmEmbed = createEmbed('moderation', client)
          .setTitle('🔨 you\'ve been temporarily banned')
          .setDescription(`you were banned from \`${interaction.guild.name}\` 🎀`)
          .addFields(
            { name: '⏱️ Duration', value: `\`${durationInput}\``, inline: true },
            { name: '✦ Reason', value: reason, inline: true }
          );
        await targetUser.send({ embeds: [dmEmbed] });
      } catch (e) {
        // they have dms blocked
      }

      await interaction.guild.members.ban(targetUser.id, { reason: `Tempban by ${interaction.user.tag}: ${reason}` });

      const embed = createEmbed('moderation', client)
        .setTitle('🔨 temp-ban issued')
        .setDescription(`${targetUser} was banned ✨`)
        .addFields(
          { name: '🎀 Duration', value: `\`${durationInput}\``, inline: true },
          { name: '✦ Reason', value: reason, inline: true }
        );

      await interaction.reply({ embeds: [embed] });

      // Create an unban timeout
      setTimeout(async () => {
        try {
          await interaction.guild.members.unban(targetUser.id, 'Tempban expired');
        } catch (e) {
            console.error(`Failed to unban ${targetUser.id} after timeout.`);
        }
      }, durationMs);

    } catch (error) {
      console.error(error);
      const errorEmbed = createEmbed('error', client)
        .setDescription('hmm that didn\'t work :( try again?');
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
