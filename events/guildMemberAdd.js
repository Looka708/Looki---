const { EmbedBuilder } = require('discord.js');
const { getOrCreateConfig } = require('../models/ServerConfig');

module.exports = {
  name: 'guildMemberAdd',
  execute: async (member, client) => {
    try {
      const config = await getOrCreateConfig(member.guild.id);

      // Auto-assign roles
      if (config?.autoroles && config.autoroles.length > 0) {
        for (const roleId of config.autoroles) {
          const role = member.guild.roles.cache.get(roleId);
          if (role) {
            await member.roles.add(role).catch(() => {});
          }
        }
      }

      // Auto-assign auto roles (from auto_roles array)
      if (config?.auto_roles && config.auto_roles.length > 0) {
        for (const roleId of config.auto_roles) {
          const role = member.guild.roles.cache.get(roleId);
          if (role && role.editable) {
            await member.roles.add(role).catch(() => {});
          }
        }
      }

      // Send welcome message
      if (config?.welcome_channel) {
        const welcomeChannel = member.guild.channels.cache.get(config.welcome_channel);
        if (welcomeChannel?.isSendable?.()) {
          const welcomeMessage = config?.welcome_message || 
            `Welcome to **${member.guild.name}**, ${member}! 🎉`;

          const welEmbed = new EmbedBuilder()
            .setColor(0xFFB6C1)
            .setTitle('🎉 Welcome!')
            .setDescription(
              welcomeMessage
                .replace('{user}', member.toString())
                .replace('{guild}', member.guild.name)
                .replace('{count}', member.guild.memberCount)
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

          await welcomeChannel.send({ embeds: [welEmbed] }).catch(() => {});
        }
      }

      // Send DM welcome
      if (config?.dm_welcome && config?.welcome_message) {
        try {
          const dmEmbed = new EmbedBuilder()
            .setColor(0xFFB6C1)
            .setTitle(`Welcome to ${member.guild.name}!`)
            .setDescription(config.welcome_message)
            .setThumbnail(member.guild.iconURL())
            .setTimestamp();

          await member.send({ embeds: [dmEmbed] });
        } catch (e) {
          // DM failed, silently ignore
        }
      }
    } catch (error) {
      console.error('Error in guildMemberAdd event:', error);
    }
  },
};
