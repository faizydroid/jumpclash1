import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../lib/UserContext';
import { useGame } from '../lib/GameContext';
import { usePrivy } from '@privy-io/react-auth';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Sidebar from '../components/Sidebar';

const JoinGamePage = () => {
  const { game_id: urlGameId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { gameState, joinGame, fetchGame, loading, error: gameError } = useGame();
  const { authenticated } = usePrivy();
  const [game_id, setGameId] = useState(urlGameId || '');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [gameChecked, setGameChecked] = useState(false);

  useEffect(() => {
    // If not logged in, redirect to home
    if (!authenticated || !user.isLoggedIn) {
      navigate('/');
      return;
    }
    
    // If we have a game ID from the URL, try to fetch it
    const checkGame = async () => {
      if (urlGameId && !gameChecked) {
        setGameChecked(true);
        
        // Try to fetch the game
        const game = await fetchGame(urlGameId);
        
        if (!game) {
          setError('Game not found. Please check the game ID.');
          return;
        }
        
        // If this is player1's game, go to lobby
        if (game.player1?.address === user.address) {
          navigate('/lobby');
          return;
        }
        
        // If game is already joined by this player, go to lobby
        if (game.player2?.address === user.address) {
          navigate('/lobby');
          return;
        }
        
        // If game is not in waiting status
        if (game.status !== 'waiting') {
          setError('This game is no longer accepting players.');
          return;
        }
      }
    };
    
    checkGame();
  }, [authenticated, user, urlGameId, gameChecked, fetchGame, navigate]);
  
  // Watch for game state changes
  useEffect(() => {
    // If game is joined and ready, go to lobby
    if (gameState.game_id && gameState.status === 'ready') {
      navigate('/lobby');
    }
  }, [gameState, navigate]);

  const handleJoinGame = async () => {
    if (!game_id.trim()) {
      setError('Please enter a valid Game ID');
      return;
    }

    setIsJoining(true);
    setError('');
    
    try {
      const player2 = {
        username: user.username,
        address: user.address
      };
      
      const success = await joinGame(game_id, player2);
      
      if (success) {
        navigate('/lobby');
      } else {
        setError('Failed to join the game. The game ID may be invalid or the game is no longer available.');
      }
    } catch (err) {
      setError('An error occurred while joining the game.');
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleGameIdChange = (e) => {
    setGameId(e.target.value);
    if (error) setError('');
  };

  const handleBackToLobby = () => {
    navigate('/lobby');
  };

  if (!authenticated || !user.isLoggedIn) {
    return null; // Don't render anything while redirecting
  }

  return (
    <Layout className="p-0">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto flex items-center justify-center">
          <Card className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Join Game</h2>
              <button 
                onClick={handleBackToLobby}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2">Loading game...</span>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Game ID
                  </label>
                  <input
                    type="text"
                    value={game_id}
                    onChange={handleGameIdChange}
                    placeholder="Paste the Game ID here"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Ask your friend for their Game ID to join their game
                  </p>
                </div>
                
                <div className="mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-blue-800">
                      <span className="font-bold">Playing as:</span> {user.username}
                    </p>
                  </div>
                </div>
                
                {(error || gameError) && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                    {error || gameError}
                  </div>
                )}
                
                <div className="flex space-x-4">
                  <Button
                    onClick={handleBackToLobby}
                    variant="secondary"
                    fullWidth
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleJoinGame}
                    fullWidth
                    disabled={isJoining || loading || !game_id.trim()}
                  >
                    {isJoining ? 'Joining...' : 'Join Game'}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default JoinGamePage; 