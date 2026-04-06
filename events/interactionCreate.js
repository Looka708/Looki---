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

        // Check if interaction was already deferred/replied to avoid "Interaction already acknowledged" error
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
    } else if (interaction.isStringSelectMenu()) {
      // Handle select menu interactions here
    }
  },
};

async function handleMusicButtons(interaction, client) {
  const { getQueue, toggleRepeat, clearQueue, shuffleQueue, getPreviousSong, setVolume } = require('../utils/musicManager');
  const { playNext } = require('../utils/audioPlayer');
  const { createEmbed } = require('../utils/embedBuilder');
  
  const queue = getQueue(interaction.guildId);
  const voiceChannel = interaction.member.voice.channel;

  // Basic checks
  if (!queue.player || !queue.currentSong) {
    return interaction.reply({ content: '❌ No music is currently playing!', ephemeral: true });
  }

  if (!voiceChannel || voiceChannel.id !== queue.player.channelId) {
    return interaction.reply({ content: '🥺 You must be in the same voice channel as Looki!', ephemeral: true });
  }

  // ── Authorization Check for Destructive Controls ───────────
  const destructiveActions = ['music_skip', 'music_stop', 'music_clear', 'music_shuffle', 'music_previous'];
  if (destructiveActions.includes(interaction.customId)) {
    const isAlone = voiceChannel.members.filter(m => !m.user.bot).size === 1;
    const isMod = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);
    const isRequester = queue.currentSong.requester === interaction.user.tag;

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
        const isPaused = queue.player.paused;
        await queue.player.pause(!isPaused);
        await interaction.reply({ 
          content: `${!isPaused ? '⏸️ Paused' : '▶️ Resumed'} by ${interaction.user}`, 
          ephemeral: false 
        });
        break;

      case 'music_skip':
        await queue.player.stopTrack(); // playNext is triggered by 'end' event
        await interaction.reply({ content: `⏭️ Skipped by ${interaction.user}` });
        break;

      case 'music_previous':
        const prev = getPreviousSong(interaction.guildId);
        if (!prev) return interaction.reply({ content: '❌ No previous songs in history!', ephemeral: true });
        
        await queue.player.stopTrack(); // playNext will be called and pick up 'prev'
        await interaction.reply({ content: `⏮️ Moving back to: **${prev.title}**` });
        break;

      case 'music_shuffle':
        const shuffled = shuffleQueue(interaction.guildId);
        await interaction.reply({ 
          content: shuffled ? `🔀 Queue shuffled by ${interaction.user}` : '❌ Not enough songs to shuffle!', 
          ephemeral: !shuffled 
        });
        break;

      case 'music_stop':
        clearQueue(interaction.guildId);
        if (queue.player) queue.player.destroy();
        await interaction.reply({ content: `⏹️ Stopped and disconnected by ${interaction.user}` });
        break;

      case 'music_clear':
        queue.songs = [];
        await interaction.reply({ content: `🗑️ Queue cleared by ${interaction.user}` });
        break;

      case 'music_vol_up':
        const newVolUp = setVolume(interaction.guildId, queue.volume + 10);
        await interaction.reply({ content: `🔊 Volume increased to **${newVolUp}%**`, ephemeral: true });
        break;

      case 'music_vol_down':
        const newVolDown = setVolume(interaction.guildId, queue.volume - 10);
        await interaction.reply({ content: `🔉 Volume decreased to **${newVolDown}%**`, ephemeral: true });
        break;

      case 'music_loop':
        const mode = toggleRepeat(interaction.guildId);
        await interaction.reply({ content: `🔁 Loop mode: **${mode.toUpperCase()}**` });
        break;

      case 'music_like':
        await interaction.reply({ content: `❤️ Added **${queue.currentSong.title}** to your favorites!`, ephemeral: true });
        break;

      case 'music_queue':
        const songs = queue.songs.slice(0, 5).map((s, i) => `**${i + 1}.** ${s.title}`).join('\n') || 'No more songs in queue.';
        const qEmbed = createEmbed('music', client)
          .setTitle('📜 Upcoming Tracks')
          .setDescription(songs)
          .setFooter({ text: `Total Songs: ${queue.songs.length}` });
        await interaction.reply({ embeds: [qEmbed], ephemeral: true });
        break;
    }
  } catch (error) {
    console.error('Button Interaction Error:', error);
    await interaction.reply({ content: '❌ Failed to process that action.', ephemeral: true });
  }
}