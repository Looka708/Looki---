const { SlashCommandBuilder, PermissionFlagsBits, Routes } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { loadCommandData } = require('../../utils/commandRegistry');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Refresh all bot slash commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        embeds: [
          createEmbed('error', interaction.client)
            .setTitle('Permission Denied')
            .setDescription('You need Administrator permission to use this command.'),
        ],
        flags: 64,
      });
    }

    await interaction.deferReply({ flags: 64 });

    try {
      const commandData = loadCommandData({ fresh: true }).map(command => command.data.toJSON());

      const guilds = await interaction.client.guilds.fetch();
      for (const guildId of guilds.keys()) {
        await interaction.client.rest.put(
          Routes.applicationGuildCommands(interaction.client.user.id, guildId),
          { body: [] },
        );
      }

      await interaction.client.application.commands.set([]);
      const registered = await interaction.client.application.commands.set(commandData);

      return interaction.editReply({
        embeds: [
          createEmbed('success', interaction.client)
            .setTitle('Commands Refreshed')
            .setDescription(
              `Removed commands from every scope and published **${registered.size}** global commands.\n\nDiscord may take a little time to refresh them in every server.`,
            ),
        ],
      });
    } catch (error) {
      console.error('[Sync] Failed to refresh commands:', error);

      return interaction.editReply({
        embeds: [
          createEmbed('error', interaction.client)
            .setTitle('Sync Failed')
            .setDescription('I could not refresh the slash commands. Check the bot logs for the Discord API error.'),
        ],
      });
    }
  },
};
