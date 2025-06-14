import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../lib/UserContext';
import { useGame } from '../lib/GameContext';
import { usePrivy } from '@privy-io/react-auth';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';

const ResultPage = () => {
  const { user } = useUser();
  const { authenticated, logout: privyLogout } = usePrivy();
  const { gameState, resetGame } = useGame();
  const navigate = useNavigate();
  const { logout } = useUser();

  // Redirect to home if not logged in
  useEffect(() => {
    if (!authenticated || !user.isLoggedIn) {
      navigate('/');
    }
    
    // Redirect to lobby if no game or game is not completed
    if (!gameState.gameId || gameState.status !== 'completed') {
      navigate('/lobby');
    }
  }, [authenticated, user.isLoggedIn, gameState, navigate]);

  const handlePlayAgain = () => {
    resetGame();
    navigate('/lobby');
  };

  const handleBackToHome = () => {
    resetGame();
    navigate('/');
  };

  const handleLogout = async () => {
    await privyLogout();
    logout();
    resetGame();
    navigate('/');
  };

  if (!authenticated || !user.isLoggedIn || !gameState.gameId) {
    return null; // Don't render anything while redirecting
  }

  // Determine if user is player 1 or player 2
  const isPlayer1 = gameState.player1?.address === user.address;
  const playerScore = isPlayer1 ? gameState.scores.player1 : gameState.scores.player2;
  const opponentScore = isPlayer1 ? gameState.scores.player2 : gameState.scores.player1;
  const opponent = isPlayer1 ? gameState.player2 : gameState.player1;
  
  // Determine winner
  const userWon = playerScore > opponentScore;
  const isDraw = playerScore === opponentScore;

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Game Over!</h1>
          <p className="text-xl text-indigo-200">
            {isDraw ? "It's a draw!" : userWon ? "You won!" : "You lost!"}
          </p>
        </div>
        
        <Card className="w-full max-w-md">
          <div className="space-y-6">
            {/* Player info */}
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.username}</h2>
                <p className="text-xs text-gray-500 truncate">
                  {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </p>
              </div>
            </div>
            
            {/* Score display */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-0.5 rounded-xl">
              <div className="bg-white rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Your Score</p>
                    <p className="text-2xl font-bold">{playerScore}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">VS</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">{opponent?.username}'s Score</p>
                    <p className="text-2xl font-bold">{opponentScore}</p>
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <p className="text-lg font-semibold">
                    {isDraw ? (
                      <span className="text-gray-700">Draw!</span>
                    ) : userWon ? (
                      <span className="text-green-600">You Won!</span>
                    ) : (
                      <span className="text-red-600">You Lost!</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-2">
              <div className="text-center">
                <p className="text-gray-500 text-sm">Time</p>
                <p className="font-bold">{gameState.timerDuration}s</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Players</p>
                <p className="font-bold">2</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Game ID</p>
                <p className="font-bold text-xs">{gameState.gameId.substring(0, 6)}...</p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="space-y-3 pt-4">
              <Button 
                onClick={handlePlayAgain}
                fullWidth
              >
                Play Again
              </Button>
              <Button 
                onClick={handleBackToHome}
                variant="secondary"
                fullWidth
              >
                Back to Home
              </Button>
              <Button 
                onClick={handleLogout}
                variant="danger"
                fullWidth
              >
                Logout
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ResultPage; 