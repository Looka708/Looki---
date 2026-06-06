const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

function responseEmbed(client, type, title, description) {
  return createEmbed(type, client).setTitle(title).setDescription(description);
}

module.exports = {
  name: 'say',
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot send a message')
    .addStringOption(option => option
      .setName('message')
      .setDescription('Message to send, up to 1800 characters')
      .setRequired(true)
      .setMaxLength(1800))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, client) {
    const message = interaction.options.getString('message', true).trim();

    if (!message) {
      return interaction.reply({
        embeds: [responseEmbed(client, 'error', 'Empty message', 'Enter a message for me to send.')],
        flags: 64,
      });
    }

    if (/@everyone|@here/i.test(message)) {
      return interaction.reply({
        embeds: [responseEmbed(client, 'error', 'Mass mention blocked', '`@everyone` and `@here` are not allowed.')],
        flags: 64,
      });
    }

    const userMentions = [...new Set(
      [...message.matchAll(/<@!?(\d+)>/g)].map(match => match[1]),
    )];
    if (userMentions.length > 5) {
      return interaction.reply({
        embeds: [responseEmbed(client, 'error', 'Too many mentions', 'A `/say` message can mention at most five users.')],
        flags: 64,
      });
    }

    if (/(.)\1{10,}/i.test(message)) {
      return interaction.reply({
        embeds: [responseEmbed(client, 'error', 'Message blocked', 'The message contains too much repeated text.')],
        flags: 64,
      });
    }

    await interaction.deferReply({ flags: 64 });

    try {
      await interaction.channel.send({
        content: message,
        allowedMentions: {
          parse: [],
          users: userMentions,
        },
      });

      return interaction.editReply({
        embeds: [responseEmbed(client, 'success', 'Message sent', 'Your message was posted safely.')],
      });
    } catch (error) {
      console.error('[Say] Failed to send message:', error);
      return interaction.editReply({
        embeds: [responseEmbed(client, 'error', 'Send failed', 'I could not post that message in this channel.')],
      });
    }
  },
};
