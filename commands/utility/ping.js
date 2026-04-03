const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check Looki\'s latency'),
  execute: async (interaction, client) => {
    const embed = createEmbed('utility', client)
      .setTitle('✦ Ping')
      .setDescription(`API Latency: \`${client.ws.ping}ms\``)
      .addFields(
        { name: '🌸 Bot Latency', value: `\`${Date.now() - interaction.createdTimestamp}ms\``, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};