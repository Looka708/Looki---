const { createReactionCommand } = require('../../utils/reactionCommand');

module.exports = createReactionCommand({
  name: 'kiss',
  title: '💋 Sweet kiss',
  description: 'Give someone a sweet kiss',
  targeted: true,
  targetDescription: 'Person to kiss',
  selfMessage: 'Pick someone else to send a kiss to.',
  message: (user, target) => `**${user.username}** gives **${target.username}** a sweet kiss!`,
});
