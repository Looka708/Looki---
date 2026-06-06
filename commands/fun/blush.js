const { createReactionCommand } = require('../../utils/reactionCommand');

module.exports = createReactionCommand({
  name: 'blush',
  title: '😊 Blushing',
  description: 'Share a shy blush',
  message: user => `**${user.username}** is blushing. How cute!`,
});
