const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { parseDuration } = require('../../utils/duration');
const TemporaryBan = require('../../models/TemporaryBan');

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
    try {
      const targetUser = interaction.options.getUser('user');
      const durationInput = interaction.options.getString('duration');
      const reason = interaction.options.getString('reason') || 'no reason provided luv 🌸';

      // Validate self-ban and bot ban
      if (targetUser.id === interaction.user.id) {
        return await interaction.reply({ 
          content: '🥺 You cannot ban yourself!', 
          ephemeral: true 
        });
      }

      if (targetUser.id === client.user.id) {
        return await interaction.reply({ 
          content: '😊 You cannot ban me!', 
          ephemeral: true 
        });
      }

      const durationMs = parseDuration(durationInput);
      if (!durationMs || durationMs < 1000) {
        return await interaction.reply({ 
          content: 'Invalid duration! Try `1d` or `1w` 🎀', 
          ephemeral: true 
        });
      }

      const endTime = new Date(Date.now() + durationMs);

      // Pre-emptively DM the user before banning
      try {
        const dmEmbed = createEmbed('moderation', client)
          .setTitle('🔨 You\'ve been temporarily banned')
          .setDescription(`You were banned from \`${interaction.guild.name}\` 🎀`)
          .addFields(
            { name: '💖 Duration', value: `\`${durationInput}\``, inline: true },
            { name: '✦ Unban Time', value: `<t:${Math.floor(endTime.getTime() / 1000)}:F>`, inline: true },
            { name: '📝 Reason', value: reason }
          );
        await targetUser.send({ embeds: [dmEmbed] });
      } catch (e) {
        // DMs blocked - that's fine, continue with ban
      }

      // Ban the user
      await interaction.guild.members.ban(targetUser.id, { 
        reason: `Tempban by ${interaction.user.tag}: ${reason}` 
      });

      // Store in database for persistence
      await TemporaryBan.createTempBan(
        interaction.guildId,
        targetUser.id,
        endTime,
        reason,
        interaction.user.id
      );

      const embed = createEmbed('moderation', client)
        .setTitle('🔨 Temporary Ban Issued')
        .setDescription(`${targetUser} was banned ✨`)
        .addFields(
          { name: '🎀 Duration', value: `\`${durationInput}\``, inline: true },
          { name: '⏰ Unban Time', value: `<t:${Math.floor(endTime.getTime() / 1000)}:R>`, inline: true },
          { name: '✦ Reason', value: reason }
        );

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('❌ [tempban.js] Error:', error);
      const errorEmbed = createEmbed('error', client)
        .setDescription('hmm that didn\'t work :( try again?');
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
