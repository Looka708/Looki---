const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { getLeaderboard } = require('../../models/XP');

module.exports = {
  name: 'leaderboard',
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top 10 members by XP'),
  execute: async (interaction, client) => {
    await interaction.deferReply();

    try {
      const leaderboard = await getLeaderboard(interaction.guild.id, 10);

      if (leaderboard.length === 0) {
        const emptyEmbed = createEmbed('levels', client)
          .setTitle('📈 Leaderboard')
          .setDescription('No XP data yet. Start chatting to gain XP!');

        await interaction.editReply({ embeds: [emptyEmbed] });
        return;
      }

      let description = '';
      for (let i = 0; i < leaderboard.length; i++) {
        const entry = leaderboard[i];
        const user = await client.users.fetch(entry.user_id).catch(() => null);
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
        description += `${medal} <@${entry.user_id}> • \`${entry.xp} XP\` (Level ${entry.level})\n`;
      }

      const embed = createEmbed('levels', client)
        .setTitle('📈 XP Leaderboard')
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setDescription(description);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Error')
        .setDescription('hmm that didn\'t work :( try again?');

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};