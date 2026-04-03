const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

const responses = [
  'It is certain ✨',
  'It is decidedly so 🌸',
  'Without a doubt 💕',
  'Yes definitely ✦',
  'You may rely on it 🎀',
  'As I see it, yes ⭐',
  'Most likely 💫',
  'Outlook good ✨',
  'Yes 🌸',
  'Signs point to yes 💕',
  'Reply hazy, try again ✦',
  'Ask again later 🎀',
  'Better not tell you now ⭐',
  'Cannot predict now 💫',
  'Concentrate and ask again ✨',
  'Don\'t count on it 🌸',
  'My reply is no 💕',
  'My sources say no ✦',
  'Outlook not so good 🎀',
  'Very doubtful ⭐',
];

module.exports = {
  name: '8ball',
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8-ball a question')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your question for the 8-ball')
        .setRequired(true)
    ),
  execute: async (interaction, client) => {
    const question = interaction.options.getString('question');
    const response = responses[Math.floor(Math.random() * responses.length)];

    const embed = createEmbed('fun', client)
      .setTitle('🎱 Magic 8-Ball')
      .addFields(
        { name: '❓ Question', value: question },
        { name: '✦ Answer', value: response }
      );

    await interaction.reply({ embeds: [embed] });
  },
};