const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getOrCreateXP, getLeaderboard } = require('../../models/XP');

module.exports = {
  name: 'rank',
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your or another member\'s rank and XP progress')
    .addUserOption(option => option
      .setName('user')
      .setDescription('User to check, defaults to you')),

  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const user = interaction.options.getUser('user') || interaction.user;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);

      if (!member) {
        return interaction.editReply({
          embeds: [createEmbed('error', client)
            .setTitle('Member not found')
            .setDescription('That user is not in this server.')],
        });
      }

      const xpData = await getOrCreateXP(interaction.guildId, user.id);
      const leaderboard = await getLeaderboard(interaction.guildId, 100);
      const rankIndex = leaderboard.findIndex(entry => entry.user_id === user.id);
      const rank = rankIndex >= 0 ? `#${rankIndex + 1}` : 'Unranked';

      const level = xpData?.level || 0;
      const xp = xpData?.xp || 0;
      const currentLevelXp = level * 100;
      const progress = Math.max(0, xp - currentLevelXp);
      const progressPercent = Math.min(Math.floor(progress), 100);
      const filled = Math.min(Math.floor(progressPercent / 10), 10);
      const progressBar = `${'#'.repeat(filled)}${'-'.repeat(10 - filled)}`;

      const embed = createEmbed('levels', client)
        .setTitle(`${user.username}'s Rank`)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: 'Server rank', value: rank, inline: true },
          { name: 'Level', value: `${level}`, inline: true },
          { name: 'Total XP', value: `${xp.toLocaleString()} XP`, inline: true },
          {
            name: 'Level progress',
            value: `\`${progressBar}\` ${progressPercent}%\n${progress}/100 XP`,
          },
          { name: 'Account created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: 'Joined server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        )
        .setFooter({ text: `Top 100 ranking | ${leaderboard.length} tracked members` });

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Rank command error:', error);
      return interaction.editReply({
        embeds: [createEmbed('error', client)
          .setTitle('Rank unavailable')
          .setDescription('I could not fetch rank information right now.')],
      });
    }
  },
};
