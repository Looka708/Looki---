const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { parseDuration } = require('../../utils/duration');

module.exports = {
  name: 'slowmode',
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('🐢 set the channel slowmode')
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('duration (e.g. 5s, 1m, 2h) or 0 to disable')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('specific channel (defaults to current)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  execute: async (interaction, client) => {
    const durationInput = interaction.options.getString('duration');
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

    if (!targetChannel.isTextBased()) {
      return interaction.reply({ content: 'Slowmode can only be applied to text channels! 🌸', ephemeral: true });
    }

    let slowmodeSeconds = 0;
    
    if (durationInput !== '0' && durationInput.toLowerCase() !== 'off') {
        const durationMs = parseDuration(durationInput);
        slowmodeSeconds = Math.floor(durationMs / 1000);

        if (!slowmodeSeconds || slowmodeSeconds < 0 || slowmodeSeconds > 21600) {
          const errorEmbed = createEmbed('error', client)
            .setTitle('❌ invalid slowmode')
            .setDescription('slowmode must be between `1s` and `6h` 🎀');
          return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }

    try {
      await targetChannel.setRateLimitPerUser(slowmodeSeconds, `Set by ${interaction.user.tag}`);

      const embed = createEmbed('moderation', client)
        .setTitle('🐢 slowmode updated')
        .setDescription(slowmodeSeconds === 0 
          ? `slowmode is now **disabled** in ${targetChannel} ✨` 
          : `slowmode is now set to **${durationInput}** in ${targetChannel} ✨`);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = createEmbed('error', client)
        .setDescription('hmm that didn\'t work :( try again?');
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
