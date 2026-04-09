const { createEmbed, CATEGORY_GIFS } = require('./embedBuilder');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const MusicLogger = require('./musicLogger');
const UserFavorites = require('../models/UserFavorites');

function handleDistubeEvents(client) {
  client.distube
    .on('playSong', (queue, song) => {
      try {
        const playEmbed = createEmbed('music', client)
          .setAuthor({ 
            name: '🎀 Now Playing 🎀', 
            iconURL: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png' 
          })
          .setTitle(`${song.name}`)
          .setURL(song.url)
          .setColor(0xFFB6C1)
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

        queue.textChannel?.send({ embeds: [playEmbed], components: [row1, row2] }).catch(err => {
          MusicLogger.logError('playSong - send', err, { guildId: queue.voiceChannel?.guild.id });
        });

        MusicLogger.logSuccess('playSong', `Now playing ${song.name}`, { 
          guildId: queue.voiceChannel?.guild.id,
          requester: song.user?.tag 
        });

        // Log to activity
        MusicLogger.logMusicActivity(queue.voiceChannel?.guild?.id, 'play', song);
      } catch (error) {
        MusicLogger.logError('playSong', error);
      }
    })

    .on('addSong', (queue, song) => {
      try {
        const embed = createEmbed('music', client)
          .setTitle('💖 Added to Queue')
          .setDescription(`**[${song.name}](${song.url})** ✨`)
          .addFields(
            { name: '🧸 Requester', value: song.user.tag, inline: true },
            { name: '🎀 Position', value: `#${queue.songs.length}`, inline: true }
          );
        if (song.thumbnail) embed.setThumbnail(song.thumbnail);
        
        queue.textChannel?.send({ embeds: [embed] }).catch(err => {
          MusicLogger.logError('addSong - send', err);
        });
      } catch (error) {
        MusicLogger.logError('addSong', error);
      }
    })

    .on('addList', (queue, playlist) => {
      try {
        const embed = createEmbed('music', client)
          .setTitle('🎀 Playlist Added')
          .setDescription(`Added **${playlist.songs.length}** tracks from **${playlist.name}** to the queue ✨.`)
          .addFields({ name: '🧸 Requester', value: playlist.user.tag });
        queue.textChannel?.send({ embeds: [embed] }).catch(err => {
          MusicLogger.logError('addList - send', err);
        });
      } catch (error) {
        MusicLogger.logError('addList', error);
      }
    })

    .on('error', (error, queue, song) => {
      const errorType = MusicLogger.categorizeError(error);
      const userMessage = MusicLogger.getErrorMessage(errorType);
      
      MusicLogger.logError('distube_error', error, {
        errorType,
        track: song?.name || 'Unknown',
        guildId: queue?.voiceChannel?.guild?.id
      });

      const channel = queue?.textChannel;
      if (channel && typeof channel.send === 'function') {
        const errorEmbed = createEmbed('error', client)
          .setTitle('🥺 Music Error')
          .setDescription(`${userMessage}\n\n**Technical:** ${error?.message?.slice(0, 100) || 'Unknown error'}`);

        channel.send({ embeds: [errorEmbed] }).catch(err => {
          console.error('Failed to send error message:', err?.message);
        });

        // Send follow-up attempt
        if (errorType === MusicLogger.ERROR_TYPES.NETWORK) {
          setTimeout(() => {
            channel.send({ content: '🔄 Retrying stream...' }).catch(() => {});
          }, 2000);
        }
      }

      MusicLogger.logMusicActivity(queue?.voiceChannel?.guild?.id, 'error', song, { message: error?.message });
    })

    .on('empty', queue => {
      try {
        queue.textChannel?.send({
          embeds: [createEmbed('music', client)
            .setTitle('🎀 Voice Channel Empty')
            .setDescription('Everyone left, so I\'m stopping the music. Bye bye! ~ 🦋')]
        }).catch(err => {
          MusicLogger.logError('empty - send', err);
        });
        MusicLogger.logMusicActivity(queue.voiceChannel?.guild?.id, 'stop', {});
      } catch (error) {
        MusicLogger.logError('empty', error);
      }
    })

    .on('finish', queue => {
      try {
        queue.textChannel?.send({
          embeds: [createEmbed('music', client)
            .setTitle('🎀 Queue Finished')
            .setDescription('All songs have been played! ✨')]
        }).catch(err => {
          MusicLogger.logError('finish - send', err);
        });
      } catch (error) {
        MusicLogger.logError('finish', error);
      }
    });
}

module.exports = {
  handleDistubeEvents
};
