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
      connection: null,
      audioPlayer: null,
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

// Remove song from queue
function removeSongFromQueue(guildId, index) {
  const queue = getQueue(guildId);
  if (index >= 0 && index < queue.songs.length) {
    return queue.songs.splice(index, 1)[0];
  }
  return null;
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
  return queue;
}

// Set volume (0.1 to 2)
function setVolume(guildId, volume) {
  const queue = getQueue(guildId);
  queue.volume = Math.max(0.1, Math.min(2, volume));
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

// Get queue length
function getQueueLength(guildId) {
  const queue = getQueue(guildId);
  return queue.songs.length;
}

// Get current song
function getCurrentSong(guildId) {
  const queue = getQueue(guildId);
  return queue.currentSong;
}

// Set current song
function setCurrentSong(guildId, song) {
  const queue = getQueue(guildId);
  queue.currentSong = song;
  return queue;
}

// Set connection
function setConnection(guildId, connection) {
  const queue = getQueue(guildId);
  queue.connection = connection;
  return queue;
}

// Get connection
function getConnection(guildId) {
  const queue = getQueue(guildId);
  return queue.connection;
}

// Delete queue
function deleteQueue(guildId) {
  queues.delete(guildId);
}

module.exports = {
  getQueue,
  addSongToQueue,
  removeSongFromQueue,
  getNextSong,
  clearQueue,
  setVolume,
  toggleRepeat,
  getQueueLength,
  getCurrentSong,
  setCurrentSong,
  setConnection,
  getConnection,
  deleteQueue,
};
