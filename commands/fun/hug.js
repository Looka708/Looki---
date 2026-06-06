const { createReactionCommand } = require('../../utils/reactionCommand');

module.exports = createReactionCommand({
  name: 'hug',
  title: 'Warm Hug',
  description: 'Give someone a warm hug',
  targeted: true,
  targetDescription: 'Person to hug',
  selfMessage: 'Here is a warm self-hug for you.',
  message: (user, target) => `**${user.username}** gives **${target.username}** a big hug!`,
});
