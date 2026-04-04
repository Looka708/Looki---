const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'clear',
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('✨ clear away messages pookie style')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('number of messages to clear (1-100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('target')
        .setDescription('target a specific user to clean up')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  execute: async (interaction, client) => {
    const amount = interaction.options.getInteger('amount');
    const target = interaction.options.getUser('target');

    const messages = await interaction.channel.messages.fetch({
      limit: amount + 1, // +1 because the slash command itself doesn't count, but just in case for buffer
    });

    let filtered = messages;
    if (target) {
      filtered = messages.filter(m => m.author.id === target.id);
    }
    
    // We only take the required amount
    const toDelete = Array.from(filtered.values()).slice(0, amount);

    try {
      await interaction.channel.bulkDelete(toDelete, true);
      
      const embed = createEmbed('success', client)
        .setTitle('🧼 all clean!')
        .setDescription(`poof! cleared away \`${toDelete.length}\` messages 🌸`)
        .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/m9pQ7XfS6S0m4/giphy.gif');
        
      if (target) {
        embed.setDescription(`poof! cleared away \`${toDelete.length}\` messages from ${target} 🌸`);
      }

      await interaction.reply({ embeds: [embed] });
      setTimeout(() => interaction.deleteReply().catch(() => {}), 5000); // delete bot reply after 5s

    } catch (error) {
      console.error(error);
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ oopsie')
        .setDescription('hmm that didn\'t work :( try again? maybe messages are too old (14+ days) 🎀');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
