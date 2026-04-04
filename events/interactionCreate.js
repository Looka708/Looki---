const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  execute: async (interaction, client) => {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        
        const embed = new EmbedBuilder()
          .setColor(0xF4C2C2)
          .setTitle('❌ Error')
          .setDescription('hmm that didn\'t work :( try again?')
          .setTimestamp();

        // Check if interaction was already deferred/replied to avoid "Interaction already acknowledged" error
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ embeds: [embed] }).catch(() => {});
        } else {
          await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
        }
      }
    } else if (interaction.isButton()) {
      // Handle button interactions here
    } else if (interaction.isStringSelectMenu()) {
      // Handle select menu interactions here
    }
  },
};