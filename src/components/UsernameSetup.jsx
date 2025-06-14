import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../lib/UserContext';
import Button from './Button';
import { supabase } from '../lib/supabaseClient';

const UsernameSetup = ({ walletAddress }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { updateUser, user } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    // Use email from context (set by privy)
    const email = user.email || '';
    // Store in Supabase (table: jumpclash)
    const { error: dbError } = await supabase
      .from('jumpclash')
      .upsert({
        wallet: walletAddress,
        username,
        email
      }, { onConflict: ['wallet'] });
    if (dbError) {
      setError('Failed to save username. Try again.');
      return;
    }
    // Update user context
    updateUser({
      username,
      address: walletAddress,
      isLoggedIn: true,
      email
    });
    navigate('/lobby');
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Create Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-left">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Choose a Username
          </label>
          <input
            type="text"
            id="username"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="Enter a username"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
        </div>
        <div className="pt-4">
          <Button
            type="submit"
            fullWidth
            size="lg"
          >
            Continue to Lobby
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UsernameSetup; 