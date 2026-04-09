const { EmbedBuilder, Collection, PermissionFlagsBits } = require('discord.js');
const UserFavorites = require('../models/UserFavorites');

const interactionCooldowns = new Collection();

module.exports = {
  name: 'interactionCreate',
  execute: async (interaction, client) => {
    // -- Global Rate Limiting Cooldown --
    const cooldownAmount = 3000; // 3 seconds
    if (interactionCooldowns.has(interaction.user.id)) {
      const expirationTime = interactionCooldowns.get(interaction.user.id) + cooldownAmount;
      if (Date.now() < expirationTime) {
        const timeLeft = (expirationTime - Date.now()) / 1000;
        return interaction.reply({ content: `🥺 Please wait ${timeLeft.toFixed(1)} more second(s) before putting another command!`, ephemeral: true }).catch(() => { });
      }
    }
    interactionCooldowns.set(interaction.user.id, Date.now());
    setTimeout(() => interactionCooldowns.delete(interaction.user.id), cooldownAmount);

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);

        const embed = new EmbedBuilder()
          .setColor(0xF4C2C2)
          .setTitle('❌ Error')
          .setDescription('hmm that didn\'t work :( try again?')
          .setTimestamp();

        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ embeds: [embed] }).catch(() => { });
        } else {
          await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => { });
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
  const { createEmbed } = require('../utils/embedBuilder');

  const voiceChannel = interaction.member.voice.channel;
  if (!voiceChannel) {
    return interaction.reply({ content: '🥺 You must be in a voice channel!', ephemeral: true });
  }


  const queue = client.music.queues.get(interaction.guildId);
  const player = client.shoukaku.players.get(interaction.guildId);

  if (!queue || !player) {
    return interaction.reply({
      content: '🥺 No active music session found!',
      ephemeral: true
    });
  }

  // Permission Check
  if (interaction.user.id !== '463050942004232193') { 
    const isMod = interaction.member.permissions.has(PermissionFlagsBits.ManageMessages);
    const isAlone = interaction.member.voice.channel?.members.size === 2;
    const currentSong = queue.songs[0];
    const isRequester = currentSong?.requesterId === interaction.user.id;

    if (!isAlone && !isMod && !isRequester) {
      return interaction.reply({
        content: '🥺 You must be a Moderator, alone, or the **Requester** of this song to do that!',
        ephemeral: true
      });
    }
  }

  try {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ ephemeral: true });
    }

    switch (interaction.customId) {
      case 'music_pause_resume':
        if (player.paused) {
          player.resume();
          await interaction.editReply({ content: `▶️ Resumed by ${interaction.user}` });
        } else {
          player.pause();
          await interaction.editReply({ content: `⏸️ Paused by ${interaction.user}` });
        }
        break;

      case 'music_skip':
        if (queue.songs.length <= 1 && queue.loop === 0) {
          client.music.stop(interaction.guildId);
          await client.shoukaku.leaveVoiceChannel(interaction.guildId);
          await interaction.editReply({ content: `⏹️ Queue ended and stopped by ${interaction.user}` });
        } else {
          client.music.skip(interaction.guildId);
          await interaction.editReply({ content: `⏭️ Skipped by ${interaction.user}` });
        }
        break;

      case 'music_previous':
        await interaction.editReply({ content: '❌ History is not supported in the current Lavalink mode yet!' });
        break;

      case 'music_shuffle':
        queue.songs = [queue.songs[0], ...queue.songs.slice(1).sort(() => Math.random() - 0.5)];
        await interaction.editReply({ content: `🔀 Queue shuffled by ${interaction.user}` });
        break;

      case 'music_stop':
        client.music.stop(interaction.guildId);
        await client.shoukaku.leaveVoiceChannel(interaction.guildId);
        await interaction.editReply({ content: `⏹️ Stopped and disconnected by ${interaction.user}` });
        break;

      case 'music_clear':
        queue.songs = [queue.songs[0]];
        await interaction.editReply({ content: `🗑️ Queue cleared by ${interaction.user}` });
        break;

      case 'music_vol_up':
        const newVolUp = Math.min(queue.volume + 10, 100);
        queue.volume = newVolUp;
        player.setVolume(newVolUp / 100);
        await interaction.editReply({ content: `🔊 Volume increased to **${newVolUp}%**` });
        break;

      case 'music_vol_down':
        const newVolDown = Math.max(queue.volume - 10, 0);
        queue.volume = newVolDown;
        player.setVolume(newVolDown / 100);
        await interaction.editReply({ content: `🔉 Volume decreased to **${newVolDown}%**` });
        break;

      case 'music_loop':
        queue.loop = (queue.loop + 1) % 3;
        const modes = ['OFF', 'TRACK', 'QUEUE'];
        await interaction.editReply({ content: `🔁 Loop mode: **${modes[queue.loop]}**` });
        break;

      case 'music_like':
        try {
          const currentSong = queue.songs[0];
          const isFavorited = await UserFavorites.isFavorite(interaction.user.id, currentSong.uri);

          if (isFavorited) {
            await UserFavorites.removeFavorite(interaction.user.id, currentSong.url);
            await interaction.editReply({ content: `💔 Removed **${currentSong.name}** from favorites` });
          } else {
            await UserFavorites.addFavorite(interaction.user.id, currentSong);
            await interaction.editReply({ content: `❤️ Added **${currentSong.name}** to favorites!` });
          }
        } catch (error) {
          console.error('Error handling like button:', error);
          await interaction.editReply({ content: '❌ Failed to manage favorites - try again later' });
        }
        break;
    }
  } catch (error) {
    console.error('Button Interaction Error:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ Failed to process that action.', ephemeral: true }).catch(() => { });
    } else {
      await interaction.editReply({ content: '❌ Failed to process that action.' }).catch(() => { });
    }
  }
}