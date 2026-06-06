const { createEmbed } = require('./embedBuilder');

function formatDuration(milliseconds = 0) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return '0:00';
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function progressBar(position = 0, duration = 0, size = 14) {
  if (!duration || duration <= 0) return 'LIVE';
  const ratio = Math.min(Math.max(position / duration, 0), 1);
  const marker = Math.min(Math.round(ratio * (size - 1)), size - 1);
  return Array.from({ length: size }, (_, index) => index === marker ? '●' : '━').join('');
}

function requesterName(track) {
  return track?.requester?.displayName
    || track?.requester?.globalName
    || track?.requester?.tag
    || track?.requester?.username
    || 'Unknown';
}

function createMusicEmbed(client, options = {}) {
  const embed = createEmbed(options.type === 'error' ? 'error' : 'music', client)
    .setColor(options.type === 'error' ? 0xED6A8A : 0xB86BFF)
    .setImage(null)
    .setAuthor({
      name: options.type === 'error'
        ? 'Looki Music • Something went wrong'
        : 'Looki Music • Your listening session',
      iconURL: client.user.displayAvatarURL(),
    })
    .setFooter({
      text: options.footer || 'Looki Music • /queue to see what is next',
      iconURL: client.user.displayAvatarURL(),
    });

  if (options.title) embed.setTitle(options.title);
  if (options.description) embed.setDescription(options.description);
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  return embed;
}

function createTrackEmbed(client, track, player, title = 'Now Playing') {
  const position = player?.position || 0;
  const duration = track?.length || 0;
  const link = track?.uri
    ? `[${track.title}](${track.uri})`
    : `**${track?.title || 'Unknown track'}**`;

  return createMusicEmbed(client, {
    title: `🎵 ${title}`,
    description: `${link}\n\n${progressBar(position, duration)}\n\`${formatDuration(position)} / ${formatDuration(duration)}\``,
    thumbnail: track?.thumbnail,
    footer: `Volume ${player?.volume ?? 100}% • Loop ${String(player?.loop || 'off').toUpperCase()}`,
  }).addFields(
    { name: 'Artist', value: track?.author || 'Unknown', inline: true },
    { name: 'Requested by', value: requesterName(track), inline: true },
    { name: 'Up next', value: `${player?.queue?.length || 0} track(s)`, inline: true },
  );
}

module.exports = { createMusicEmbed, createTrackEmbed, formatDuration, progressBar, requesterName };
