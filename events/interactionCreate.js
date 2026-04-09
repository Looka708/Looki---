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
          
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
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
  const queue = client.distube.getQueue(interaction.guildId);

  if (!queue) {
    return interaction.reply({ content: '🥺 No active music session found!', ephemeral: true });
  }

  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel || voiceChannel.id !== queue.voiceChannel?.id) {
    return interaction.reply({ content: '🥺 You must be in the same voice channel as Looki!', ephemeral: true });
  }

  try {
    switch (interaction.customId) {
      case 'music_pause_resume':
        if (queue.paused) {
          queue.resume();
          await interaction.reply({ content: '▶️ Resumed the melody! ✨', ephemeral: true });
        } else {
          queue.pause();
          await interaction.reply({ content: '⏸️ Paused the melody... ✨', ephemeral: true });
        }
        break;

      case 'music_skip':
        if (queue.songs.length <= 1 && !queue.autoplay) {
          queue.stop();
          await interaction.reply({ content: '🧸 Queue ended! Stopping playback. ✨', ephemeral: true });
        } else {
          try {
            await queue.skip();
            await interaction.reply({ content: '⏭️ Skipping to the next masterpiece! 🎀', ephemeral: true });
          } catch (e) {
            queue.stop();
            await interaction.reply({ content: '🧸 No more songs to skip! ✨', ephemeral: true });
          }
        }
        break;

      case 'music_previous':
        try {
            await queue.previous();
            await interaction.reply({ content: '⏮️ Returning to the previous melody! 🎀', ephemeral: true });
        } catch (e) {
            await interaction.reply({ content: '🥺 No previous songs to play! ✨', ephemeral: true });
        }
        break;

      case 'music_stop':
        queue.stop();
        await interaction.reply({ content: '⏹️ Music stopped and queue cleared! ✨', ephemeral: true });
        break;

      case 'music_vol_up':
        const newVolUp = Math.min(queue.volume + 10, 100);
        queue.setVolume(newVolUp);
        await interaction.reply({ content: `🔊 Volume increased to **${newVolUp}%** ✨`, ephemeral: true });
        break;

      case 'music_vol_down':
        const newVolDown = Math.max(queue.volume - 10, 0);
        queue.setVolume(newVolDown);
        await interaction.reply({ content: `🔉 Volume decreased to **${newVolDown}%** ✨`, ephemeral: true });
        break;

      case 'music_shuffle':
        await queue.shuffle();
        await interaction.reply({ content: '🔀 Queue shuffled! ✨', ephemeral: true });
        break;

      case 'music_loop':
          const nextMode = (queue.repeatMode + 1) % 3;
          queue.setRepeatMode(nextMode);
          const modes = ['OFF', 'TRACK', 'QUEUE'];
          await interaction.reply({ content: `🔁 Loop mode: **${modes[nextMode]}** ✨`, ephemeral: true });
          break;

      case 'music_clear':
          if (queue.songs.length <= 1) {
              await interaction.reply({ content: '🧸 Queue is already mostly empty! ✨', ephemeral: true });
          } else {
              const currentSong = queue.songs[0];
              queue.songs = [currentSong];
              await interaction.reply({ content: '🧹 Cleared the upcoming songs! ✨', ephemeral: true });
          }
          break;

      case 'music_like':
          const song = queue.songs[0];
          try {
              const UserFavorites = require('../models/UserFavorites');
              await UserFavorites.addFavorite(interaction.user.id, {
                  name: song.name,
                  url: song.url,
                  thumbnail: song.thumbnail,
                  uploader: { name: song.uploader.name }
              });
              await interaction.reply({ content: `🤍 Added **${song.name}** to your favorites! 🎀`, ephemeral: true });
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