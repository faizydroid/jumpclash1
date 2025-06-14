import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../lib/UserContext';
import { useGame } from '../lib/GameContext';
import { usePrivy } from '@privy-io/react-auth';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import GameInvite from '../components/GameInvite';

const LobbyPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { gameState, startGame, resetGame, loading, error, createGame } = useGame();
  const { authenticated } = usePrivy();

  // Modal states
  const [show1v1Modal, setShow1v1Modal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);
  const [creating, setCreating] = useState(false);
  const [gameId, setGameId] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    if (!authenticated || !user.isLoggedIn) {
      navigate('/');
    }
    if (gameState.status === 'active') {
      navigate('/play');
    }
  }, [authenticated, user, gameState, navigate]);

  // Play Solo: create a local game with a bot
  const handlePlaySolo = async () => {
    resetGame();
    const player1 = {
      username: user.username,
      address: user.address
    };
    // Local game state, not in Supabase
    const soloGame = {
      game_id: 'solo-' + Math.random().toString(36).slice(2),
      timer_duration: 0, // No timer for solo
      status: 'active',
      player1,
      player2: null, // No bot
      scores: { player1: 0 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      ended_at: null,
      solo: true // Mark as solo mode
    };
    localStorage.setItem('jumpclash_game', JSON.stringify(soloGame));
    navigate('/play?solo=1');
  };

  // Play 1v1: open modal
  const handlePlay1v1 = () => {
    resetGame();
    setShow1v1Modal(true);
  };

  // Create 1v1 game
  const handleCreate1v1Game = async () => {
    setCreating(true);
    const player1 = {
      username: user.username,
      address: user.address
    };
    await createGame(player1, timerDuration);
    setShow1v1Modal(false);
    setCreating(false);
  };

  // Join existing game
  const handleJoinGame = async () => {
    if (!gameId.trim()) {
      setJoinError('Please enter a game ID');
      return;
    }

    setJoinError('');
    navigate(`/join/${gameId.trim()}`);
  };

  // Cancel modals
  const handleCancelModal = () => {
    setShow1v1Modal(false);
    setShowJoinModal(false);
    setJoinError('');
  };

  if (!authenticated || !user.isLoggedIn) return null;

  return (
    <Layout className="p-0">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {/* Main game mode buttons - centered in page */}
          {!gameState.game_id && (
            <div className="w-full max-w-2xl flex flex-col md:flex-row gap-8 justify-center">
              <div 
                onClick={handlePlaySolo}
                className="flex-1 bg-purple-800 hover:bg-purple-900 text-white rounded-3xl p-1 transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                <div className="bg-purple-700 rounded-3xl p-12 flex items-center justify-center">
                  <span className="text-3xl font-bold italic">PLAY SOLO</span>
                </div>
              </div>
              
              <div 
                onClick={handlePlay1v1}
                className="flex-1 bg-pink-400 hover:bg-pink-500 text-white rounded-3xl p-1 transition-all transform hover:scale-105 shadow-lg cursor-pointer"
              >
                <div className="bg-pink-300 rounded-3xl p-12 flex items-center justify-center">
                  <span className="text-3xl font-bold italic">PLAY 1V1</span>
                </div>
              </div>
            </div>
          )}

          {/* 1v1 Modal */}
          {show1v1Modal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Play 1v1</h2>
                
                <div className="space-y-6">
                  {/* Create Game Section */}
                  <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold mb-4">Create a New Game</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Timer (seconds):</label>
                        <input
                          type="number"
                          min={10}
                          max={300}
                          value={timerDuration}
                          onChange={e => setTimerDuration(Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <Button 
                        onClick={handleCreate1v1Game} 
                        disabled={creating} 
                        fullWidth
                      >
                        {creating ? 'Creating...' : 'Create Game'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Join Game Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Join a Game</h3>
                    <div className="space-y-4">
                      {joinError && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                          {joinError}
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium mb-1">Game ID:</label>
                        <input
                          type="text"
                          value={gameId}
                          onChange={e => setGameId(e.target.value)}
                          placeholder="Enter Game ID"
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <Button 
                        onClick={handleJoinGame} 
                        variant="secondary" 
                        fullWidth
                      >
                        Join Game
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-4 border-t">
                  <Button 
                    onClick={handleCancelModal} 
                    variant="danger" 
                    fullWidth
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Game details and players (when a game exists) */}
          {gameState.game_id && (
            <div className="w-full max-w-2xl">
              <Card>
                <h2 className="text-xl font-bold mb-4">Game Details</h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-500">Game ID:</span>
                    <div className="flex items-center mt-1">
                      <code className="bg-gray-100 px-2 py-1 rounded flex-1 overflow-x-auto">
                        {gameState.game_id}
                      </code>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        gameState.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                        gameState.status === 'ready' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {gameState.status === 'waiting' ? 'Waiting for opponent' :
                         gameState.status === 'ready' ? 'Ready to start' :
                         gameState.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Timer:</span>
                    <div className="mt-1">{gameState.timer_duration} seconds</div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-3">Players</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <div className="font-medium">Player 1 (You)</div>
                        <div className="text-sm text-gray-600">{gameState.player1?.username || user.username}</div>
                      </div>
                      {gameState.player2 ? (
                        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                          <div className="font-medium">Player 2</div>
                          <div className="text-sm text-gray-600">{gameState.player2.username}</div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="font-medium text-gray-500">Waiting for Player 2</div>
                          <div className="text-sm text-gray-400">Share the game ID with your friend</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-4">
                  <Button
                    onClick={resetGame}
                    variant="secondary"
                    fullWidth
                  >
                    Cancel Game
                  </Button>
                  <Button
                    onClick={startGame}
                    fullWidth
                    disabled={loading || gameState.status !== 'ready'}
                  >
                    {loading ? 'Starting...' : 'Start Game'}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LobbyPage; 