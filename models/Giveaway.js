const { supabase } = require('../utils/supabase');

// Create a new giveaway
async function createGiveaway(guildId, channelId, messageId, userId, prize, winners, endTime) {
  const { data, error } = await supabase
    .from('giveaways')
    .insert([
      {
        guild_id: guildId,
        channel_id: channelId,
        message_id: messageId,
        user_id: userId,
        prize,
        winners_count: winners,
        end_time: endTime.toISOString(),
        ended: false,
        participants: [],
        winners_list: [],
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get active giveaways
async function getActiveGiveaways(guildId) {
  const { data, error } = await supabase
    .from('giveaways')
    .select('*')
    .eq('guild_id', guildId)
    .eq('ended', false)
    .order('end_time', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Get giveaway by message ID
async function getGiveawayByMessageId(messageId) {
  const { data, error } = await supabase
    .from('giveaways')
    .select('*')
    .eq('message_id', messageId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

// Add participant to giveaway
async function addParticipant(messageId, userId) {
  const giveaway = await getGiveawayByMessageId(messageId);
  if (!giveaway) return null;

  const participants = giveaway.participants || [];
  if (!participants.includes(userId)) {
    participants.push(userId);
  }

  const { data, error } = await supabase
    .from('giveaways')
    .update({ participants })
    .eq('message_id', messageId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// End giveaway and select winners
async function endGiveaway(messageId, winnerIds) {
  const { data, error } = await supabase
    .from('giveaways')
    .update({
      ended: true,
      winners_list: winnerIds,
    })
    .eq('message_id', messageId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  createGiveaway,
  getActiveGiveaways,
  getGiveawayByMessageId,
  addParticipant,
  endGiveaway,
};