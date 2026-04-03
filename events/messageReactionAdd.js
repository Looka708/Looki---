const { EmbedBuilder } = require('discord.js');
const { getOrCreateConfig } = require('../models/ServerConfig');

module.exports = {
  name: 'messageReactionAdd',
  execute: async (reaction, user, client) => {
    try {
      if (user.bot) return;

      // Fetch reaction if partial
      if (reaction.partial) await reaction.fetch();

      const config = await getOrCreateConfig(reaction.message.guildId);
      if (!config?.reaction_roles) return;

      // Parse reaction roles (JSONB array)
      const reactionRoles = Array.isArray(config.reaction_roles) 
        ? config.reaction_roles 
        : [];

      // Find matching emoji
      const roleAssignment = reactionRoles.find(
        rr => rr.emoji === reaction.emoji.name || rr.emoji === reaction.emoji.id
      );

      if (!roleAssignment) return;

      // Get role
      const role = reaction.message.guild.roles.cache.get(roleAssignment.role_id);
      if (!role) return;

      // Get member
      const member = await reaction.message.guild.members.fetch(user.id);
      if (!member) return;

      // Add role
      await member.roles.add(role);

      // Send DM confirmation
      try {
        const confirmEmbed = new EmbedBuilder()
          .setColor(0xFFB6C1)
          .setTitle('✓ Role Assigned')
          .setDescription(`You've been given the **${role.name}** role in ${reaction.message.guild.name}!`);

        await user.send({ embeds: [confirmEmbed] });
      } catch (e) {
        // DM failed, silently ignore
      }
    } catch (error) {
      console.error('Error in messageReactionAdd:', error);
    }
  },
};
