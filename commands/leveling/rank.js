const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getOrCreateXP, getLeaderboard } = require('../../models/XP');

module.exports = {
  name: 'rank',
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your or another member\'s rank and XP progress')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check (defaults to you)')
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

      const xpData = await getOrCreateXP(interaction.guildId, user.id);
      const leaderboard = await getLeaderboard(interaction.guildId, 100);

      // Calculate rank position
      const rank = leaderboard.findIndex(entry => entry.user_id === user.id) + 1 || 'N/A';

      // Calculate XP for current and next level
      const currentLevelXp = xpData.level * 100;
      const nextLevelXp = (xpData.level + 1) * 100;
      const currentLevelProgress = xpData.xp - currentLevelXp;
      const xpNeeded = nextLevelXp - currentLevelXp;
      const xpProgress = (currentLevelProgress / xpNeeded) * 100;

      // Build progress bar (20 segments)
      const filledSegments = Math.floor(xpProgress / 5);
      const emptySegments = 20 - filledSegments;
      const progressBar = '█'.repeat(filledSegments) + '░'.repeat(emptySegments);

      const embed = createEmbed('levels', client)
        .setTitle(`📊 ${user.username}'s Rank Card`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '🏆 Server Rank', value: `#${rank}`, inline: true },
          { name: '⭐ Level', value: `${xpData.level}`, inline: true },
          { name: '💎 Total XP', value: `${xpData.xp.toLocaleString()} XP`, inline: true },
          { 
            name: '📈 XP Progress', 
            value: `\`${progressBar}\` ${Math.floor(xpProgress)}%\n${currentLevelProgress.toLocaleString()}/${xpNeeded.toLocaleString()} XP`,
            inline: false 
          },
          { name: '👤 Account Age', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '📅 Join Date', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }
        )
        .setFooter({ text: `Rank Card • Top ${rank} of ${leaderboard.length} members` });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Rank command error:', error);
      await interaction.editReply({ content: 'Error fetching rank information.' });
    }
  },
};