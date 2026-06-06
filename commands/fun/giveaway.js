const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { parseDuration } = require('../../utils/duration');
const { createGiveaway, getGiveawayByMessageId, endGiveaway } = require('../../models/Giveaway');

const ENTRY_EMOJI = '\uD83C\uDF89';

module.exports = {
  name: 'giveaway',
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Create and manage giveaways')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand(subcommand => subcommand
      .setName('start')
      .setDescription('Start a new giveaway')
      .addStringOption(option => option
        .setName('prize')
        .setDescription('What are you giving away?')
        .setMaxLength(200)
        .setRequired(true))
      .addIntegerOption(option => option
        .setName('winners')
        .setDescription('Number of winners')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(true))
      .addStringOption(option => option
        .setName('duration')
        .setDescription('Duration, like 1h, 30m, or 2d')
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('end')
      .setDescription('End an active giveaway early')
      .addStringOption(option => option
        .setName('message_id')
        .setDescription('Message ID of the giveaway')
        .setRequired(true))),

  async execute(interaction, client) {
    await interaction.deferReply({ flags: 64 });

    try {
      const subcommand = interaction.options.getSubcommand();
      if (subcommand === 'start') return handleGiveawayStart(interaction, client);
      return handleGiveawayEnd(interaction, client);
    } catch (error) {
      console.error('Giveaway command error:', error);
      return interaction.editReply({
        embeds: [createEmbed('error', client)
          .setTitle('Giveaway Failed')
          .setDescription('Something went wrong with the giveaway.')],
      });
    }
  },
};

async function handleGiveawayStart(interaction, client) {
  const prize = interaction.options.getString('prize', true).trim();
  const winnerCount = interaction.options.getInteger('winners', true);
  const durationStr = interaction.options.getString('duration', true);
  const durationMs = parseDuration(durationStr);

  if (!durationMs) {
    return interaction.editReply({
      embeds: [createEmbed('error', client)
        .setTitle('Invalid Duration')
        .setDescription('Use formats like `1h`, `30m`, `2d`, or `1w`.')],
    });
  }

  const endTime = new Date(Date.now() + durationMs);
  const endTimestamp = Math.floor(endTime.getTime() / 1000);

  const giveawayEmbed = createEmbed('success', client)
    .setTitle('Giveaway')
    .setDescription(`**Prize:** ${prize}`)
    .addFields(
      { name: 'Winners', value: `${winnerCount}`, inline: true },
      { name: 'Ends', value: `<t:${endTimestamp}:R>`, inline: true },
      { name: 'Participants', value: '0', inline: true },
      { name: 'How to Enter', value: `React with ${ENTRY_EMOJI} to enter.` },
    )
    .setFooter({ text: `Hosted by ${interaction.user.username}` });

  const giveawayMsg = await interaction.channel.send({ embeds: [giveawayEmbed] });
  await giveawayMsg.react(ENTRY_EMOJI);

  await createGiveaway(
    interaction.guildId,
    interaction.channelId,
    giveawayMsg.id,
    interaction.user.id,
    prize,
    winnerCount,
    endTime,
  );

  scheduleGiveawayEnd(client, giveawayMsg.id, durationMs);

  return interaction.editReply({
    embeds: [createEmbed('success', client)
      .setTitle('Giveaway Created')
      .setDescription(`Giveaway for **${prize}** has been started.`)
      .addFields({ name: 'Message Link', value: `[Jump to giveaway](${giveawayMsg.url})` })],
  });
}

async function handleGiveawayEnd(interaction, client) {
  const messageId = interaction.options.getString('message_id', true);
  const giveaway = await getGiveawayByMessageId(messageId);

  if (!giveaway) {
    return interaction.editReply({
      embeds: [createEmbed('error', client)
        .setTitle('Giveaway Not Found')
        .setDescription('Could not find a giveaway with that message ID.')],
    });
  }

  if (giveaway.ended) {
    return interaction.editReply({
      embeds: [createEmbed('error', client)
        .setTitle('Already Ended')
        .setDescription('This giveaway has already ended.')],
    });
  }

  await finishGiveaway(client, giveaway);

  return interaction.editReply({
    embeds: [createEmbed('success', client)
      .setTitle('Giveaway Ended')
      .setDescription('Winners have been selected and announced.')],
  });
}

function scheduleGiveawayEnd(client, messageId, durationMs) {
  setTimeout(async () => {
    try {
      const giveaway = await getGiveawayByMessageId(messageId);
      if (giveaway && !giveaway.ended) await finishGiveaway(client, giveaway);
    } catch (error) {
      console.error('Error ending giveaway:', error);
    }
  }, durationMs);
}

async function finishGiveaway(client, giveaway) {
  try {
    const channel = await client.channels.fetch(giveaway.channel_id);
    const message = await channel.messages.fetch(giveaway.message_id);
    const reaction = message.reactions.cache.get(ENTRY_EMOJI);
    const reactionUsers = await reaction?.users.fetch();
    const participants = reactionUsers
      ?.filter(user => !user.bot)
      .map(user => user.id) || [];

    const winners = [];
    while (winners.length < giveaway.winners_count && participants.length > 0) {
      const index = Math.floor(Math.random() * participants.length);
      winners.push(participants.splice(index, 1)[0]);
    }

    await endGiveaway(giveaway.message_id, winners);

    const resultEmbed = createEmbed('success', client)
      .setTitle('Giveaway Ended')
      .setDescription(`Prize: **${giveaway.prize}**`)
      .addFields(
        { name: 'Participants', value: `${reactionUsers?.filter(user => !user.bot).size || 0}` },
        { name: 'Winner(s)', value: winners.length ? winners.map(id => `<@${id}>`).join('\n') : 'No valid participants' },
      );

    await message.edit({ embeds: [resultEmbed] });

    for (const winnerId of winners) {
      const user = await client.users.fetch(winnerId).catch(() => null);
      await user?.send({
        embeds: [createEmbed('success', client)
          .setTitle('You Won a Giveaway')
          .setDescription(`Congratulations! You won: **${giveaway.prize}**`)],
      }).catch(() => null);
    }
  } catch (error) {
    console.error('Error finishing giveaway:', error);
  }
}
