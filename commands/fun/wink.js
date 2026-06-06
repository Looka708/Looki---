const { createReactionCommand } = require('../../utils/reactionCommand');

module.exports = createReactionCommand({
  name: 'wink',
  title: '😉 Wink',
  description: 'Give everyone a playful wink',
  message: user => `**${user.username}** gives everyone a playful wink.`,
});
