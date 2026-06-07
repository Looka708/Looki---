const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

const CATEGORY_LABELS = {
  config: 'Configuration',
  fun: 'Fun',
  leveling: 'Leveling',
  moderation: 'Moderation',
  music: 'Music',
  utility: 'Utility',
};

function findCategory(client, commandName) {
  const command = client.commands.get(commandName);
  if (command?.category) return command.category;

  const groups = {
    config: ['setlog', 'settings'],
    leveling: ['givexp', 'leaderboard', 'rank', 'removexp'],
    moderation: ['ban', 'clear', 'kick', 'lock', 'slowmode', 'tempban', 'timeout', 'unlock', 'warn'],
    music: [
      '247',
      'clearqueue',
      'favorites',
      'loop',
      'musicsettings',
      'musicstats',
      'nowplaying',
      'pause',
      'play',
      'playlist',
      'queue',
      'remove',
      'resume',
      'seek',
      'shuffle',
      'skip',
      'stop',
      'volume',
    ],
    fun: ['8ball', 'blush', 'coinflip', 'cry', 'dance', 'giveaway', 'highfive', 'hug', 'kiss', 'pat', 'poll', 'roll', 'say', 'slap', 'wink'],
  };

  return Object.entries(groups).find(([, names]) => names.includes(commandName))?.[0] || 'utility';
}

function formatCommands(commands) {
  return commands
    .sort((a, b) => a.data.name.localeCompare(b.data.name))
    .map(command => `\`/${command.data.name}\` | ${command.data.description}`)
    .join('\n');
}

module.exports = {
  name: 'help',
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Browse Looki commands by category')
    .addStringOption(option => option
      .setName('category')
      .setDescription('Only show commands from this category')
      .addChoices(
        { name: 'Configuration', value: 'config' },
        { name: 'Fun', value: 'fun' },
        { name: 'Leveling', value: 'leveling' },
        { name: 'Moderation', value: 'moderation' },
        { name: 'Music', value: 'music' },
        { name: 'Utility', value: 'utility' },
      )),

  async execute(interaction, client) {
    const requestedCategory = interaction.options.getString('category');
    const commands = [...client.commands.values()].filter(command => command.data);

    if (requestedCategory) {
      const matching = commands.filter(command =>
        findCategory(client, command.data.name) === requestedCategory);

      const embed = createEmbed(requestedCategory === 'music' ? 'music' : 'info', client)
        .setTitle(CATEGORY_LABELS[requestedCategory])
        .setDescription(formatCommands(matching) || 'No commands are available in this category.')
        .setFooter({
          text: `${matching.length} command(s) | Use /help to see every category`,
          iconURL: client.user.displayAvatarURL(),
        });

      return interaction.reply({ embeds: [embed] });
    }

    const fields = Object.keys(CATEGORY_LABELS).map(category => {
      const matching = commands.filter(command => findCategory(client, command.data.name) === category);
      return {
        name: CATEGORY_LABELS[category],
        value: matching.map(command => `\`/${command.data.name}\``).sort().join(' ') || 'None',
      };
    });

    const embed = createEmbed('info', client)
      .setTitle('Looki Command Center')
      .setDescription('Choose a category with `/help category:` for descriptions and usage.')
      .addFields(fields)
      .setFooter({
        text: `${commands.length} commands available`,
        iconURL: client.user.displayAvatarURL(),
      });

    return interaction.reply({ embeds: [embed] });
  },
};
