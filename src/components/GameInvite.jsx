import React, { useState } from 'react';
import { useGame } from '../lib/GameContext';
import { useUser } from '../lib/UserContext';

const GameInvite = () => {
  const { user } = useUser();
  const { 
    gameState, 
    createGame, 
    joinGame, 
    fetchGame,
    loading, 
    error 
  } = useGame();
  
  const [game_id, setGameId] = useState('');
  const [timer_duration, setTimerDuration] = useState(60);
  const [joinError, setJoinError] = useState('');

  // Create a new game
  const handleCreateGame = async () => {
    if (!user.isLoggedIn || !user.address) {
      return;
    }

    const playerInfo = {
      address: user.address,
      username: user.username || 'Player 1'
    };

    await createGame(playerInfo, timer_duration);
  };

  // Join an existing game
  const handleJoinGame = async () => {
    if (!user.isLoggedIn || !user.address || !game_id) {
      setJoinError('Please login and enter a game ID');
      return;
    }

    setJoinError('');
    
    // First try to fetch the game to see if it exists
    const game = await fetchGame(game_id);
    
    if (!game) {
      setJoinError('Game not found');
      return;
    }
    
    // Check if game is available for joining
    if (game.status !== 'waiting') {
      setJoinError('Game is not available for joining');
      return;
    }
    
    // Join the game
    const playerInfo = {
      address: user.address,
      username: user.username || 'Player 2'
    };
    
    const success = await joinGame(game_id, playerInfo);
    
    if (!success) {
      setJoinError('Failed to join game');
    }
  };

  // Generate shareable link
  const getShareableLink = () => {
    if (!gameState.game_id) return '';
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/join/${gameState.game_id}`;
  };

  // Copy link to clipboard
  const copyToClipboard = () => {
    const link = getShareableLink();
    navigator.clipboard.writeText(link);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Multiplayer Game</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-600 text-white rounded">
          {error}
        </div>
      )}
      
      {!gameState.game_id ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">Create a New Game</h3>
            <div className="flex items-center space-x-2">
              <label className="text-white">Timer (seconds):</label>
              <input
                type="number"
                min="10"
                max="300"
                value={timer_duration}
                onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                className="bg-gray-700 text-white px-2 py-1 rounded w-20"
              />
            </div>
            <button
              onClick={handleCreateGame}
              disabled={loading || !user.isLoggedIn}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Game'}
            </button>
          </div>
          
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold mb-2 text-white">Join a Game</h3>
            {joinError && (
              <div className="mb-2 p-2 bg-red-600 text-white rounded text-sm">
                {joinError}
              </div>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Enter Game ID"
                value={game_id}
                onChange={(e) => setGameId(e.target.value)}
                className="bg-gray-700 text-white px-2 py-1 rounded flex-1"
              />
              <button
                onClick={handleJoinGame}
                disabled={loading || !game_id || !user.isLoggedIn}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">Game Created</h3>
            <p className="text-gray-300">Game ID: {gameState.game_id}</p>
            <p className="text-gray-300">Status: {gameState.status}</p>
            {gameState.player2 ? (
              <p className="text-gray-300">
                Player 2: {gameState.player2.username || 'Player 2'}
              </p>
            ) : (
              <p className="text-yellow-400">Waiting for Player 2 to join...</p>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">Share with Friend</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={getShareableLink()}
                className="bg-gray-700 text-white px-2 py-1 rounded flex-1"
              />
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInvite; 