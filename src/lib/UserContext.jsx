import React, { createContext, useState, useContext, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from './supabaseClient';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { ready, authenticated, user: privyUser, getAccessToken } = usePrivy();
  const [user, setUser] = useState({
    isLoggedIn: false,
    username: '',
    address: '',
    token: '',
    monBalance: '0.00',
    email: '',
  });

  useEffect(() => {
    const updateUserState = async () => {
      if (ready && authenticated && privyUser) {
        try {
          // Get the embedded wallet address
          const wallets = privyUser.linkedAccounts.filter(
            (account) => account.type === 'wallet'
          );
          const embeddedWallet = wallets.find(
            (wallet) => wallet.walletClientType === 'privy'
          );
          const address = embeddedWallet?.address || '';
          // Get access token
          const token = await getAccessToken();
          // Always get email from privyUser
          let email = privyUser.email?.address || '';
          // Try to fetch user profile from Supabase (table: jumpclash)
          let username = '';
          if (address) {
            const { data } = await supabase
              .from('jumpclash')
              .select('username,email')
              .eq('wallet', address)
              .single();
            if (data) {
              username = data.username;
              // Prefer email from db if present, else privy
              email = data.email || email;
            }
          }
          setUser((prev) => ({
            ...prev,
            isLoggedIn: true,
            address,
            token,
            username,
            email,
            monBalance: prev.monBalance || '0.00',
          }));
        } catch (error) {
          console.error('Error setting up user:', error);
        }
      } else {
        setUser({
          isLoggedIn: false,
          username: '',
          address: '',
          token: '',
          monBalance: '0.00',
          email: '',
        });
      }
    };
    updateUserState();
  }, [ready, authenticated, privyUser, getAccessToken]);

  // Allow username and monBalance to be set after login
  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData, monBalance: prev.monBalance || '0.00' }));
  };

  const updateMonBalance = (monBalance) => {
    setUser((prev) => ({ ...prev, monBalance }));
  };

  const logout = () => {
    setUser({
      isLoggedIn: false,
      username: '',
      address: '',
      token: '',
      monBalance: '0.00',
      email: '',
    });
  };

  return (
    <UserContext.Provider value={{ user, updateUser, updateMonBalance, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext); 