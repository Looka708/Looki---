const { Collection } = require('discord.js');

// Guild queue storage
const queues = new Collection();

// Get or create queue for guild
function getQueue(guildId) {
  if (!queues.has(guildId)) {
    queues.set(guildId, {
      songs: [],
      previousSongs: [], // For previous button
      currentSong: null,
      volume: 100, // Default to max for Lavalink
      isPlaying: false,
      isPaused: false,
      player: null, // Shoukaku Player
      repeat: 'off', // off, one, all
      isShuffled: false,
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

  // If repeat one, return current song but don't add to previousSongs again
  if (queue.repeat === 'one' && queue.currentSong) {
    return queue.currentSong;
  }

  // Save current song to previous songs before moving to next
  if (queue.currentSong) {
    queue.previousSongs.unshift(queue.currentSong);
    if (queue.previousSongs.length > 50) queue.previousSongs.pop();
  }

  if (queue.songs.length === 0) {
    if (queue.repeat === 'all' && queue.currentSong) {
      // In a real 'all' loop, you might want to re-fill queue from previousSongs
      // But for now, let's keep it simple
      return null;
    }
    return null;
  }

  const nextSong = queue.songs.shift();
  return nextSong;
}

// Get previous song
function getPreviousSong(guildId) {
  const queue = getQueue(guildId);
  if (queue.previousSongs.length === 0) return null;

  // If we have a current song, put it back to the head of the queue
  if (queue.currentSong) {
    queue.songs.unshift(queue.currentSong);
    // Remove it from currentSong since we're unshifting it
    queue.currentSong = null; 
  }

  // Get the actual previous song and put it at the very front
  const prevSong = queue.previousSongs.shift();
  queue.songs.unshift(prevSong);
  
  return prevSong;
}

// Shuffle queue
function shuffleQueue(guildId) {
  const queue = getQueue(guildId);
  if (queue.songs.length < 2) return false;

  for (let i = queue.songs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
  }
  queue.isShuffled = !queue.isShuffled;
  return true;
}

// Clear queue
function clearQueue(guildId) {
  const queue = getQueue(guildId);
  queue.songs = [];
  queue.previousSongs = [];
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
async function deleteQueue(guildId, client) {
  const queue = queues.get(guildId);
  if (queue && queue.player) {
    if (client && client.shoukaku) {
      await client.shoukaku.leaveVoiceChannel(guildId);
    } else {
      queue.player.stopTrack();
    }
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
  getPreviousSong,
  shuffleQueue,
  clearQueue,
  setVolume,
  toggleRepeat,
  deleteQueue,
  setPlaying,
};
