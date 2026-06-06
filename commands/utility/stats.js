const { ChannelType, SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getLeaderboard } = require('../../models/XP');
const { getOrCreateConfig } = require('../../models/ServerConfig');

module.exports = {
  name: 'stats',
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View server statistics and configuration'),

  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const guild = interaction.guild;
      const [channels, roles, members, leaderboard, config] = await Promise.all([
        guild.channels.fetch(),
        guild.roles.fetch(),
        guild.members.fetch(),
        getLeaderboard(guild.id, 10),
        getOrCreateConfig(guild.id),
      ]);

      const bots = members.filter(member => member.user.bot).size;
      const humans = members.size - bots;
      const online = members.filter(member => member.presence?.status === 'online').size;
      const textChannels = channels.filter(channel => channel.type === ChannelType.GuildText).size;
      const voiceChannels = channels.filter(channel => channel.type === ChannelType.GuildVoice).size;
      const categories = channels.filter(channel => channel.type === ChannelType.GuildCategory).size;
      const managedRoles = roles.filter(role => role.managed).size;
      const customRoles = roles.filter(role => !role.managed && role.id !== guild.id).size;
      const topMember = leaderboard[0];
      const modlog = config?.modlog_channel
        ? guild.channels.cache.get(config.modlog_channel)?.toString() || 'Deleted channel'
        : 'Not configured';
      const features = guild.features.length
        ? guild.features.slice(0, 15).map(feature => `- ${feature}`).join('\n')
        : 'No special features';

      const embed = createEmbed('info', client)
        .setTitle(`${guild.name} Statistics`)
        .setThumbnail(guild.iconURL({ size: 256 }))
        .addFields(
          {
            name: 'Members',
            value: `Total: **${members.size}**\nHumans: **${humans}**\nBots: **${bots}**\nOnline: **${online}**`,
            inline: true,
          },
          {
            name: 'Channels',
            value: `Text: **${textChannels}**\nVoice: **${voiceChannels}**\nCategories: **${categories}**`,
            inline: true,
          },
          {
            name: 'Roles',
            value: `Total: **${roles.size}**\nCustom: **${customRoles}**\nManaged: **${managedRoles}**`,
            inline: true,
          },
          { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
          { name: 'Verification level', value: `${guild.verificationLevel}`, inline: true },
          { name: 'Moderation log', value: modlog, inline: true },
          {
            name: 'Top XP member',
            value: topMember
              ? `<@${topMember.user_id}> | Level ${topMember.level} | ${topMember.xp.toLocaleString()} XP`
              : 'No XP data yet',
          },
          { name: 'Server features', value: features.slice(0, 1024) },
        )
        .setFooter({ text: `Server ID: ${guild.id}` });

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Stats error:', error);
      return interaction.editReply({
        embeds: [createEmbed('error', client)
          .setTitle('Statistics unavailable')
          .setDescription('I could not fetch the server statistics right now.')],
      });
    }
  },
};
