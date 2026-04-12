const { createEmbed } = require('../utils/embedBuilder');
const { PermissionFlagsBits } = require('discord.js');

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
        const errorEmbed = createEmbed('error', client)
          .setTitle('🥺 Command Error')
          .setDescription('There was an error while executing this command! 🎀');
          
        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
          } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          }
        } catch (e) {
          console.error('Failed to send error response (likely token expired):', e);
        }
      }
    } else if (interaction.isButton()) {
      if (interaction.customId.startsWith('music_')) {
        await handleMusicButtons(interaction, client);
      }
    }
  },
};

async function handleMusicButtons(interaction, client) {
  const player = client.riffy.players.get(interaction.guildId);

  if (!player) {
    return interaction.reply({ content: '🥺 No active music session found!', ephemeral: true });
  }

  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel || voiceChannel.id !== player.voiceChannel) {
    return interaction.reply({ content: '🥺 You must be in the same voice channel as Looki!', ephemeral: true });
  }

  try {
    switch (interaction.customId) {
      case 'music_pause_resume':
        if (player.paused) {
          player.pause(false);
          await interaction.reply({ content: '▶️ Resumed the melody! ✨', ephemeral: true });
        } else {
          player.pause(true);
          await interaction.reply({ content: '⏸️ Paused the melody... ✨', ephemeral: true });
        }
        break;

      case 'music_skip':
        player.stop(); // Stops current track, plays next if queued
        await interaction.reply({ content: '⏭️ Skipping to the next masterpiece! 🎀', ephemeral: true });
        break;

      case 'music_previous':
        if (player.previous) {
            player.queue.unshift(player.current);
            player.play(player.previous);
            await interaction.reply({ content: '⏮️ Returning to the previous melody! 🎀', ephemeral: true });
        } else {
            await interaction.reply({ content: '🥺 No previous songs to play! ✨', ephemeral: true });
        }
        break;

      case 'music_stop':
        player.destroy();
        await interaction.reply({ content: '⏹️ Music stopped and queue cleared! ✨', ephemeral: true });
        break;

      case 'music_vol_up':
        const newVolUp = Math.min(player.volume + 10, 100);
        player.setVolume(newVolUp);
        await interaction.reply({ content: `🔊 Volume increased to **${newVolUp}%** ✨`, ephemeral: true });
        break;

      case 'music_vol_down':
        const newVolDown = Math.max(player.volume - 10, 0);
        player.setVolume(newVolDown);
        await interaction.reply({ content: `🔉 Volume decreased to **${newVolDown}%** ✨`, ephemeral: true });
        break;

      case 'music_shuffle':
        player.queue.shuffle();
        await interaction.reply({ content: '🔀 Queue shuffled! ✨', ephemeral: true });
        break;

      case 'music_loop':
          const loopModes = ['none', 'track', 'queue'];
          const currentIndex = loopModes.indexOf(player.loop);
          const nextMode = loopModes[(currentIndex + 1) % 3];
          player.setLoop(nextMode);
          await interaction.reply({ content: `🔁 Loop mode: **${nextMode.toUpperCase()}** ✨`, ephemeral: true });
          break;

      case 'music_clear':
          if (player.queue.length === 0) {
              await interaction.reply({ content: '🧸 Queue is already empty! ✨', ephemeral: true });
          } else {
              player.queue.clear();
              await interaction.reply({ content: '🧹 Cleared the upcoming songs! ✨', ephemeral: true });
          }
          break;

      case 'music_like':
          const track = player.current;
          if (!track) return interaction.reply({ content: '🥺 Nothing playing right now!', ephemeral: true });
          
          try {
              const UserFavorites = require('../models/UserFavorites');
              await UserFavorites.addFavorite(interaction.user.id, {
                  name: track.info.title,
                  url: track.info.uri,
                  thumbnail: track.info.thumbnail,
                  uploader: { name: track.info.author }
              });
              await interaction.reply({ content: `🤍 Added **${track.info.title}** to your favorites! 🎀`, ephemeral: true });
          } catch (e) {
             console.error('Like button error:', e);
             await interaction.reply({ content: '🥺 Could not save to favorites... ✨', ephemeral: true });
          }
          break;

      default:
        await interaction.reply({ content: '🥺 This button is currently under maintenance! 🎀', ephemeral: true });
    }
  } catch (error) {
    console.error('Music button error:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: '❌ Error processing interaction.', ephemeral: true }).catch(() => {});
    }
  }
}