-- Looki Bot Supabase Database Schema
-- Run these SQL commands in your Supabase SQL Editor to set up the database

-- Warnings Table
CREATE TABLE IF NOT EXISTS warnings (
  id BIGSERIAL PRIMARY KEY,
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  reason TEXT,
  moderator_id TEXT,
  case_id INTEGER,
  type TEXT CHECK (type IN ('warn', 'mute', 'kick', 'ban')) DEFAULT 'warn',
  duration_ms INTEGER,
  expired BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_warnings_guild_user ON warnings(guild_id, user_id);
CREATE INDEX IF NOT EXISTS idx_warnings_case_id ON warnings(case_id);
CREATE INDEX IF NOT EXISTS idx_warnings_type ON warnings(type);

-- XP Table
CREATE TABLE IF NOT EXISTS xp (
  id BIGSERIAL PRIMARY KEY,
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 0,
  last_xp_gain TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(guild_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_xp_guild_user ON xp(guild_id, user_id);
CREATE INDEX IF NOT EXISTS idx_xp_guild_xp ON xp(guild_id, xp DESC);

-- Server Config Table
CREATE TABLE IF NOT EXISTS server_config (
  id BIGSERIAL PRIMARY KEY,
  guild_id TEXT NOT NULL UNIQUE,
  prefix TEXT DEFAULT 'p!',
  modlog_channel TEXT,
  mute_role TEXT,
  autoroles TEXT[] DEFAULT ARRAY[]::TEXT[],
  reaction_roles JSONB DEFAULT '[]'::JSONB,
  button_roles JSONB DEFAULT '[]'::JSONB,
  auto_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  xp_blacklist_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  xp_blacklist_channels TEXT[] DEFAULT ARRAY[]::TEXT[],
  levelup_channel TEXT,
  levelup_message TEXT DEFAULT '🎉 {user} just reached level {level}!',
  automod_enabled BOOLEAN DEFAULT FALSE,
  automod_antilinks BOOLEAN DEFAULT FALSE,
  automod_antiswear BOOLEAN DEFAULT FALSE,
  automod_antispam BOOLEAN DEFAULT FALSE,
  automod_antiraid BOOLEAN DEFAULT FALSE,
  welcome_channel TEXT,
  welcome_message TEXT,
  welcome_card BOOLEAN DEFAULT FALSE,
  goodbye_channel TEXT,
  goodbye_message TEXT,
  dm_welcome BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_server_config_guild_id ON server_config(guild_id);

-- Giveaways Table
CREATE TABLE IF NOT EXISTS giveaways (
  id BIGSERIAL PRIMARY KEY,
  guild_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  message_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  prize TEXT NOT NULL,
  winners_count INTEGER DEFAULT 1,
  end_time TIMESTAMP WITH TIME ZONE,
  ended BOOLEAN DEFAULT FALSE,
  participants TEXT[] DEFAULT ARRAY[]::TEXT[],
  winners_list TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_giveaways_guild_id ON giveaways(guild_id);
CREATE INDEX IF NOT EXISTS idx_giveaways_ended ON giveaways(ended, end_time);

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;