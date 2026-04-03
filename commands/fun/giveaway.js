const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedBuilder');
const { parseDuration } = require('../../utils/duration');
const { createGiveaway, getGiveawayByMessageId, addParticipant, endGiveaway } = require('../../models/Giveaway');

module.exports = {
  name: 'giveaway',
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('🎁 Create and manage giveaways')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Start a new giveaway')
        .addStringOption(option =>
          option
            .setName('prize')
            .setDescription('What are you giving away?')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('winners')
            .setDescription('Number of winners')
            .setMinValue(1)
            .setMaxValue(10)
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('duration')
            .setDescription('Duration (e.g., 1h, 30m, 2d)')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('end')
        .setDescription('End an active giveaway early')
        .addStringOption(option =>
          option
            .setName('message_id')
            .setDescription('Message ID of the giveaway')
            .setRequired(true)
        )
    ),
  execute: async (interaction, client) => {
    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'start') {
        await handleGiveawayStart(interaction, client);
      } else if (subcommand === 'end') {
        await handleGiveawayEnd(interaction, client);
      }
    } catch (error) {
      console.error('Giveaway error:', error);
      const errorEmbed = createEmbed('error', client)
        .setTitle('❌ Giveaway Error')
        .setDescription('Something went wrong with the giveaway.');

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};

async function handleGiveawayStart(interaction, client) {
  const prize = interaction.options.getString('prize');
  const winnerCount = interaction.options.getInteger('winners');
  const durationStr = interaction.options.getString('duration');

  // Parse duration
  const durationMs = parseDuration(durationStr);
  if (!durationMs) {
    const errorEmbed = createEmbed('error', client)
      .setTitle('❌ Invalid Duration')
      .setDescription('Use formats like: 1h, 30m, 2d, 1w');

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    return;
  }

  const endTime = new Date(Date.now() + durationMs);
  const timeString = `<t:${Math.floor(endTime.getTime() / 1000)}:R>`;

  // Create giveaway embed
  const giveawayEmbed = createEmbed('success', client)
    .setTitle('🎁 GIVEAWAY')
    .setDescription(`**Prize:** ${prize}`)
    .addFields(
      { name: '👥 Winners', value: `${winnerCount}`, inline: true },
      { name: '⏰ Ends', value: timeString, inline: true },
      { name: '🎫 Participants', value: '0', inline: true },
      { name: '📝 How to Enter', value: 'React with 🎉 to enter!' }
    )
    .setFooter({ text: `Hosted by ${interaction.user.username}` });

  // Send giveaway message
  const giveawayMsg = await interaction.channel.send({ embeds: [giveawayEmbed] });

  // Add reaction
  await giveawayMsg.react('🎉');

  // Create database entry
  await createGiveaway(
    interaction.guildId,
    interaction.channelId,
    giveawayMsg.id,
    interaction.user.id,
    prize,
    winnerCount,
    endTime
  );

  // Schedule auto-end
  scheduleGiveawayEnd(client, interaction.guildId, interaction.channelId, giveawayMsg.id, durationMs);

  // Confirm
  const confirmEmbed = createEmbed('success', client)
    .setTitle('✓ Giveaway Created')
    .setDescription(`Giveaway for **${prize}** has been started!`)
    .addFields(
      { name: 'Message Link', value: `[Jump to giveaway](${giveawayMsg.url})` }
    );

  await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
}

async function handleGiveawayEnd(interaction, client) {
  const messageId = interaction.options.getString('message_id');
  const giveaway = await getGiveawayByMessageId(messageId);

  if (!giveaway) {
    const errorEmbed = createEmbed('error', client)
      .setTitle('❌ Giveaway Not Found')
      .setDescription('Could not find a giveaway with that message ID.');

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    return;
  }

  if (giveaway.ended) {
    const errorEmbed = createEmbed('error', client)
      .setTitle('❌ Already Ended')
      .setDescription('This giveaway has already ended.');

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    return;
  }

  // End the giveaway
  await finishGiveaway(client, giveaway);

  const confirmEmbed = createEmbed('success', client)
    .setTitle('✓ Giveaway Ended')
    .setDescription('Winners have been selected and announced!');

  await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
}

// Schedule giveaway end
function scheduleGiveawayEnd(client, guildId, channelId, messageId, durationMs) {
  setTimeout(async () => {
    try {
      const giveaway = await getGiveawayByMessageId(messageId);
      if (giveaway && !giveaway.ended) {
        const channel = await client.channels.fetch(channelId);
        const message = await channel.messages.fetch(messageId);
        const guildObj = await client.guilds.fetch(guildId);
        
        finishGiveaway(client, giveaway, guildObj);
      }
    } catch (error) {
      console.error('Error ending giveaway:', error);
    }
  }, durationMs);
}

// Finish giveaway and select winners
async function finishGiveaway(client, giveaway, guildObj) {
  try {
    // Get the message and channel
    const channel = await client.channels.fetch(giveaway.channel_id);
    const message = await channel.messages.fetch(giveaway.message_id);

    // Get reactions
    const reaction = message.reactions.cache.get('🎉');
    const reactionUsers = await reaction?.users.fetch();
    const participants = reactionUsers
      ?.filter(user => !user.bot)
      .map(u => u.id) || [];

    // Select winners
    let winners = [];
    if (participants.length > 0) {
      const winnerCount = Math.min(giveaway.winners_count, participants.length);
      for (let i = 0; i < winnerCount; i++) {
        const randomIdx = Math.floor(Math.random() * participants.length);
        winners.push(participants[randomIdx]);
        participants.splice(randomIdx, 1);
      }
    }

    // End giveaway in database
    await endGiveaway(giveaway.message_id, winners);

    // Create result embed
    const resultEmbed = new EmbedBuilder()
      .setColor(0xFF69B4)
      .setTitle('🎉 Giveaway Ended!')
      .setDescription(`Prize: **${giveaway.prize}**`)
      .addFields(
        { name: '👥 Participants', value: `${reactionUsers?.size || 0}` },
        { name: '🏆 Winner(s)', value: winners.length > 0 ? winners.map(id => `<@${id}>`).join('\n') : 'No valid participants' }
      )
      .setTimestamp();

    // Update original message
    await message.edit({ embeds: [resultEmbed] });

    // DM winners
    for (const winnerId of winners) {
      try {
        const user = await client.users.fetch(winnerId);
        const dmEmbed = new EmbedBuilder()
          .setColor(0xFF69B4)
          .setTitle('🎉 You Won a Giveaway!')
          .setDescription(`Congratulations! You won: **${giveaway.prize}**`)
          .setTimestamp();

        await user.send({ embeds: [dmEmbed] });
      } catch (e) {
        console.log('Could not DM winner');
      }
    }
  } catch (error) {
    console.error('Error finishing giveaway:', error);
  }
}
