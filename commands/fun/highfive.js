const { createReactionCommand } = require('../../utils/reactionCommand');

module.exports = createReactionCommand({
  name: 'highfive',
  title: '🙌 High five',
  description: 'Give someone a huge high five',
  targeted: true,
  targetDescription: 'Person to high-five',
  selfMessage: 'A self high-five still counts. 🙌',
  message: (user, target) => `**${user.username}** gives **${target.username}** a massive high five!`,
});
