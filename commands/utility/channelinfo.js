const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'channelinfo',
  data: new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('📋 get detailed info about a channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('the channel to inspect')
        .setRequired(false)
    ),
  execute: async (interaction, client) => {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const embed = createEmbed('default', client)
      .setTitle(`📋 Channel Info: ${channel.name}`)
      .addFields(
        { name: '🆔 ID', value: `\`${channel.id}\``, inline: true },
        { name: '🏷️ Type', value: `\`${channel.type.toString()}\``, inline: true },
        { name: '🔞 NSFW?', value: channel.nsfw ? 'Yes' : 'No', inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
