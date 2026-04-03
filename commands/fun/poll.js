const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'poll',
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a reaction poll')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('The poll question')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('option1')
        .setDescription('First option')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('option2')
        .setDescription('Second option')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('option3')
        .setDescription('Third option (optional)')
        .setRequired(false)
    ),
  execute: async (interaction, client) => {
    const question = interaction.options.getString('question');
    const option1 = interaction.options.getString('option1');
    const option2 = interaction.options.getString('option2');
    const option3 = interaction.options.getString('option3');

    const options = [option1, option2];
    if (option3) options.push(option3);

    const emojis = ['🟦', '🟥', '🟨'];
    let description = `▸ ${question}\n\n`;
    options.forEach((opt, idx) => {
      description += `${emojis[idx]} — ${opt}\n`;
    });

    const embed = createEmbed('fun', client)
      .setTitle('📊 Poll')
      .setDescription(description);

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

    for (let i = 0; i < options.length; i++) {
      await msg.react(emojis[i]);
    }
  },
};