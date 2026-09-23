-- ============================================================
-- Supabase Database Setup for NKJxMNT KAUR 🎲
-- Execute this script in your Supabase Project's SQL Editor
-- Completely safe to run on brand-new or existing projects!
-- ============================================================

-- 1. Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  current_turn INTEGER NOT NULL DEFAULT 1 CHECK (current_turn IN (1, 2)),
  winner_id TEXT DEFAULT NULL,
  winner_name TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create players table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  player_number INTEGER NOT NULL CHECK (player_number IN (1, 2)),
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0 AND position <= 100),
  session_token TEXT NOT NULL,
  connected BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, player_number)
);

-- 3. Create game_events table (Action history & recovery log)
CREATE TABLE IF NOT EXISTS public.game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_number INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;

-- 5. Create Permissive Policies for Anonymous Multiplayer Play
DROP POLICY IF EXISTS "Allow public room access" ON public.rooms;
CREATE POLICY "Allow public room access" ON public.rooms
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public player access" ON public.players;
CREATE POLICY "Allow public player access" ON public.players
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public event access" ON public.game_events;
CREATE POLICY "Allow public event access" ON public.game_events
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Performance Indexes for Fast Lookups
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_players_room ON public.players(room_id);
CREATE INDEX IF NOT EXISTS idx_events_room ON public.game_events(room_id);

-- 7. Set REPLICA IDENTITY FULL for complete Realtime payload updates
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.players REPLICA IDENTITY FULL;

-- 8. Enable Realtime Replication (Idempotent - safe to re-run anytime)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'game_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_events;
  END IF;
END $$;

-- 9. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_rooms_updated_at ON public.rooms;
CREATE TRIGGER trigger_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_players_updated_at ON public.players;
CREATE TRIGGER trigger_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
