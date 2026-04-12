const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('🎀 Manage your music playlists')
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription('Create a new playlist')
        .addStringOption(opt =>
          opt.setName('name')
            .setDescription('Playlist name')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add current song to a playlist')
        .addStringOption(opt =>
          opt.setName('playlist')
            .setDescription('Playlist name')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all your playlists')
    ),

  async execute(interaction, client) {
    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'create') {
        const playlistName = interaction.options.getString('name');
        
        // TODO: Implement playlist creation in database
        await interaction.reply({
          embeds: [createEmbed('music', client)
            .setTitle('🎀 Playlist Created')
            .setDescription(`Created playlist "**${playlistName}**"!\n\nUse \`/playlist add\` to add songs.`)],
          ephemeral: true
        });
      } else if (subcommand === 'add') {
        const player = client.kazagumo.players.get(interaction.guildId);
        const playlistName = interaction.options.getString('playlist');

        if (!player || !player.queue.current) {
          return await interaction.reply({
            content: '❌ No music is currently playing!',
            ephemeral: true
          });
        }

        const song = player.queue.current;
        
        // TODO: Implement adding to playlist in database
        await interaction.reply({
          embeds: [createEmbed('music', client)
            .setTitle('➕ Added to Playlist')
            .setDescription(`Added **${song.title}** to **${playlistName}**`)],
          ephemeral: true
        });
      } else if (subcommand === 'list') {
        // TODO: Implement fetching playlists from database
        await interaction.reply({
          embeds: [createEmbed('music', client)
            .setTitle('🎀 Your Playlists')
            .setDescription('No playlists yet. Create one with `/playlist create`!')],
          ephemeral: true
        });
      }
    } catch (error) {
      console.error('Error in playlist command:', error);
      await interaction.reply({
        content: '❌ Playlist command error',
        ephemeral: true
      });
    }
  },
};
