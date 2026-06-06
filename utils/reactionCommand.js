const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('./embedBuilder');
const reactionGifs = require('./reactionGifs');

function createReactionCommand(options) {
  const data = new SlashCommandBuilder()
    .setName(options.name)
    .setDescription(options.description);

  if (options.targeted) {
    data.addUserOption(option => option
      .setName('user')
      .setDescription(options.targetDescription || 'Choose someone')
      .setRequired(true));
  }

  return {
    name: options.name,
    data,
    async execute(interaction, client) {
      const target = options.targeted ? interaction.options.getUser('user', true) : null;

      if (target?.id === interaction.user.id && options.selfMessage) {
        return interaction.reply({ content: options.selfMessage, ephemeral: true });
      }

      if (target?.id === client.user.id && options.botMessage) {
        return interaction.reply({ content: options.botMessage, ephemeral: true });
      }

      const image = reactionGifs.getRandomGif(options.name);
      const description = options.message(interaction.user, target);
      const embed = createEmbed('fun', client)
        .setTitle(options.title)
        .setDescription(description);

      if (image) embed.setImage(image);

      return interaction.reply({
        content: target ? `<@${target.id}>` : undefined,
        embeds: [embed],
        allowedMentions: target ? { users: [target.id] } : undefined,
      });
    },
  };
}

module.exports = { createReactionCommand };
