-- Sample game data for testing
INSERT INTO public.games (
  game_id,
  status,
  timer_duration,
  player1,
  player2,
  scores,
  created_at,
  updated_at,
  started_at,
  ended_at
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000'::uuid,
  'waiting',
  60,
  '{"username": "Player1", "address": "0x1234567890abcdef1234567890abcdef12345678"}'::jsonb,
  NULL,
  '{"player1": 0, "player2": 0}'::jsonb,
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '30 minutes',
  NULL,
  NULL
);

INSERT INTO public.games (
  game_id,
  status,
  timer_duration,
  player1,
  player2,
  scores,
  created_at,
  updated_at,
  started_at,
  ended_at
) VALUES (
  '223e4567-e89b-12d3-a456-426614174001'::uuid,
  'ready',
  120,
  '{"username": "Player1", "address": "0x1234567890abcdef1234567890abcdef12345678"}'::jsonb,
  '{"username": "Player2", "address": "0x2234567890abcdef1234567890abcdef12345678"}'::jsonb,
  '{"player1": 0, "player2": 0}'::jsonb,
  NOW() - INTERVAL '20 minutes',
  NOW() - INTERVAL '15 minutes',
  NULL,
  NULL
);

INSERT INTO public.games (
  game_id,
  status,
  timer_duration,
  player1,
  player2,
  scores,
  created_at,
  updated_at,
  started_at,
  ended_at
) VALUES (
  '323e4567-e89b-12d3-a456-426614174002'::uuid,
  'active',
  60,
  '{"username": "Player1", "address": "0x1234567890abcdef1234567890abcdef12345678"}'::jsonb,
  '{"username": "Player2", "address": "0x2234567890abcdef1234567890abcdef12345678"}'::jsonb,
  '{"player1": 5, "player2": 3}'::jsonb,
  NOW() - INTERVAL '15 minutes',
  NOW() - INTERVAL '5 minutes',
  NOW() - INTERVAL '5 minutes',
  NULL
);

INSERT INTO public.games (
  game_id,
  status,
  timer_duration,
  player1,
  player2,
  scores,
  created_at,
  updated_at,
  started_at,
  ended_at
) VALUES (
  '423e4567-e89b-12d3-a456-426614174003'::uuid,
  'completed',
  60,
  '{"username": "Player1", "address": "0x1234567890abcdef1234567890abcdef12345678"}'::jsonb,
  '{"username": "Player2", "address": "0x2234567890abcdef1234567890abcdef12345678"}'::jsonb,
  '{"player1": 12, "player2": 8}'::jsonb,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour'
); 