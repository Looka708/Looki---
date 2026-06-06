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
        .setMaxLength(256)
    )
    .addStringOption(option =>
      option.setName('option1')
        .setDescription('First option')
        .setRequired(true)
        .setMaxLength(100)
    )
    .addStringOption(option =>
      option.setName('option2')
        .setDescription('Second option')
        .setRequired(true)
        .setMaxLength(100)
    )
    .addStringOption(option =>
      option.setName('option3')
        .setDescription('Third option (optional)')
        .setRequired(false)
        .setMaxLength(100)
    ),
  execute: async (interaction, client) => {
    try {
      const question = interaction.options.getString('question').trim();
      const option1 = interaction.options.getString('option1').trim();
      const option2 = interaction.options.getString('option2').trim();
      const option3 = interaction.options.getString('option3')?.trim();

      // Input validation
      if (!question || !option1 || !option2) {
        return await interaction.reply({
          content: '❌ Question and at least 2 options are required!',
          flags: 64
        });
      }

      // Check for duplicate options
      const optionsArray = [option1, option2];
      if (option3) optionsArray.push(option3);

      if (new Set(optionsArray).size !== optionsArray.length) {
        return await interaction.reply({
          content: '❌ Poll options must be unique!',
          flags: 64
        });
      }

      const emojis = ['🟦', '🟥', '🟨'];
      let description = `▸ ${question}\n\n`;
      optionsArray.forEach((opt, idx) => {
        description += `${emojis[idx]} — ${opt}\n`;
      });

      const embed = createEmbed('fun', client)
        .setTitle('🎀 Poll')
        .setDescription(description)
        .setFooter({ text: `Poll created by ${interaction.user.username}` });

      const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

      // Add reactions with error handling
      for (let i = 0; i < optionsArray.length; i++) {
        try {
          await msg.react(emojis[i]);
        } catch (error) {
          console.error(`❌ [poll.js] Failed to add reaction ${emojis[i]}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ [poll.js] Error:', error);
      await interaction.reply({
        content: '❌ Failed to create poll',
        flags: 64
      }).catch(() => {});
    }
  },
};