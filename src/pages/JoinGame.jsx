import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../lib/GameContext';
import { useUser } from '../lib/UserContext';
import GameInvite from '../components/GameInvite';

const JoinGame = () => {
  const { game_id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { 
    gameState, 
    fetchGame, 
    joinGame, 
    loading, 
    error 
  } = useGame();
  
  const [joinError, setJoinError] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    // If no game_id in URL, redirect to home
    if (!game_id) {
      navigate('/');
      return;
    }

    // If we're already in this game, don't try to join again
    if (gameState.game_id === game_id) {
      setJoined(true);
      return;
    }

    // Try to fetch the game first
    const loadGame = async () => {
      const game = await fetchGame(game_id);
      
      if (!game) {
        setJoinError('Game not found');
        return;
      }
      
      // If user is logged in, try to join automatically
      if (user.isLoggedIn && user.address) {
        handleJoinGame();
      }
    };
    
    loadGame();
  }, [game_id, user.isLoggedIn, user.address]);

  const handleJoinGame = async () => {
    if (!user.isLoggedIn || !user.address) {
      setJoinError('Please login to join the game');
      return;
    }

    setJoinError('');
    
    // Join the game
    const playerInfo = {
      address: user.address,
      username: user.username || 'Player 2'
    };
    
    const success = await joinGame(game_id, playerInfo);
    
    if (success) {
      setJoined(true);
      // Redirect to game page
      navigate('/game');
    } else {
      setJoinError('Failed to join game');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Join Game</h1>
        
        {error || joinError ? (
          <div className="mb-6 p-3 bg-red-600 text-white rounded">
            {error || joinError}
          </div>
        ) : null}
        
        {!user.isLoggedIn ? (
          <div className="p-4 bg-gray-800 rounded-lg shadow-lg mb-6">
            <p className="text-white mb-4">
              Please login to join this game.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Go to Login
            </button>
          </div>
        ) : joined ? (
          <div className="p-4 bg-gray-800 rounded-lg shadow-lg mb-6">
            <p className="text-green-400 mb-4">
              Successfully joined game!
            </p>
            <button
              onClick={() => navigate('/game')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Go to Game
            </button>
          </div>
        ) : (
          <div className="p-4 bg-gray-800 rounded-lg shadow-lg mb-6">
            <p className="text-white mb-4">
              You're joining game: <span className="font-mono">{game_id}</span>
            </p>
            <button
              onClick={handleJoinGame}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        )}
        
        {/* Show the GameInvite component as a fallback */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-white">Or create your own game</h2>
          <GameInvite />
        </div>
      </div>
    </div>
  );
};

export default JoinGame; 