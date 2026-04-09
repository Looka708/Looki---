const { Shoukaku, Connectors } = require('shoukaku');

const nodes = [
  {
    name: 'Kasper',
    url: process.env.LAVALINK_KASPER_URL || 'lava.link:80',
    auth: process.env.LAVALINK_KASPER_PWD || 'youshallnotpass',
    secure: process.env.LAVALINK_KASPER_SECURE === 'true'
  },
  {
    name: 'Lexis',
    url: process.env.LAVALINK_LEXIS_URL || 'lavalink.lexis.host:443',
    auth: process.env.LAVALINK_LEXIS_PWD || 'lexisnodenew',
    secure: true
  },
  {
    name: 'Jirayu',
    url: process.env.LAVALINK_JIRAYU_URL || 'lavalink.jirayu.net:13592',
    auth: process.env.LAVALINK_JIRAYU_PWD || 'youshallnotpass',
    secure: false
  }
];

function initializeShoukaku(client) {
  const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), nodes, {
    resume: true,
    resumeTimeout: 60,
    resumeByLibrary: true,
    reconnectTries: 10,
    reconnectInterval: 5,
    moveOnDisconnect: true
  });

  shoukaku.on('ready', (name) => console.log(`🌸 [Lavalink] Node "${name}" is ready!`));
  shoukaku.on('error', (name, error) => console.error(`❌ [Lavalink] Node "${name}" error:`, error));
  shoukaku.on('close', (name, code, reason) => console.warn(`⚠️ [Lavalink] Node "${name}" closed. Code: ${code}, Reason: ${reason}`));
  shoukaku.on('disconnect', (name, players, moved) => console.warn(`⚠️ [Lavalink] Node "${name}" disconnected. Players moved: ${moved}`));

  client.shoukaku = shoukaku;
  return shoukaku;
}

module.exports = { initializeShoukaku };
