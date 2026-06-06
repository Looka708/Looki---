const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { loadCommandData } = require('../../utils/commandRegistry');

module.exports = {
  name: 'sync',
  data: new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Refresh every slash command')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        embeds: [createEmbed('error', client)
          .setImage(null)
          .setTitle('Permission denied')
          .setDescription('You need the **Administrator** permission to refresh commands.')],
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const commandModules = loadCommandData({ fresh: true });
      const commandData = commandModules.map(command => command.data.toJSON());
      const targetGuildId = process.env.GUILD_ID || interaction.guildId;
      const targetGuild = targetGuildId
        ? client.guilds.cache.get(targetGuildId) || await client.guilds.fetch(targetGuildId)
        : null;

      await client.application.commands.set([]);
      for (const guild of client.guilds.cache.values()) {
        await guild.commands.set([]);
      }

      const registered = targetGuild
        ? await targetGuild.commands.set(commandData)
        : await client.application.commands.set(commandData);

      client.commands.clear();
      client.prefixCommands.clear();
      for (const command of commandModules) {
        const name = command.name || command.data.name;
        client.commands.set(name, command);
        client.prefixCommands.set(name, command);
        for (const alias of command.aliases || []) client.prefixCommands.set(alias, command);
      }

      const scope = targetGuild ? `server **${targetGuild.name}**` : '**global commands**';
      await interaction.editReply({
        embeds: [createEmbed('success', client)
          .setImage(null)
          .setTitle('Commands refreshed')
          .setDescription(`Removed old registrations and added **${registered.size}** commands to ${scope}.`)
          .addFields(
            { name: 'Removed', value: 'Global and server commands', inline: true },
            { name: 'Published', value: `${registered.size} commands`, inline: true },
          )],
      });
    } catch (error) {
      console.error('Sync command error:', error);
      await interaction.editReply({
        embeds: [createEmbed('error', client)
          .setImage(null)
          .setTitle('Command refresh failed')
          .setDescription(`Discord rejected the refresh:\n\`${error.message}\``)],
      });
    }
  },
};
