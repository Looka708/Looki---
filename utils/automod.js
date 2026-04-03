// Profanity list - add more words as needed
const PROFANITY_LIST = [
  'bad', 'shit', 'damn', 'crap', 'hell',
  'ass', 'bastard', 'bitch', 'fuck', 'cunt',
  'dick', 'pussy', 'whore', 'slut', 'nigga',
  // Add more words as needed
];

// Spam tracking per guild+channel+user
const spamTracker = new Map();

// Check for profanity
function hasProfanity(content, enabled = true) {
  if (!enabled) return false;

  const lowerContent = content.toLowerCase();
  for (const word of PROFANITY_LIST) {
    if (lowerContent.includes(word)) {
      return true;
    }
  }
  return false;
}

// Check for spam
function checkSpam(guildId, userId, channelId, threshold = 5) {
  const key = `${guildId}-${channelId}-${userId}`;
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  if (!spamTracker.has(key)) {
    spamTracker.set(key, [now]);
    return { isSpam: false, count: 1 };
  }

  const messages = spamTracker.get(key);
  const recentMessages = messages.filter(time => time > oneMinuteAgo);
  recentMessages.push(now);
  spamTracker.set(key, recentMessages);

  return {
    isSpam: recentMessages.length > threshold,
    count: recentMessages.length,
  };
}

// Check for raid (multiple users joining quickly)
function checkRaid(guildId, userCount = 5, timeWindow = 60000) {
  const key = `raid-${guildId}`;
  const now = Date.now();

  if (!spamTracker.has(key)) {
    spamTracker.set(key, [now]);
    return { isRaid: false, count: 1 };
  }

  const joinTimes = spamTracker.get(key);
  const recentJoins = joinTimes.filter(time => time > now - timeWindow);
  recentJoins.push(now);
  spamTracker.set(key, recentJoins);

  return {
    isRaid: recentJoins.length >= userCount,
    count: recentJoins.length,
  };
}

// Filter profanity (replace with asterisks)
function filterProfanity(content) {
  let filtered = content;
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  }
  return filtered;
}

// Check for suspicious links
function hasSuspiciousLinks(content) {
  const urlRegex = /(https?:\/\/|www\.)[^\s]+/gi;
  const urls = content.match(urlRegex) || [];

  // Blacklist dangerous or short URL domains
  const suspiciousDomains = [
    'bit.ly', 'tinyurl.com', 'short.link', 'discord.gg',
  ];

  for (const url of urls) {
    for (const domain of suspiciousDomains) {
      if (url.includes(domain)) {
        return true;
      }
    }
  }

  return false;
}

// Check for mass mentions
function hasMassMentions(message) {
  const mentionCount = (message.mentions?.users?.size || 0) + (message.mentions?.roles?.size || 0);
  return mentionCount > 5; // More than 5 mentions is suspicious
}

// Clean up old spam tracking data (every 10 events)
function cleanupSpamTracker() {
  if (Math.random() < 0.1) {
    const now = Date.now();
    for (const [key, times] of spamTracker.entries()) {
      const recentTimes = times.filter(time => time > now - 300000); // Keep last 5 minutes
      if (recentTimes.length === 0) {
        spamTracker.delete(key);
      } else {
        spamTracker.set(key, recentTimes);
      }
    }
  }
}

module.exports = {
  hasProfanity,
  checkSpam,
  checkRaid,
  filterProfanity,
  hasSuspiciousLinks,
  hasMassMentions,
  cleanupSpamTracker,
  PROFANITY_LIST,
};
