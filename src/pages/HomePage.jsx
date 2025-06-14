import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useUser } from '../lib/UserContext';
import Layout from '../components/Layout';
import Button from '../components/Button';
import UsernameSetup from '../components/UsernameSetup';

const HomePage = () => {
  const { login, authenticated } = usePrivy();
  const { user } = useUser();
  const navigate = useNavigate();
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);

  useEffect(() => {
    // Clear any local solo game so login always goes to lobby
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jumpclash_game');
    }
    if (authenticated && user.isLoggedIn && user.username) {
      navigate('/lobby', { replace: true });
    }
    if (authenticated && user.isLoggedIn && !user.username) {
      setShowUsernameSetup(true);
    }
  }, [authenticated, user, navigate]);

  // If logged in, never show HomePage
  if (authenticated && user.isLoggedIn && user.username) {
    return null;
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-white mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              JumpClash
            </span>
          </h1>
          <p className="text-xl text-indigo-200 max-w-md mx-auto">
            The ultimate jumping challenge on Monad. Compete with friends and climb the leaderboard!
          </p>
        </div>

        <div className="w-full max-w-md">
          {!authenticated || !user.isLoggedIn ? (
            <Button onClick={login} fullWidth size="lg">
              Play Now
            </Button>
          ) : showUsernameSetup ? (
            <UsernameSetup walletAddress={user.address} />
          ) : null}
          
          <div className="mt-8 text-center">
            <p className="text-indigo-300 text-sm">
              Powered by Monad Blockchain
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage; 