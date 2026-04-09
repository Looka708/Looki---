const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'say',
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('🗣️ make the bot say something pookie (mod+ only)')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('what should i say? (max 1800 chars, no @everyone/@here)')
        .setRequired(true)
        .setMaxLength(1800)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  execute: async (interaction) => {
    try {
      const message = interaction.options.getString('message').trim();
      
      // Security validations
      if (message.length === 0) {
        return await interaction.reply({ content: '❌ Message cannot be empty!', ephemeral: true });
      }

      // Prevent @everyone and @here mentions
      if (message.includes('@everyone') || message.includes('@here')) {
        return await interaction.reply({ 
          content: '🥺 Cannot use @everyone or @here for security reasons!', 
          ephemeral: true 
        });
      }

      // Warn if excessive mentions (potential spam)
      const mentionCount = (message.match(/<@!?\d+>/g) || []).length;
      if (mentionCount > 5) {
        return await interaction.reply({ 
          content: `⚠️ Too many mentions (${mentionCount})! Max 5 allowed.`, 
          ephemeral: true 
        });
      }

      // Prevent role/channel mass mentions
      if (message.includes('$everyone') || message.includes('$here')) {
        return await interaction.reply({ 
          content: '🥺 Cannot use mass mentions!', 
          ephemeral: true 
        });
      }

      // Check for repeated characters (spam pattern)
      const repeatedChars = message.match(/(.)\1{10,}/);
      if (repeatedChars) {
        return await interaction.reply({ 
          content: '🥺 Message contains too much repetition!', 
          ephemeral: true 
        });
      }

      await interaction.reply({ content: 'sending...', ephemeral: true });
      
      try {
        await interaction.channel.send(message);
        await interaction.editReply({ content: '✨ sent!' });
      } catch (sendError) {
        await interaction.editReply({ 
          content: `❌ Failed to send message: ${sendError.message}` 
        });
      }
    } catch (error) {
      console.error('❌ [say.js] Error:', error);
      await interaction.reply({ 
        content: '❌ Failed to process say command',
        ephemeral: true 
      });
    }
  },
};
