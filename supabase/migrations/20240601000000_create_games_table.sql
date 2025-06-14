-- Create games table for multiplayer functionality
CREATE TABLE IF NOT EXISTS public.games (
  id BIGSERIAL PRIMARY KEY,
  game_id UUID NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  timer_duration INTEGER NOT NULL DEFAULT 60,
  player1 JSONB NOT NULL,
  player2 JSONB,
  scores JSONB NOT NULL DEFAULT '{"player1": 0, "player2": 0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create index on game_id for faster lookups
CREATE INDEX IF NOT EXISTS games_game_id_idx ON public.games (game_id);

-- Create index on status for filtering active games
CREATE INDEX IF NOT EXISTS games_status_idx ON public.games (status);

-- Add RLS policies
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read games
CREATE POLICY games_select_policy ON public.games
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own games
CREATE POLICY games_insert_policy ON public.games
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow updates only if user is a player in the game
CREATE POLICY games_update_policy ON public.games
  FOR UPDATE TO authenticated
  USING (
    (player1->>'address')::text = auth.uid() OR
    (player2->>'address')::text = auth.uid()
  );

-- Enable realtime subscriptions for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.games; 