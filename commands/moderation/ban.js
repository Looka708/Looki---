const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { createWarning, getNextCaseId } = require('../../models/Warning');
const { getOrCreateConfig } = require('../../models/ServerConfig');

module.exports = {
  name: 'ban',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  execute: async (interaction, client) => {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      // Check if user is bannable
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (member && !member.bannable) {
        const errorEmbed = createEmbed('error', client)
          .setTitle('🥺 Cannot Ban User')
          .setDescription('This user cannot be banned. They may have a higher role.');

        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        return;
      }

      // Ban the user
      await interaction.guild.members.ban(user, { reason });

      // Get case ID and create warning
      const caseId = await getNextCaseId(interaction.guildId);
      await createWarning(
        interaction.guildId,
        user.id,
        reason,
        interaction.user.id,
        caseId,
        'ban'
      );

      // Create public embed
      const banEmbed = createEmbed('moderation', client)
        .setTitle('🦋 User Banned')
        .setDescription(`${user.tag} has been banned from the server`)
        .addFields(
          { name: '🎀 User', value: `<@${user.id}>`, inline: true },
          { name: '✦ Case ID', value: `#${caseId}`, inline: true },
          { name: '📝 Reason', value: reason }
        )
        .setThumbnail(user.displayAvatarURL())
        .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZXZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/H99r2dQWCRmpO/giphy.gif');

      await interaction.reply({ embeds: [banEmbed] });

      // Post to modlog if configured
      const config = await getOrCreateConfig(interaction.guildId);
      if (config?.modlog_channel) {
        const modlogChannel = interaction.guild.channels.cache.get(config.modlog_channel);
        if (modlogChannel?.isTextBased()) {
          const modlogEmbed = createEmbed('moderation', client)
            .setTitle('🦋 Ban Logged')
            .addFields(
              { name: '🦋 User', value: `${user.tag} (${user.id})`, inline: true },
              { name: '👮 Moderator', value: `${interaction.user.tag}`, inline: true },
              { name: '✦ Case', value: `#${caseId}`, inline: true },
              { name: '📝 Reason', value: reason }
            )
            .setTimestamp();

          await modlogChannel.send({ embeds: [modlogEmbed] }).catch(() => {});
        }
      }

      // DM the banned user
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor(0xFF9EAE)
          .setTitle('🦋 You\'ve been banned')
          .setDescription(`You were banned from \`${interaction.guild.name}\``)
          .addFields(
            { name: '🎀 Reason', value: reason },
            { name: '💕 Appeal', value: 'Contact server staff to appeal' }
          )
          .setTimestamp();

        await user.send({ embeds: [dmEmbed] });
      } catch (e) {
        console.log('Could not DM banned user');
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Ban Failed')
        .setDescription('hmm that didn\'t work :( try again?');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};