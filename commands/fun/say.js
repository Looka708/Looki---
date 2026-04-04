const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'say',
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('🗣️ make the bot say something pookie')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('what should i say?')
        .setRequired(true)
    ),
  execute: async (interaction) => {
    const message = interaction.options.getString('message');
    
    await interaction.reply({ content: 'sending...', ephemeral: true });
    await interaction.channel.send(message);
    await interaction.deleteReply().catch(() => {});
  },
};
