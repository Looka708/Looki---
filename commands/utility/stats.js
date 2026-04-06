const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getLeaderboard } = require('../../models/XP');
const { getOrCreateConfig } = require('../../models/ServerConfig');

module.exports = {
  name: 'stats',
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View server statistics and analytics'),
  execute: async (interaction, client) => {
    try {
      await interaction.deferReply();

      const guild = interaction.guild;
      const channels = await guild.channels.fetch();
      const roles = await guild.roles.fetch();

      // Member stats
      const members = await guild.members.fetch();
      const bots = members.filter(m => m.user.bot).size;
      const humans = members.filter(m => !m.user.bot).size;
      const onlineCount = members.filter(m => m.presence?.status === 'online').size;

      // Channel stats
      const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
      const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
      const categoryChannels = channels.filter(c => c.type === ChannelType.GuildCategory).size;

      // Role stats
      const managedRoles = roles.filter(r => r.managed).size;
      const customRoles = roles.filter(r => !r.managed && r.id !== guild.id).size;

      // XP stats
      const leaderboard = await getLeaderboard(guild.id, 10);
      const topMember = leaderboard[0];
      
      // Get server config for modlog
      const config = await getOrCreateConfig(guild.id);
      const modlogChannel = config?.modlog_channel ? 
        guild.channels.cache.get(config.modlog_channel)?.name || 'Deleted' : 'Not Set';

      const embed = createEmbed('info', client)
        .setTitle(`🎀 ${guild.name} Statistics`)
        .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
        .addFields(
          { 
            name: '🧸 Members', 
            value: `**Total:** ${members.size}\n**Humans:** ${humans}\n**Bots:** ${bots}\n**Online:** ${onlineCount}`, 
            inline: true 
          },
          { 
            name: '📢 Channels', 
            value: `**Text:** ${textChannels}\n**Voice:** ${voiceChannels}\n**Categories:** ${categoryChannels}`, 
            inline: true 
          },
          { 
            name: '🎭 Roles', 
            value: `**Total:** ${roles.size}\n**Custom:** ${customRoles}\n**Managed:** ${managedRoles}`, 
            inline: true 
          },
          { 
            name: '📅 Created', 
            value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, 
            inline: true 
          },
          { 
            name: '🔍 Verification', 
            value: `**Level:** ${guild.verificationLevel}\n**2FA:** ${guild.explicitContentFilter}`, 
            inline: true 
          },
          { 
            name: '✨ Configuration', 
            value: `**Modlog:** ${modlogChannel}\n**Members Tracked:** ${leaderboard.length}`, 
            inline: true 
          },
          { 
            name: '✨ Top Member', 
            value: topMember ? `<@${topMember.user_id}> - Level ${topMember.level} (${topMember.xp.toLocaleString()} XP)` : 'No data yet', 
            inline: false 
          },
          { 
            name: '🎪 Server Features', 
            value: guild.features.length > 0 ? guild.features.map(f => `✓ ${f}`).join('\n') : 'No special features', 
            inline: false 
          }
        )
        .setFooter({ text: `Server ID: ${guild.id}` });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Stats error:', error);
      await interaction.editReply({ content: 'Error fetching server statistics.' });
    }
  },
};
