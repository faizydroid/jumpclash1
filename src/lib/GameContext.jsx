import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  createGameInSupabase, 
  getGameById, 
  joinGameInSupabase, 
  updateGameStatus, 
  updateGameScores,
  subscribeToGameUpdates
} from './supabase/gameService';

// Still keep localStorage for fallback
const GAME_KEY = 'jumpclash_game';
const GameContext = createContext(null);

function getInitialGameState() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(GAME_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
  }
  return {
    game_id: null,
    timer_duration: 60, // Default 60 seconds
    status: 'idle', // idle, waiting, ready, active, completed
    player1: null,
    player2: null,
    scores: {
      player1: 0,
      player2: 0
    },
    created_at: null,
    updated_at: null,
    started_at: null,
    ended_at: null
  };
}

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(getInitialGameState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unsubscribe, setUnsubscribe] = useState(null);

  // Cleanup subscription when component unmounts
  useEffect(() => {
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [unsubscribe]);

  // Subscribe to game updates when game_id changes
  useEffect(() => {
    if (gameState.game_id) {
      // Store in localStorage as fallback
      localStorage.setItem(GAME_KEY, JSON.stringify(gameState));
      
      // Subscribe to real-time updates
      const unsub = subscribeToGameUpdates(gameState.game_id, (updatedGame) => {
        if (updatedGame && updatedGame.game_id === gameState.game_id) {
          setGameState(updatedGame);
          localStorage.setItem(GAME_KEY, JSON.stringify(updatedGame));
        }
      });
      
      setUnsubscribe(() => unsub);
      
      return () => {
        unsub();
        setUnsubscribe(null);
      };
    } else {
      localStorage.removeItem(GAME_KEY);
    }
  }, [gameState.game_id]);

  // Fetch game from Supabase when joining with game_id
  const fetchGame = useCallback(async (game_id) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getGameById(game_id);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setGameState(data);
        localStorage.setItem(GAME_KEY, JSON.stringify(data));
        return data;
      }
      
      return null;
    } catch (err) {
      console.error("Error fetching game:", err);
      setError(err.message || "Failed to fetch game");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createGame = async (player1, timer_duration = 60) => {
    setLoading(true);
    setError(null);
    
    try {
      const game_id = uuidv4();
      const newGameState = {
        game_id,
        timer_duration,
        status: 'waiting',
        player1,
        player2: null,
        scores: {
          player1: 0,
          player2: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        started_at: null,
        ended_at: null
      };
      
      // Create game in Supabase
      const { data, error } = await createGameInSupabase(newGameState);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setGameState(data || newGameState);
      localStorage.setItem(GAME_KEY, JSON.stringify(data || newGameState));
      
      return game_id;
    } catch (err) {
      console.error("Error creating game:", err);
      setError(err.message || "Failed to create game");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (game_id, player2) => {
    setLoading(true);
    setError(null);
    
    try {
      // First check if we already have this game locally
      if (gameState.game_id === game_id) {
        // If we're player1, just update our local state
        if (gameState.player1?.address === player2.address) {
          return true;
        }
      }
      
      // Otherwise, join the game in Supabase
      const { data, error } = await joinGameInSupabase(game_id, player2);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setGameState(data);
        localStorage.setItem(GAME_KEY, JSON.stringify(data));
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Error joining game:", err);
      setError(err.message || "Failed to join game");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    if (!gameState.game_id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await updateGameStatus(gameState.game_id, 'active');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setGameState(data);
        localStorage.setItem(GAME_KEY, JSON.stringify(data));
      }
    } catch (err) {
      console.error("Error starting game:", err);
      setError(err.message || "Failed to start game");
      
      // Update local state anyway for better UX
      setGameState(prev => ({
        ...prev,
        status: 'active',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    } finally {
      setLoading(false);
    }
  };

  const updateScore = async (player, score) => {
    if (!gameState.game_id) return;
    
    const newScores = {
      ...gameState.scores,
      [player]: score
    };
    
    // Update local state immediately for better UX
    setGameState(prev => ({
      ...prev,
      scores: newScores,
      updated_at: new Date().toISOString()
    }));
    
    // Then update in Supabase
    try {
      await updateGameScores(gameState.game_id, newScores);
    } catch (err) {
      console.error("Error updating scores:", err);
    }
  };

  const endGame = async () => {
    if (!gameState.game_id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await updateGameStatus(gameState.game_id, 'completed');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setGameState(data);
        localStorage.setItem(GAME_KEY, JSON.stringify(data));
      }
    } catch (err) {
      console.error("Error ending game:", err);
      setError(err.message || "Failed to end game");
      
      // Update local state anyway for better UX
      setGameState(prev => ({
        ...prev,
        status: 'completed',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
    }
    localStorage.removeItem(GAME_KEY);
    setGameState(getInitialGameState());
    setError(null);
  };

  return (
    <GameContext.Provider 
      value={{ 
        gameState, 
        loading,
        error,
        createGame, 
        joinGame,
        fetchGame,
        startGame, 
        updateScore, 
        endGame,
        resetGame
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext); 