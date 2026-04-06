const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { createWarning, getNextCaseId } = require('../../models/Warning');
const { getOrCreateConfig } = require('../../models/ServerConfig');

module.exports = {
  name: 'kick',
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  execute: async (interaction, client) => {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!member) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 User Not Found')
        .setDescription('That user isn\'t in the server or couldn\'t be found.');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    if (!member.kickable) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Cannot Kick User')
        .setDescription('This user cannot be kicked. They may have a higher role.');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    try {
      await member.kick(reason);

      // Get case ID and create warning
      const caseId = await getNextCaseId(interaction.guildId);
      await createWarning(
        interaction.guildId,
        user.id,
        reason,
        interaction.user.id,
        caseId,
        'kick'
      );

      // Create public embed
      const kickEmbed = createEmbed('moderation', client)
        .setTitle('👢 User Kicked')
        .setDescription(`${user.tag} has been kicked from the server`)
        .addFields(
          { name: '🎀 User', value: `<@${user.id}>`, inline: true },
          { name: '✦ Case ID', value: `#${caseId}`, inline: true },
          { name: '📝 Reason', value: reason }
        )
        .setThumbnail(user.displayAvatarURL())
        .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/wOly8pa4s4W88/giphy.gif');

      await interaction.reply({ embeds: [kickEmbed] });

      // Post to modlog if configured
      const config = await getOrCreateConfig(interaction.guildId);
      if (config?.modlog_channel) {
        const modlogChannel = interaction.guild.channels.cache.get(config.modlog_channel);
        if (modlogChannel?.isTextBased()) {
          const modlogEmbed = createEmbed('moderation', client)
            .setTitle('👢 Kick Logged')
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

      // DM the kicked user
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor(0xC8A2C8)
          .setTitle('👢 You\'ve been kicked')
          .setDescription(`You were kicked from \`${interaction.guild.name}\``)
          .addFields(
            { name: '🎀 Reason', value: reason },
            { name: '💕 Rejoin', value: 'You can rejoin the server anytime' }
          )
          .setTimestamp();

        await user.send({ embeds: [dmEmbed] });
      } catch (e) {
        console.log('Could not DM kicked user');
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = createEmbed('error', client)
        .setTitle('🥺 Kick Failed')
        .setDescription('hmm that didn\'t work :( try again?');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};