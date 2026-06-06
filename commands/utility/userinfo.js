const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { countUserWarnings, getUserWarnings } = require('../../models/Warning');
const { getOrCreateXP } = require('../../models/XP');

module.exports = {
  name: 'userinfo',
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get detailed information about a server member')
    .addUserOption(option => option
      .setName('user')
      .setDescription('User to inspect, defaults to you')),

  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const user = interaction.options.getUser('user') || interaction.user;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);

      if (!member) {
        return interaction.editReply({
          embeds: [createEmbed('error', client)
            .setTitle('Member not found')
            .setDescription('That user is not in this server.')],
        });
      }

      const [warningCount, warnings, xpData] = await Promise.all([
        countUserWarnings(interaction.guildId, user.id),
        getUserWarnings(interaction.guildId, user.id),
        getOrCreateXP(interaction.guildId, user.id),
      ]);

      const badges = [];
      if (user.bot) badges.push('Bot');
      if (member.permissions.has(PermissionFlagsBits.Administrator)) badges.push('Administrator');
      else if (member.permissions.has(PermissionFlagsBits.ManageGuild)) badges.push('Server manager');
      else if (member.permissions.has(PermissionFlagsBits.ModerateMembers)) badges.push('Moderator');
      if (!badges.length) badges.push('Member');

      const actionCounts = {
        ban: warnings.filter(warning => warning.type === 'ban').length,
        kick: warnings.filter(warning => warning.type === 'kick').length,
        mute: warnings.filter(warning => warning.type === 'mute').length,
        warn: warnings.filter(warning => warning.type === 'warn').length,
      };

      const roles = member.roles.cache
        .filter(role => role.id !== interaction.guildId)
        .sort((a, b) => b.position - a.position)
        .map(role => role.toString());
      const roleText = roles.length ? roles.join(' ').slice(0, 1024) : 'No roles';

      const embed = createEmbed('info', client)
        .setTitle(`${user.username}'s Profile`)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: 'Discord tag', value: user.tag, inline: true },
          { name: 'User ID', value: `\`${user.id}\``, inline: true },
          { name: 'Status', value: member.presence?.status?.toUpperCase() || 'OFFLINE', inline: true },
          { name: 'Account created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: 'Joined server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
          { name: 'Badges', value: badges.join(', '), inline: true },
          {
            name: 'Profile stats',
            value: `Level: **${xpData?.level || 0}**\nXP: **${(xpData?.xp || 0).toLocaleString()}**`,
            inline: true,
          },
          {
            name: `Moderation actions (${warningCount})`,
            value: `Bans: **${actionCounts.ban}**\nKicks: **${actionCounts.kick}**\nMutes: **${actionCounts.mute}**\nWarnings: **${actionCounts.warn}**`,
            inline: true,
          },
          { name: `Roles (${roles.length})`, value: roleText },
        )
        .setFooter({ text: `Requested by ${interaction.user.username}` });

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Userinfo error:', error);
      return interaction.editReply({
        embeds: [createEmbed('error', client)
          .setTitle('User information unavailable')
          .setDescription('I could not fetch that member\'s information right now.')],
      });
    }
  },
};
