const { getOrCreateConfig } = require('../models/ServerConfig');

module.exports = {
  name: 'messageReactionRemove',
  execute: async (reaction, user, client) => {
    try {
      if (user.bot) return;

      // Fetch reaction if partial
      if (reaction.partial) await reaction.fetch();

      const config = await getOrCreateConfig(reaction.message.guildId);
      if (!config?.reaction_roles) return;

      // Parse reaction roles
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

      // Remove role
      await member.roles.remove(role);
    } catch (error) {
      console.error('Error in messageReactionRemove:', error);
    }
  },
};
