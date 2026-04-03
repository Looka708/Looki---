const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'serverinfo',
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get information about this server'),
  execute: async (interaction, client) => {
    const guild = interaction.guild;
    const channels = guild.channels.cache;
    const textChannels = channels.filter(ch => ch.type === ChannelType.GuildText).size;
    const voiceChannels = channels.filter(ch => ch.type === ChannelType.GuildVoice).size;

    const embed = createEmbed('info', client)
      .setTitle('📊 Server Information')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: '🎀 Server Name', value: guild.name, inline: true },
        { name: '✦ Server ID', value: `\`${guild.id}\``, inline: true },
        { name: '👥 Members', value: `\`${guild.memberCount}\``, inline: true },
        { name: '💬 Text Channels', value: `\`${textChannels}\``, inline: true },
        { name: '🔊 Voice Channels', value: `\`${voiceChannels}\``, inline: true },
        { name: '⭐ Roles', value: `\`${guild.roles.cache.size}\``, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '👻 Owner', value: `<@${guild.ownerId}>`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};