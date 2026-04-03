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
        console.error(error);
        const embed = new EmbedBuilder()
          .setColor(0xF4C2C2)
          .setTitle('❌ Error')
          .setDescription('hmm that didn\'t work :( try again?')
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
      }
    } else if (interaction.isButton()) {
      // Handle button interactions here
    } else if (interaction.isStringSelectMenu()) {
      // Handle select menu interactions here
    }
  },
};