const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { createWarning, getNextCaseId } = require('../../models/Warning');

module.exports = {
  name: 'warn',
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a warning to a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to warn')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  execute: async (interaction, client) => {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      // Get the next case ID
      const caseId = await getNextCaseId(interaction.guild.id);

      // Create warning
      await createWarning(
        interaction.guild.id,
        user.id,
        reason,
        interaction.user.id,
        caseId
      );

      const warnEmbed = createEmbed('moderation', client)
        .setTitle('🥺 Warning Issued')
        .setDescription(`${user.tag} has been warned`)
        .addFields(
          { name: '🎀 User', value: `<@${user.id}>`, inline: true },
          { name: '✦ Reason', value: reason, inline: true },
          { name: '📋 Case', value: `\`#${caseId}\``, inline: true }
        )
        .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/M9O6H8o487m4pG/giphy.gif');

      await interaction.reply({ embeds: [warnEmbed] });

      // Try to DM user
      try {
        const dmEmbed = createEmbed('moderation', client)
          .setTitle('🥺 You\'ve been warned')
          .setDescription(`You received a warning in \`${interaction.guild.name}\``)
          .addFields(
            { name: '🎀 Reason', value: reason },
            { name: '📋 Case', value: `\`#${caseId}\`` }
          );

        await user.send({ embeds: [dmEmbed] });
      } catch (e) {
        console.log('Could not DM warned user');
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Warning Failed')
        .setDescription('hmm that didn\'t work :( try again?');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};