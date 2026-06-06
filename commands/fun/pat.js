const { createReactionCommand } = require('../../utils/reactionCommand');

module.exports = createReactionCommand({
  name: 'pat',
  title: 'Headpat',
  description: 'Give someone a gentle headpat',
  targeted: true,
  targetDescription: 'Person to pat',
  selfMessage: 'You deserve a headpat too. Good job today!',
  message: (user, target) => `**${user.username}** gently pats **${target.username}**.`,
});
