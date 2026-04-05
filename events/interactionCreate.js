const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  execute: async (interaction, client) => {
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
  const { getQueue, toggleRepeat, clearQueue } = require('../utils/musicManager');
  const { playNext } = require('../utils/audioPlayer');
  const { createEmbed } = require('../utils/embedBuilder');
  
  const queue = getQueue(interaction.guildId);
  const voiceChannel = interaction.member.voice.channel;

  // Basic checks
  if (!queue.player || !queue.currentSong) {
    return interaction.reply({ content: '❌ No music is currently playing!', ephemeral: true });
  }

  if (!voiceChannel || voiceChannel.id !== queue.player.channelId) {
    return interaction.reply({ content: '❌ You must be in the same voice channel as Looki!', ephemeral: true });
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

      case 'music_stop':
        clearQueue(interaction.guildId);
        await interaction.reply({ content: `⏹️ Stopped and cleared by ${interaction.user}` });
        break;

      case 'music_loop':
        const mode = toggleRepeat(interaction.guildId);
        await interaction.reply({ content: `🔁 Loop mode: **${mode.toUpperCase()}**` });
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