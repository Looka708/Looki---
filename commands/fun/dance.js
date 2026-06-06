const { createReactionCommand } = require('../../utils/reactionCommand');

module.exports = createReactionCommand({
  name: 'dance',
  title: 'Dance Time',
  description: 'Show off your best dance moves',
  message: user => `**${user.username}** is dancing!`,
});
