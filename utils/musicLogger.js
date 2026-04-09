const { supabase } = require('./supabase');

class MusicLogger {
  static ERROR_TYPES = {
    NETWORK: 'network_error',
    CODEC: 'codec_error',
    PLAYBACK: 'playback_error',
    RATE_LIMIT: 'rate_limit',
    NOT_FOUND: 'not_found',
    PERMISSION: 'permission_denied',
    UNKNOWN: 'unknown_error',
  };

  static categorizeError(error) {
    const message = error?.message || error?.toString() || '';
    const errorCode = error?.code || '';

    if (message.includes('429') || errorCode === 'RATE_LIMITED') {
      return this.ERROR_TYPES.RATE_LIMIT;
    }
    if (message.includes('codec') || message.includes('INVALID_AUDIO')) {
      return this.ERROR_TYPES.CODEC;
    }
    if (message.includes('not found') || message.includes('404')) {
      return this.ERROR_TYPES.NOT_FOUND;
    }
    if (message.includes('permission') || message.includes('403')) {
      return this.ERROR_TYPES.PERMISSION;
    }
    if (message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT') || message.includes('network')) {
      return this.ERROR_TYPES.NETWORK;
    }
    if (
      message.includes('stream') ||
      message.includes('play') ||
      message.includes('buffer') ||
      message.includes('spawn')
    ) {
      return this.ERROR_TYPES.PLAYBACK;
    }

    return this.ERROR_TYPES.UNKNOWN;
  }

  static getErrorMessage(errorType) {
    const messages = {
      [this.ERROR_TYPES.NETWORK]: '🌐 Connection issue - trying again in a moment...',
      [this.ERROR_TYPES.CODEC]: '🎵 Audio codec error - might try a different source',
      [this.ERROR_TYPES.PLAYBACK]: '⚠️ Playback error - trying next song...',
      [this.ERROR_TYPES.RATE_LIMIT]: '⏳ Service is busy - waiting before retry...',
      [this.ERROR_TYPES.NOT_FOUND]: '🔍 Song not found - might be removed or private',
      [this.ERROR_TYPES.PERMISSION]: '🔒 Permission denied - service might be restricted',
      [this.ERROR_TYPES.UNKNOWN]: '❓ Something went wrong - check logs',
    };

    return messages[errorType] || messages[this.ERROR_TYPES.UNKNOWN];
  }

  static async logMusicActivity(guildId, action, songData = {}, errorData = null) {
    try {
      await supabase.from('music_activity_log').insert({
        guild_id: guildId,
        user_id: songData.user?.id || null,
        action,
        song_name: songData.name || null,
        error_message: errorData?.message || null,
      });
    } catch (error) {
      console.error('❌ [MusicLogger] Failed to log activity:', error?.message);
    }
  }

  static logError(context, error, additionalInfo = {}) {
    const errorType = this.categorizeError(error);
    const timestamp = new Date().toISOString();

    const logEntry = {
      timestamp,
      context,
      type: errorType,
      message: error?.message || error?.toString(),
      code: error?.code,
      stack: error?.stack?.split('\n')[0],
      ...additionalInfo,
    };

    console.error(`🥺 [Music Error - ${errorType}]`, logEntry);
    return logEntry;
  }

  static logSuccess(context, message, additionalInfo = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      context,
      message,
      ...additionalInfo,
    };

    console.log(`🌸 [Music Success]`, logEntry);
    return logEntry;
  }
}

module.exports = MusicLogger;
