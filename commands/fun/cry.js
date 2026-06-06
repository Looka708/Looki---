const { createReactionCommand } = require('../../utils/reactionCommand');

module.exports = createReactionCommand({
  name: 'cry',
  title: 'A Little Cry',
  description: 'Let out some tears',
  message: user => `**${user.username}** is having a little cry. Sending comfort.`,
});
