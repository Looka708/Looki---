const { EmbedBuilder, Collection, PermissionFlagsBits } = require('discord.js');

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
        return interaction.reply({ content: `🥺 Please wait ${timeLeft.toFixed(1)} more second(s) before putting another command!`, ephemeral: true }).catch(() => {});
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
          await interaction.editReply({ embeds: [embed] }).catch(() => {});
        } else {
          await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
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
  
  const distubeQueue = client.distube.getQueue(interaction.guildId);
  const voiceChannel = interaction.member.voice.channel;

  if (!distubeQueue || !distubeQueue.songs[0]) {
    return interaction.reply({ content: '❌ No music is currently playing!', ephemeral: true });
  }

  if (!voiceChannel || voiceChannel.id !== distubeQueue.voiceChannel?.id) {
    return interaction.reply({ content: '🥺 You must be in the same voice channel as Looki!', ephemeral: true });
  }

  const destructiveActions = ['music_skip', 'music_stop', 'music_clear', 'music_shuffle', 'music_previous'];
  if (destructiveActions.includes(interaction.customId)) {
    const isAlone = voiceChannel.members.filter(m => !m.user.bot).size === 1;
    const isMod = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);
    const isRequester = distubeQueue.songs[0].user?.tag === interaction.user.tag;

    if (!isAlone && !isMod && !isRequester) {
      return interaction.reply({ 
        content: '🥺 You must be a Moderator, alone, or the **Requester** of this song to do that!', 
        ephemeral: true 
      });
    }
  }

  try {
    switch (interaction.customId) {
      case 'music_pause_resume':
        if (distubeQueue.paused) {
          distubeQueue.resume();
          await interaction.reply({ content: `▶️ Resumed by ${interaction.user}` });
        } else {
          distubeQueue.pause();
          await interaction.reply({ content: `⏸️ Paused by ${interaction.user}` });
        }
        break;

      case 'music_skip':
        if (distubeQueue.songs.length <= 1 && distubeQueue.repeatMode === 0) {
          await distubeQueue.stop();
          await interaction.reply({ content: `⏹️ Queue ended and stopped by ${interaction.user}` });
        } else {
          await distubeQueue.skip();
          await interaction.reply({ content: `⏭️ Skipped by ${interaction.user}` });
        }
        break;

      case 'music_previous':
        if (distubeQueue.previousSongs.length === 0) {
          return interaction.reply({ content: '❌ No previous songs in history!', ephemeral: true });
        }
        await distubeQueue.previous();
        await interaction.reply({ content: `⏮️ Moving back to previous track!` });
        break;

      case 'music_shuffle':
        await distubeQueue.shuffle();
        await interaction.reply({ content: `🔀 Queue shuffled by ${interaction.user}` });
        break;

      case 'music_stop':
        await distubeQueue.stop();
        await interaction.reply({ content: `⏹️ Stopped and disconnected by ${interaction.user}` });
        break;

      case 'music_clear':
        distubeQueue.songs = [distubeQueue.songs[0]];
        await interaction.reply({ content: `🗑️ Queue cleared by ${interaction.user}` });
        break;

      case 'music_vol_up':
        const newVolUp = Math.min(distubeQueue.volume + 10, 100);
        distubeQueue.setVolume(newVolUp);
        await interaction.reply({ content: `🔊 Volume increased to **${newVolUp}%**`, ephemeral: true });
        break;

      case 'music_vol_down':
        const newVolDown = Math.max(distubeQueue.volume - 10, 0);
        distubeQueue.setVolume(newVolDown);
        await interaction.reply({ content: `🔉 Volume decreased to **${newVolDown}%**`, ephemeral: true });
        break;

      case 'music_loop':
        let newMode = (distubeQueue.repeatMode + 1) % 3;
        distubeQueue.setRepeatMode(newMode);
        const modes = ['OFF', 'TRACK', 'QUEUE'];
        await interaction.reply({ content: `🔁 Loop mode: **${modes[newMode]}**` });
        break;

      case 'music_like':
        await interaction.reply({ content: `❤️ Added **${distubeQueue.songs[0].name}** to your favorites!`, ephemeral: true });
        break;
    }
  } catch (error) {
    console.error('Button Interaction Error:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ Failed to process that action.', ephemeral: true }).catch(() => {});
    }
  }
}