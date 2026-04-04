const { Collection } = require('discord.js');

// Guild queue storage
const queues = new Collection();

// Get or create queue for guild
function getQueue(guildId) {
  if (!queues.has(guildId)) {
    queues.set(guildId, {
      songs: [],
      currentSong: null,
      volume: 1,
      isPlaying: false,
      player: null, // Shoukaku Player
      repeat: 'off', // off, one, all
    });
  }
  return queues.get(guildId);
}

// Add song to queue
function addSongToQueue(guildId, song) {
  const queue = getQueue(guildId);
  queue.songs.push(song);
  return queue;
}

// Get next song
function getNextSong(guildId) {
  const queue = getQueue(guildId);

  if (queue.repeat === 'one' && queue.currentSong) {
    return queue.currentSong;
  }

  if (queue.songs.length === 0) {
    if (queue.repeat === 'all' && queue.currentSong) {
      return queue.currentSong;
    }
    return null;
  }

  const nextSong = queue.songs.shift();
  return nextSong;
}

// Clear queue
function clearQueue(guildId) {
  const queue = getQueue(guildId);
  queue.songs = [];
  queue.currentSong = null;
  queue.isPlaying = false;
  if (queue.player) {
    queue.player.stopTrack();
  }
  return queue;
}

// Set volume (0 to 100 for Lavalink)
function setVolume(guildId, volume) {
  const queue = getQueue(guildId);
  queue.volume = Math.max(0, Math.min(100, volume));
  if (queue.player) {
    queue.player.setGlobalVolume(queue.volume);
  }
  return queue.volume;
}

// Toggle repeat mode
function toggleRepeat(guildId) {
  const queue = getQueue(guildId);
  const modes = ['off', 'one', 'all'];
  const currentIndex = modes.indexOf(queue.repeat);
  queue.repeat = modes[(currentIndex + 1) % modes.length];
  return queue.repeat;
}

// Delete queue
function deleteQueue(guildId) {
  const queue = queues.get(guildId);
  if (queue && queue.player) {
    queue.player.destroy();
  }
  queues.delete(guildId);
}

// Set playing state
function setPlaying(guildId, isPlaying) {
  const queue = getQueue(guildId);
  queue.isPlaying = isPlaying;
  return queue;
}

module.exports = {
  getQueue,
  addSongToQueue,
  getNextSong,
  clearQueue,
  setVolume,
  toggleRepeat,
  deleteQueue,
  setPlaying,
};
