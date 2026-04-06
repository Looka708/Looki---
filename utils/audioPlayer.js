const { getQueue, getNextSong, setPlaying, toggleRepeat } = require('./musicManager');
const { createEmbed } = require('./embedBuilder');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function playNext(guildId, client, channel) {
  const queue = getQueue(guildId);
  if (!queue.player) return;

  const song = getNextSong(guildId);
  if (!song) {
    queue.isPlaying = false;
    const endEmbed = createEmbed('music', client)
      .setTitle('🎀 Queue Ended')
      .setDescription('Finished playing all songs in the queue.');
    if (channel) channel.send({ embeds: [endEmbed] });
    return;
  }

  queue.currentSong = song;
  queue.isPlaying = true;

  try {
    // ── Shoukaku track mapping ───────────
    await queue.player.playTrack({ track: { encoded: song.encoded } });

    // ── Build Embed ───────────
    const playEmbed = createEmbed('music', client)
      .setAuthor({ 
        name: '🎀 Now Playing 🎀', 
        iconURL: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png' 
      })
      .setTitle(`${song.title}`)
      .setURL(song.url)
      .setColor(0xFFB6C1) // Pookie Pink
      .addFields(
        { name: '🦋 Artist', value: `\`${song.author || 'Unknown'}\``, inline: true },
        { name: '💖 Duration', value: `\`${song.duration}\``, inline: true },
        { name: '🧸 Requested by', value: `${song.requester} 🥺`, inline: true },
        { name: '✨ Last Activity', value: `\`Playing: ${song.title} by ${song.requester}\``, inline: true },
        { name: '🌸 Autoplay', value: `\`Disabled\``, inline: true },
        { name: '💌 Lyrics', value: '```Live Lyrics is included with Pro and higher plans.```' }
      )
      .setImage(song.thumbnail)
      .setFooter({ 
        text: `🎀 looki~ • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`, 
        iconURL: client.user.displayAvatarURL() 
      });

    // ── Build Buttons (2-Row Layout) ───────────
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('music_shuffle').setEmoji('🔀').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_previous').setEmoji('⏮️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_pause_resume').setEmoji('🌸').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_skip').setEmoji('✨').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_loop').setEmoji('🦋').setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('music_clear').setEmoji('🧹').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_vol_down').setEmoji('◀️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('music_vol_up').setEmoji('🎀').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('music_like').setEmoji('🤍').setStyle(ButtonStyle.Secondary)
    );

    if (channel) channel.send({ embeds: [playEmbed], components: [row1, row2] });

  } catch (error) {
    console.error('Lavalink Play Error:', error);
    if (channel) channel.send('🥺 There was an error playing this track. Skipping...');
    playNext(guildId, client, channel);
  }
}

module.exports = {
  playNext
};
