const { createEmbed, CATEGORY_GIFS } = require('./embedBuilder');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function handleDistubeEvents(client) {
  client.distube
    .on('playSong', (queue, song) => {
      const playEmbed = createEmbed('music', client)
        .setAuthor({ 
          name: '🎀 Now Playing 🎀', 
          iconURL: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png' 
        })
        .setTitle(`${song.name}`)
        .setURL(song.url)
        .setColor(0xFFB6C1) // Pookie Pink
        .addFields(
          { name: '🦋 Artist', value: `> **${song.uploader.name || 'Unknown'}**`, inline: true },
          { name: '💖 Duration', value: `> **${song.formattedDuration}**`, inline: true },
          { name: '🧸 Requested by', value: `> **${song.user.tag}**`, inline: true }
        )
        .setImage(song.thumbnail)
        .setThumbnail(CATEGORY_GIFS?.music || 'https://cdn.discordapp.com/attachments/1110915631720370216/1110915721839185970/Looki_Default.gif')
        .setFooter({ 
          text: `🎀 looki~ • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`, 
          iconURL: client.user.displayAvatarURL() 
        });

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

      queue.textChannel?.send({ embeds: [playEmbed], components: [row1, row2] });
    })
    .on('addSong', (queue, song) => {
      const embed = createEmbed('music', client)
        .setTitle('💖 Added to Queue')
        .setDescription(`**[${song.name}](${song.url})** ✨`)
        .addFields(
          { name: '🧸 Requester', value: song.user.tag, inline: true },
          { name: '🎀 Position', value: `#${queue.songs.length}`, inline: true }
        );
      if (song.thumbnail) embed.setThumbnail(song.thumbnail);
      queue.textChannel?.send({ embeds: [embed] });
    })
    .on('addList', (queue, playlist) => {
      const embed = createEmbed('music', client)
        .setTitle('🎀 Playlist Added')
        .setDescription(`Added **${playlist.songs.length}** tracks from **${playlist.name}** to the queue ✨.`)
        .addFields({ name: '🧸 Requester', value: playlist.user.tag });
      queue.textChannel?.send({ embeds: [embed] });
    })
    .on('error', (channel, e) => {
      console.error('DisTube Error:', e);
      if (channel) {
        channel.send({
          embeds: [createEmbed('error', client)
            .setTitle('🥺 Music Error')
            .setDescription(`An error occurred: ${e.message.slice(0, 2000)}`)]
        });
      }
    })
    .on('empty', queue => {
      queue.textChannel?.send({
        embeds: [createEmbed('music', client)
          .setTitle('🎀 Voice Channel Empty')
          .setDescription('Everyone left, so I\'m stopping the music. Bye bye! ~ 🦋')]
      });
    })
    .on('finish', queue => {
      queue.textChannel?.send({
        embeds: [createEmbed('music', client)
          .setTitle('🎀 Queue Finished')
          .setDescription('All songs have been played! ✨')]
      });
    });
}

module.exports = {
  handleDistubeEvents
};
