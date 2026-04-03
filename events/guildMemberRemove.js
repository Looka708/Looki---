const { EmbedBuilder } = require('discord.js');
const { getOrCreateConfig } = require('../models/ServerConfig');

module.exports = {
  name: 'guildMemberRemove',
  execute: async (member, client) => {
    try {
      const config = await getOrCreateConfig(member.guild.id);

      // Send goodbye message
      if (config?.goodbye_channel) {
        const goodbyeChannel = member.guild.channels.cache.get(config.goodbye_channel);
        if (goodbyeChannel?.isSendable?.()) {
          const goodbyeMessage = config?.goodbye_message || 
            `${member.user.tag} has left the server. Goodbye! 👋`;

          const goodbyeEmbed = new EmbedBuilder()
            .setColor(0xD4A5A5)
            .setTitle('👋 Member Left')
            .setDescription(
              goodbyeMessage
                .replace('{user}', member.toString())
                .replace('{username}', member.user.username)
                .replace('{guild}', member.guild.name)
                .replace('{count}', member.guild.memberCount)
            )
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

          await goodbyeChannel.send({ embeds: [goodbyeEmbed] }).catch(() => {});
        }
      }
    } catch (error) {
      console.error('Error in guildMemberRemove event:', error);
    }
  },
};
