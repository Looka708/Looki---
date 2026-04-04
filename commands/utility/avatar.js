const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'avatar',
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('🌸 grab someone\'s profile picture')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('the user to get the avatar of')
        .setRequired(false)
    ),
  execute: async (interaction, client) => {
    const user = interaction.options.getUser('user') || interaction.user;
    
    // Get full user object to ensure high-res avatar
    const fullUser = await client.users.fetch(user.id, { force: true });
    
    const avatarUrl = fullUser.displayAvatarURL({ size: 1024, dynamic: true });

    const embed = createEmbed('default', client)
      .setTitle(`🌸 ${fullUser.username}'s avatar`)
      .setImage(avatarUrl)
      .setDescription(`[download high-res](${avatarUrl}) ✨`);

    await interaction.reply({ embeds: [embed] });
  },
};
