const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

const commandCategories = {
  general: {
    title: '💕 Looki Command Hub',
    description: 'Select a category to learn more about available commands!',
    fields: [
      { name: '🧸 Moderation', value: 'Use `/help moderation` for moderation tools', inline: false },
      { name: '🎀 Leveling', value: 'Use `/help leveling` for leveling & rewards', inline: false },
      { name: '🎀 Music', value: 'Use `/help music` for music playback', inline: false },
      { name: '🎀 Utility', value: 'Use `/help utility` for utility commands', inline: false },
      { name: '🦋 Fun', value: 'Use `/help fun` for games & entertainment', inline: false },
    ]
  },
  moderation: {
    title: '🧸 Moderation Commands',
    description: 'Tools for managing your community with care',
    fields: [
      { name: '/ban <user>', value: 'Ban a user from the server (admins only)', inline: false },
      { name: '/kick <user>', value: 'Kick a user from the server (admins only)', inline: false },
      { name: '/warn <user>', value: 'Give a warning to a user with optional reason', inline: false },
      { name: '/automod <setting>', value: 'Configure auto-moderation (antiswear, antispam, antilinks)', inline: false },
      { name: '/mute <user>', value: 'Temporarily mute a user', inline: false },
    ]
  },
  leveling: {
    title: '🎀 Leveling & Rewards',
    description: 'Track engagement and celebrate member growth!',
    fields: [
      { name: '/rank [user]', value: 'View your or another member\'s rank card with XP & level', inline: false },
      { name: '/leaderboard', value: 'See the top members by XP in the server', inline: false },
      { name: 'Earn XP', value: 'Gain 10 XP per message (60s cooldown) - Level up automatically!', inline: false },
    ]
  },
  music: {
    title: '🎀 Music Commands',
    description: 'Stream music and build the perfect playlist',
    fields: [
      { name: '/play <query>', value: 'Play a song from YouTube or Spotify', inline: false },
      { name: '/queue', value: 'View the current music queue', inline: false },
      { name: '/skip', value: 'Skip the current song', inline: false },
      { name: '/volume <0-100>', value: 'Adjust music volume (default: 50)', inline: false },
    ]
  },
  utility: {
    title: '🎀 Utility Commands',
    description: 'Essential server tools and information',
    fields: [
      { name: '/ping', value: 'Check bot latency and API response time', inline: false },
      { name: '/help [category]', value: 'View all commands or get help for a category', inline: false },
      { name: '/userinfo [user]', value: 'View detailed profile info, warnings, and XP for a user', inline: false },
      { name: '/serverinfo', value: 'Get information about the current server', inline: false },
      { name: '/stats', value: 'View comprehensive server statistics and analytics', inline: false },
    ]
  },
  fun: {
    title: '🦋 Fun & Games',
    description: 'Entertainment and engagement commands',
    fields: [
      { name: '/8ball <question>', value: 'Ask the magic 8 ball a yes/no question', inline: false },
      { name: '/poll <question>', value: 'Create a yes/no poll for the server to vote on', inline: false },
      { name: '/giveaway start', value: 'Start a giveaway with automatic winner selection', inline: false },
    ]
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with Looki commands')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Command category')
        .setRequired(false)
        .addChoices(
          { name: '📋 General', value: 'general' },
          { name: '🧸 Moderation', value: 'moderation' },
          { name: '🎀 Leveling', value: 'leveling' },
          { name: '🎀 Music', value: 'music' },
          { name: '🎀 Utility', value: 'utility' },
          { name: '🦋 Fun', value: 'fun' }
        )
    ),
  execute: async (interaction, client) => {
    const category = interaction.options.getString('category') || 'general';
    const categoryData = commandCategories[category];

    if (!categoryData) {
      await interaction.reply({ content: 'Category not found!', ephemeral: true });
      return;
    }

    const embed = createEmbed('info', client)
      .setTitle(categoryData.title)
      .setDescription(categoryData.description)
      .addFields(...categoryData.fields)
      .addFields(
        { name: '💡 Tip', value: 'Use `/help` with a category to learn more about specific commands!', inline: false }
      );

    await interaction.reply({ embeds: [embed] });
  },
};