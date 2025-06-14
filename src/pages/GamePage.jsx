import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../lib/UserContext';
import { useGame } from '../lib/GameContext';
import { usePrivy } from '@privy-io/react-auth';
import Layout from '../components/Layout';
import Button from '../components/Button';

const GamePage = () => {
  const { user } = useUser();
  const { authenticated } = usePrivy();
  const { gameState, updateScore, endGame } = useGame();
  const navigate = useNavigate();
  const location = useLocation();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameState.timer_duration || 60);
  const [isRespawning, setIsRespawning] = useState(false);
  const iframeRef = useRef(null);

  // Detect solo mode from query param or gameState
  const isSolo = new URLSearchParams(location.search).get('solo') === '1' || gameState.solo;

  // Redirect to home if not logged in
  useEffect(() => {
    if (!authenticated || !user.isLoggedIn) {
      navigate('/');
    }
    
    // Redirect to lobby if no active game or game is not active
    if (!gameState.game_id || gameState.status !== 'active') {
      navigate('/lobby');
    }
  }, [authenticated, user.isLoggedIn, gameState, navigate]);

  // Timer countdown
  useEffect(() => {
    if (isSolo) return; // No timer in solo mode
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Game over when time runs out
      endGame();
      navigate('/result');
    }
  }, [timeLeft, navigate, endGame, isSolo]);

  // Setup message listener for game events
  useEffect(() => {
    if (isSolo) return; // No respawn in solo mode
    const handleMessage = (event) => {
      if (event.source === iframeRef.current?.contentWindow) {
        const { type, data } = event.data;
        if (type === 'SCORE_UPDATE') {
          setScore(data.score);
          const playerKey = gameState.player1?.address === user.address ? 'player1' : 'player2';
          updateScore(playerKey, data.score);
        }
        if (type === 'PLAYER_DIED') {
          setIsRespawning(true);
          setTimeout(() => {
            iframeRef.current?.contentWindow.postMessage({ type: 'RESPAWN_PLAYER' }, '*');
            setIsRespawning(false);
          }, 2000);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [gameState, user.address, updateScore, isSolo]);

  // Initialize game with parameters when iframe loads
  const handleIframeLoad = () => {
    if (iframeRef.current) {
      if (!isSolo) {
        iframeRef.current.contentWindow.postMessage({
          type: 'INIT_GAME',
          data: {
            playerName: user.username,
            gameDuration: gameState.timer_duration,
            playerAvatar: user.username.charAt(0).toUpperCase()
          }
        }, '*');
      }
    }
  };

  const handleGameOver = () => {
    endGame();
    navigate('/result');
  };

  if (!authenticated || !user.isLoggedIn || !gameState.game_id) {
    return null; // Don't render anything while redirecting
  }

  // Determine if user is player 1 or player 2
  const isPlayer1 = gameState.player1?.address === user.address;
  const opponent = isPlayer1 ? gameState.player2 : gameState.player1;

  return (
    <Layout className="p-0">
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Game header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              JumpClash
            </h1>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-2">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span>{user.username}</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold">{score}</span>
              </div>
              {!isSolo && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold">{timeLeft}s</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Opponent info */}
        <div className="max-w-6xl mx-auto p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 mb-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold mr-2">
                {opponent?.username.charAt(0).toUpperCase()}
              </div>
              <span>{opponent?.username}</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-bold">{isPlayer1 ? gameState.scores.player2 : gameState.scores.player1}</span>
            </div>
          </div>

          {/* Game container */}
          <div className="flex justify-center items-center">
            <div className="relative w-[450px] h-[750px]">
              {/* Respawn overlay */}
              {isRespawning && (
                <div className="absolute inset-0 bg-black bg-opacity-70 z-10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">Respawning...</div>
                    <div className="text-xl text-blue-400">2</div>
                  </div>
                </div>
              )}
              
              {/* Game iframe */}
              <iframe
                ref={iframeRef}
                src="/game.html"
                title="Doodle Jump Game"
                className="w-full h-full border-0 rounded-xl overflow-hidden"
                onLoad={handleIframeLoad}
              />
            </div>
          </div>
          
          {/* Game controls */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleGameOver}
              variant="danger"
            >
              End Game
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GamePage; 