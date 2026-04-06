const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'botinfo',
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('🌸 learn some fun facts about me!'),
  execute: async (interaction, client) => {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const minutes = Math.floor(uptime / 60) % 60;
    const seconds = Math.floor(uptime % 60);

    const embed = createEmbed('default', client)
      .setTitle('🌸 About Looki')
      .setDescription('hi bestie! i\'m **Looki**, your aesthetic server companion ✨ i\'m here to make this space cuter, safer, and much more fun!\n\ni can play music, moderate your server, run giveaways, and level you up!')
      .setThumbnail(client.user.displayAvatarURL({ size: 1024 }))
      .addFields(
        { name: '🏫 Servers', value: `\`${client.guilds.cache.size}\``, inline: true },
        { name: '💖 Uptime', value: `\`${days}d ${hours}h ${minutes}m ${seconds}s\``, inline: true },
        { name: '🖥️ Platform', value: `\`Node.js\``, inline: true },
        { name: '🏓 Ping', value: `\`${client.ws.ping}ms\``, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
