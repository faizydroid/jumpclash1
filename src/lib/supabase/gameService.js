import { supabase } from '../supabaseClient';

/**
 * Create a new game in Supabase
 * @param {Object} gameData - Game data with game_id, player1, timer_duration, etc.
 * @returns {Promise<Object>} - Created game data or error
 */
export const createGameInSupabase = async (gameData) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .insert([gameData])
      .select()
      .single();

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error creating game in Supabase:', error);
    return { error };
  }
};

/**
 * Get a game by ID from Supabase
 * @param {string} game_id - The game ID to fetch
 * @returns {Promise<Object>} - Game data or error
 */
export const getGameById = async (game_id) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('game_id', game_id)
      .single();

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error getting game from Supabase:', error);
    return { error };
  }
};

/**
 * Update a game in Supabase
 * @param {string} game_id - The game ID to update
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object>} - Updated game data or error
 */
export const updateGame = async (game_id, updates) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .update(updates)
      .eq('game_id', game_id)
      .select()
      .single();

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error updating game in Supabase:', error);
    return { error };
  }
};

/**
 * Join a game by adding player2 information
 * @param {string} game_id - The game ID to join
 * @param {Object} player2 - Player 2 information
 * @returns {Promise<Object>} - Updated game data or error
 */
export const joinGameInSupabase = async (game_id, player2) => {
  try {
    // First check if the game exists and is in waiting status
    const { data: existingGame, error: fetchError } = await getGameById(game_id);
    
    if (fetchError || !existingGame) {
      return { error: { message: 'Game not found' } };
    }
    
    if (existingGame.status !== 'waiting') {
      return { error: { message: 'Game is not available for joining' } };
    }
    
    // Update the game with player2 info and change status to ready
    const { data, error } = await updateGame(game_id, {
      player2,
      status: 'ready',
      updated_at: new Date().toISOString()
    });

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error joining game in Supabase:', error);
    return { error };
  }
};

/**
 * Update game scores
 * @param {string} game_id - The game ID
 * @param {Object} scores - The updated scores object
 * @returns {Promise<Object>} - Updated game data or error
 */
export const updateGameScores = async (game_id, scores) => {
  try {
    const { data, error } = await updateGame(game_id, {
      scores,
      updated_at: new Date().toISOString()
    });

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error updating game scores in Supabase:', error);
    return { error };
  }
};

/**
 * Update game status
 * @param {string} game_id - The game ID
 * @param {string} status - The new status
 * @returns {Promise<Object>} - Updated game data or error
 */
export const updateGameStatus = async (game_id, status) => {
  const updates = {
    status,
    updated_at: new Date().toISOString()
  };
  
  // Add timestamps based on status
  if (status === 'active') {
    updates.started_at = new Date().toISOString();
  } else if (status === 'completed') {
    updates.ended_at = new Date().toISOString();
  }
  
  try {
    const { data, error } = await updateGame(game_id, updates);

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error updating game status in Supabase:', error);
    return { error };
  }
};

/**
 * Subscribe to game updates
 * @param {string} game_id - The game ID to subscribe to
 * @param {Function} callback - Callback function when game updates
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToGameUpdates = (game_id, callback) => {
  const subscription = supabase
    .channel(`game-${game_id}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'games',
        filter: `game_id=eq.${game_id}`
      }, 
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
    
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
}; 