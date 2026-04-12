const { createEmbed, CATEGORY_GIFS } = require('./embedBuilder');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const MusicLogger = require('./musicLogger');
const UserFavorites = require('../models/UserFavorites');

function handleRiffyEvents(client) {
  client.riffy
    .on('nodeConnect', (node) => {
      console.log(`🌸 [Riffy] Node "${node.name}" connected!`);
    })
    .on('nodeError', (node, error) => {
      console.error(`🥺 [Riffy] Node "${node.name}" error:`, error.message);
    })
    .on('trackStart', async (player, track) => {
      try {
        const channel = client.channels.cache.get(player.textChannel);
        if (!channel) return;

        // In Riffy, user who requested is heavily attached manually or found via `player.queue`.
        // Let's assume `track.info.requester` is set if we pass it, otherwise fallback.
        const requesterTag = track.info.requester?.tag || 'Unknown User';

        // Format duration from ms
        const formattedDuration = track.info.length < 3600000 
            ? new Date(track.info.length).toISOString().substr(14, 5) 
            : new Date(track.info.length).toISOString().substr(11, 8);

        const playEmbed = createEmbed('music', client)
          .setAuthor({ 
            name: '🎀 Now Playing 🎀', 
            iconURL: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png' 
          })
          .setTitle(`${track.info.title}`)
          .setURL(track.info.uri)
          .setColor(0xFFB6C1)
          .addFields(
            { name: '🦋 Artist', value: `> **${track.info.author || 'Unknown'}**`, inline: true },
            { name: '💖 Duration', value: `> **${formattedDuration}**`, inline: true },
            { name: '🧸 Requested by', value: `> **${requesterTag}**`, inline: true }
          )
          .setImage(track.info.thumbnail || CATEGORY_GIFS?.music)
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

        const message = await channel.send({ embeds: [playEmbed], components: [row1, row2] }).catch(err => {
          MusicLogger.logError('trackStart - send', err, { guildId: player.guildId });
        });
        player.messageId = message?.id; // Optional: To delete later
        
        MusicLogger.logSuccess('trackStart', `Now playing ${track.info.title}`, { 
          guildId: player.guildId,
          requester: requesterTag 
        });

        MusicLogger.logMusicActivity(player.guildId, 'play', { name: track.info.title });
      } catch (error) {
        MusicLogger.logError('trackStart', error);
      }
    })
    .on('queueEnd', async (player) => {
      try {
        const channel = client.channels.cache.get(player.textChannel);
        if (channel) {
          channel.send({
            embeds: [createEmbed('music', client)
              .setTitle('🎀 Queue Finished')
              .setDescription('All songs have been played! ✨')]
          }).catch(err => MusicLogger.logError('queueEnd - send', err));
        }
        player.destroy(); // Properly cleanup player
      } catch (error) {
        MusicLogger.logError('queueEnd', error);
      }
    });
}

module.exports = {
  handleRiffyEvents
};
