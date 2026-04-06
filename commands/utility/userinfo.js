const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { countUserWarnings, getUserWarnings } = require('../../models/Warning');
const { getOrCreateXP } = require('../../models/XP');

module.exports = {
  name: 'userinfo',
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get detailed information about a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to get info about (defaults to you)')
        .setRequired(false)
    ),
  execute: async (interaction, client) => {
    try {
      await interaction.deferReply();

      const user = interaction.options.getUser('user') || interaction.user;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);

      if (!member) {
        await interaction.editReply({ content: 'User not found in this server.' });
        return;
      }

      // Get warnings
      const warnings = await countUserWarnings(interaction.guildId, user.id);
      const warningsList = await getUserWarnings(interaction.guildId, user.id);

      // Get XP data
      const xpData = await getOrCreateXP(interaction.guildId, user.id);

      // Build badges
      const badges = [];
      if (user.bot) badges.push('🤖 Bot');
      if (member.permissions.has('Administrator')) badges.push('✨ Admin');
      if (member.permissions.has('ManageGuild')) badges.push('🧸 Manager');
      if (member.permissions.has('ModerateMembers')) badges.push('🔨 Moderator');
      if (badges.length === 0) badges.push('🦋 Member');

      // Count mod actions by type
      const banCount = warningsList.filter(w => w.type === 'ban').length;
      const kickCount = warningsList.filter(w => w.type === 'kick').length;
      const muteCount = warningsList.filter(w => w.type === 'mute').length;
      const warnCount = warningsList.filter(w => w.type === 'warn').length;

      const embed = createEmbed('info', client)
        .setTitle(`🦋 ${user.username}'s Profile`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '🎀 Discord Tag', value: `${user.tag}`, inline: true },
          { name: '🆔 User ID', value: `\`${user.id}\``, inline: true },
          { name: '✨ Status', value: member.presence?.status ? member.presence.status.toUpperCase() : 'OFFLINE', inline: true },
          { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '💕 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
          { name: '🔰 Badges', value: badges.join(' • '), inline: true },
          { 
            name: '✨ Profile Stats', 
            value: `**Level:** ${xpData?.level || 0}\n**XP:** ${xpData?.xp?.toLocaleString() || 0}`, 
            inline: true 
          },
          { 
            name: '🥺 Mod Actions', 
            value: `**Bans:** ${banCount}\n**Kicks:** ${kickCount}\n**Mutes:** ${muteCount}\n**Warns:** ${warnCount}`, 
            inline: true 
          },
          { 
            name: '🎯 Roles', 
            value: member.roles.cache.filter(r => r.id !== interaction.guild.id).sort((a, b) => b.position - a.position).map(r => r).join(' ') || 'No roles', 
            inline: false 
          }
        )
        .setFooter({ text: `Requested by ${interaction.user.username}` });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Userinfo error:', error);
      await interaction.editReply({ content: 'Error fetching user information.' });
    }
  },
};