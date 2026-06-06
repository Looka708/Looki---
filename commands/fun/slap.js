const { createReactionCommand } = require('../../utils/reactionCommand');

module.exports = createReactionCommand({
  name: 'slap',
  title: 'Playful Slap',
  description: 'Give someone a playful slap',
  targeted: true,
  targetDescription: 'Person to slap',
  selfMessage: 'No self-slapping today.',
  botMessage: 'Nice try, but I am keeping my dignity.',
  message: (user, target) => `**${user.username}** playfully slaps **${target.username}**!`,
});
