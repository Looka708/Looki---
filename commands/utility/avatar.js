const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'avatar',
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get someone\'s profile picture')
    .addUserOption(option => option
      .setName('user')
      .setDescription('User to get the avatar of')),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ size: 1024 });

    const embed = createEmbed('default', client)
      .setTitle(`${user.username}'s Avatar`)
      .setImage(avatarUrl)
      .setDescription(`[Download high-res](${avatarUrl})`);

    return interaction.reply({ embeds: [embed] });
  },
};
