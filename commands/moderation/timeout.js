const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { parseDuration } = require('../../utils/duration');

module.exports = {
  name: 'timeout',
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('🕐 put someone in time-out (mute) 🎀')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('the user to timeout')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('duration (e.g. 10m, 1h, 1d)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('why are they in time-out?')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  execute: async (interaction, client) => {
    const targetUser = interaction.options.getUser('user');
    const durationInput = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'no reason provided luv 🌸';

    const durationMs = parseDuration(durationInput);
    if (!durationMs || durationMs < 1000 || durationMs > 28 * 24 * 60 * 60 * 1000) {
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ invalid duration')
        .setDescription('duration must be between 1s and 28d 🎀. try `10m` or `1h`!');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!member) {
      const errorEmbed = createEmbed('error', client)
        .setDescription('i couldn\'t find that user in the server :(');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (member.id === interaction.user.id) {
       return interaction.reply({ content: "you can't mute yourself bestie! 🌸", ephemeral: true });
    }

    if (!member.moderatable) {
      const errorEmbed = createEmbed('error', client)
        .setDescription('i can\'t timeout that user! they might have a higher role than me ✨');
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      await member.timeout(durationMs, `${interaction.user.tag}: ${reason}`);

      const embed = createEmbed('moderation', client)
        .setTitle('🕐 time-out issued')
        .setDescription(`${targetUser} is now taking a little break ✨`)
        .addFields(
          { name: '🎀 Duration', value: `\`${durationInput}\``, inline: true },
          { name: '✦ Reason', value: reason, inline: true }
        )
        .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnhscXFqZWZqejVqZWZqejVqZWZqejVqZWZqejVqZWZqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/6rX85pTWUf9V6/giphy.gif');

      await interaction.reply({ embeds: [embed] });

      try {
        const dmEmbed = createEmbed('moderation', client)
          .setTitle('🕐 you\'ve been put in time-out')
          .setDescription(`you were muted in \`${interaction.guild.name}\` 🎀`)
          .addFields(
            { name: '⏱️ Duration', value: `\`${durationInput}\``, inline: true },
            { name: '✦ Reason', value: reason, inline: true }
          );
        await targetUser.send({ embeds: [dmEmbed] });
      } catch (e) {
        // they have dms blocked
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = createEmbed('error', client)
        .setDescription('hmm that didn\'t work :( try again?');
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
