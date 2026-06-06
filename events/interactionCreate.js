const UserFavorites = require('../models/UserFavorites');
const ServerMusicSettings = require('../models/ServerMusicSettings');
const { createEmbed } = require('../utils/embedBuilder');
const { createMusicEmbed } = require('../utils/musicEmbed');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        if (error.code === 10062) return;

        const errorEmbed = createEmbed('error', client)
          .setTitle('Command error')
          .setDescription('There was an error while executing this command.');

        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [errorEmbed] });
          } else {
            await interaction.reply({ embeds: [errorEmbed], flags: 64 });
          }
        } catch (sendError) {
          if (sendError.code === 10062) return;
          console.error('Failed to send command error response:', sendError);
        }
      }
      return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('music_')) {
      await handleMusicButtons(interaction, client);
    }
  },
};

function musicButtonReply(interaction, client, title, description, type) {
  const payload = { embeds: [createMusicEmbed(client, { title, description, type })] };
  if (interaction.deferred || interaction.replied) return interaction.editReply(payload);
  return interaction.reply({ ...payload, flags: 64 });
}

async function handleMusicButtons(interaction, client) {
  await interaction.deferReply({ flags: 64 });

  const player = client.kazagumo.players.get(interaction.guildId);
  if (!player) {
    return musicButtonReply(interaction, client, 'No active session', 'Start music with `/play` first.', 'error');
  }

  const voiceChannel = interaction.member?.voice?.channel;
  if (!voiceChannel || voiceChannel.id !== player.voiceId) {
    return musicButtonReply(
      interaction,
      client,
      'Wrong voice channel',
      'Join the same voice channel as Looki first.',
      'error',
    );
  }

  try {
    switch (interaction.customId) {
      case 'music_pause_resume':
        if (!player.queue.current) {
          return musicButtonReply(interaction, client, 'Nothing is playing', 'Add a song with `/play`.', 'error');
        }
        player.pause(!player.paused);
        return musicButtonReply(
          interaction,
          client,
          player.paused ? 'Paused' : 'Resumed',
          player.paused ? 'Playback is paused.' : 'Playback has resumed.',
        );

      case 'music_skip':
        if (!player.queue.current) {
          return musicButtonReply(interaction, client, 'Nothing is playing', 'Add a song with `/play`.', 'error');
        }
        player.skip();
        return musicButtonReply(interaction, client, 'Skipped', 'Moving to the next track.');

      case 'music_previous': {
        const previous = player.data.get('previousTrack');
        if (!previous) {
          return musicButtonReply(
            interaction,
            client,
            'No previous track',
            'There is no previous track available in this session.',
            'error',
          );
        }
        player.queue.add(previous, { index: 0 });
        player.skip();
        return musicButtonReply(interaction, client, 'Previous track', `Returning to **${previous.title}**.`);
      }

      case 'music_stop':
        player.queue.clear();
        if (player.data.get('stay247')) {
          if (player.queue.current) player.skip();
          return musicButtonReply(
            interaction,
            client,
            'Queue cleared',
            'Music stopped. I will stay connected because 24/7 mode is enabled.',
          );
        }
        await player.destroy();
        return musicButtonReply(interaction, client, 'Music stopped', 'The queue was cleared and I left voice.');

      case 'music_vol_up': {
        const volume = Math.min((player.volume || 100) + 10, 100);
        player.setVolume(volume);
        await ServerMusicSettings.setDefaultVolume(interaction.guildId, volume).catch(() => null);
        return musicButtonReply(interaction, client, 'Volume updated', `Volume is now **${volume}%**.`);
      }

      case 'music_vol_down': {
        const volume = Math.max((player.volume || 100) - 10, 0);
        player.setVolume(volume);
        await ServerMusicSettings.setDefaultVolume(interaction.guildId, volume).catch(() => null);
        return musicButtonReply(interaction, client, 'Volume updated', `Volume is now **${volume}%**.`);
      }

      case 'music_shuffle':
        if (!player.queue.length) {
          return musicButtonReply(interaction, client, 'Queue is empty', 'There are no upcoming tracks to shuffle.', 'error');
        }
        player.queue.shuffle();
        return musicButtonReply(interaction, client, 'Queue shuffled', 'The upcoming tracks have been shuffled.');

      case 'music_loop': {
        const modes = ['none', 'track', 'queue'];
        const currentIndex = modes.indexOf(player.loop);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        player.setLoop(nextMode);
        return musicButtonReply(interaction, client, 'Loop updated', `Loop mode is now **${nextMode.toUpperCase()}**.`);
      }

      case 'music_clear':
        if (!player.queue.length) {
          return musicButtonReply(interaction, client, 'Queue is empty', 'The upcoming queue is already empty.', 'error');
        }
        player.queue.clear();
        return musicButtonReply(interaction, client, 'Queue cleared', 'All upcoming tracks were removed.');

      case 'music_like': {
        const track = player.queue.current;
        if (!track) {
          return musicButtonReply(interaction, client, 'Nothing is playing', 'There is no track to save.', 'error');
        }
        await UserFavorites.addFavorite(interaction.user.id, {
          name: track.title,
          url: track.uri,
          artist: track.author || 'Unknown',
          source: track.sourceName,
        });
        return musicButtonReply(interaction, client, 'Favorite saved', `Added **${track.title}** to your favorites.`);
      }

      default:
        return musicButtonReply(interaction, client, 'Unavailable control', 'This button is no longer available.', 'error');
    }
  } catch (error) {
    console.error('Music button error:', error);
    if (!interaction.replied) {
      return musicButtonReply(
        interaction,
        client,
        'Control failed',
        'I could not process that music control. Please try again.',
        'error',
      ).catch(() => null);
    }
  }
}
