const { EmbedBuilder } = require('discord.js');
const { createEmbed } = require('./embedBuilder');

class MusicManager {
    constructor(client) {
        this.client = client;
        this.queues = new Map(); // guildId -> { textChannel, songs: [], player, loop: 0, volume: 50 }
    }

    async getOrCreateQueue(guildId, textChannel, player) {
        if (!this.queues.has(guildId)) {
            this.queues.set(guildId, {
                textChannel,
                songs: [],
                player,
                loop: 0, // 0: off, 1: song, 2: queue
                volume: 50
            });
        }
        return this.queues.get(guildId);
    }

    async play(guildId, song, interaction) {
        const queue = this.queues.get(guildId);
        queue.songs.push(song);

        if (queue.songs.length === 1) {
            await this.startPlayback(guildId);
        } else {
            const embed = createEmbed('music', this.client)
                .setTitle('💖 Added to Queue')
                .setDescription(`**[${song.title}](${song.uri})** ✨`)
                .setThumbnail(song.thumbnail);
            await interaction.editReply({ embeds: [embed] });
        }
    }

    async startPlayback(guildId) {
        const queue = this.queues.get(guildId);
        if (!queue || queue.songs.length === 0) return;

        const song = queue.songs[0];
        try {
            await queue.player.playTrack({ track: song.encoded });
            
            const playEmbed = createEmbed('music', this.client)
                .setAuthor({ name: '🎀 Now Playing 🎀' })
                .setTitle(`${song.title}`)
                .setURL(song.uri)
                .addFields(
                  { name: '🦋 Artist', value: `> **${song.author}**`, inline: true },
                  { name: '💖 Duration', value: `> **${this.formatDuration(song.length)}**`, inline: true }
                )
                .setImage(song.thumbnail);

            if (queue.textChannel) {
                await queue.textChannel.send({ embeds: [playEmbed] }).catch(() => {});
            }
        } catch (error) {
            console.error('Playback error:', error);
            if (queue.textChannel) queue.textChannel.send(`❌ Error playing **${song.title}**`);
            this.handleTrackEnd(guildId);
        }
    }

    handleTrackEnd(guildId) {
        const queue = this.queues.get(guildId);
        if (!queue) return;

        const song = queue.songs[0];
        
        if (queue.loop === 1) {
            // Track loop: Keep the same song at index 0
        } else if (queue.loop === 2) {
            // Queue loop: Move the ended song to the back
            queue.songs.shift();
            queue.songs.push(song);
        } else {
            // No loop: Just remove the song
            queue.songs.shift();
        }

        if (queue.songs.length > 0) {
            this.startPlayback(guildId);
        } else {
            this.queues.delete(guildId);
        }
    }

    skip(guildId) {
        const queue = this.queues.get(guildId);
        if (!queue) return;
        queue.player.stopTrack();
    }

    stop(guildId) {
        const queue = this.queues.get(guildId);
        if (!queue) return;
        queue.songs = [];
        queue.player.stopTrack();
        this.queues.delete(guildId);
    }

    formatDuration(ms) {
        if (!ms || isNaN(ms)) return '00:00';
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor(ms / (1000 * 60 * 60));
        return `${hours > 0 ? hours + ':' : ''}${minutes < 10 && hours > 0 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }
}

module.exports = MusicManager;
