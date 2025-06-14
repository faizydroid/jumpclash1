import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../lib/UserContext';
import { usePrivy } from '@privy-io/react-auth';
import Button from './Button';
import { formatMonBalance, copyToClipboard, MONAD_CONSTANTS } from '../lib/MonadUtils';

async function fetchMonBalanceRpc(address) {
  try {
    const res = await fetch(MONAD_CONSTANTS.network.rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1
      })
    });
    const data = await res.json();
    if (data && data.result) {
      // data.result is hex string
      const balance = BigInt(data.result).toString();
      console.log('Fetched MON balance:', balance);
      return balance;
    }
  } catch (e) { console.error('MON balance fetch error', e); }
  return null;
}

const Sidebar = () => {
  const { user, logout: userLogout, updateMonBalance } = useUser();
  const { logout: privyLogout } = usePrivy();
  const navigate = useNavigate();
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch MON balance using Monad RPC
  useEffect(() => {
    let isMounted = true;
    const fetchMonBalance = async () => {
      if (!user.address || !isMounted) return;
      setIsLoading(true);
      try {
        const balance = await fetchMonBalanceRpc(user.address);
        if (balance !== null && balance !== undefined && isMounted) {
          const formattedBalance = formatMonBalance(balance);
          updateMonBalance(formattedBalance);
          console.log('Formatted balance:', formattedBalance);
        } else if (isMounted) {
          updateMonBalance('0.00');
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error updating MON balance:', error);
          updateMonBalance('0.00');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    // Fetch immediately on mount or address change
    fetchMonBalance();
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user.address, updateMonBalance]);

  // Manual refresh handler
  const handleRefreshBalance = async () => {
    setIsLoading(true);
    try {
      const balance = await fetchMonBalanceRpc(user.address);
      if (balance !== null && balance !== undefined) {
        const formattedBalance = formatMonBalance(balance);
        updateMonBalance(formattedBalance);
      } else {
        updateMonBalance('0.00');
      }
    } catch (error) {
      updateMonBalance('0.00');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await privyLogout();
    userLogout();
    navigate('/');
  };

  const toggleWallet = () => {
    setIsWalletOpen(!isWalletOpen);
  };

  const handleCopyAddress = async () => {
    const success = await copyToClipboard(user.address);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const openMonadExplorer = () => {
    const explorerUrl = `${MONAD_CONSTANTS.network.explorer}/address/${user.address}`;
    window.open(explorerUrl, '_blank');
  };

  // Ensure we always have a valid display value
  const displayBalance = user.monBalance ? user.monBalance : '0.00';

  return (
    <div className="h-full w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col">
      {/* Top section with user info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-lg">{user.username}</h2>
            <p className="text-xs text-gray-500 truncate max-w-[150px]">
              {user.address.slice(0, 6)}...{user.address.slice(-4)}
            </p>
          </div>
        </div>
        {/* MON Balance */}
        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">MON Balance</p>
            <div className="flex items-center">
              <p className="font-bold text-lg">
                {displayBalance}
                <button
                  onClick={handleRefreshBalance}
                  className="ml-2 text-xs text-blue-500 hover:text-blue-700 focus:outline-none"
                  title="Refresh Balance"
                  disabled={isLoading}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                >
                  &#x21bb;
                </button>
              </p>
              <span className="text-xs ml-1 text-gray-500">MON</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">M</span>
          </div>
        </div>
      </div>
      {/* Middle section with wallet button */}
      <div className="flex-1 p-6">
        <Button 
          onClick={toggleWallet}
          variant="secondary"
          fullWidth
          className="mb-4"
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            Wallet
          </div>
        </Button>
        {/* Wallet popup */}
        {isWalletOpen && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-4">
            <h3 className="font-medium mb-3">Wallet Actions</h3>
            {/* Copy Address Section */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Your MONAD Testnet Address</p>
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <span className="text-xs font-mono truncate max-w-[150px]">{user.address}</span>
                <button 
                  onClick={handleCopyAddress}
                  className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                >
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              
              <Button 
                variant="secondary"
                size="sm"
                fullWidth
                onClick={openMonadExplorer}
              >
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  View in Explorer
                </div>
              </Button>
            </div>
        
          </div>
        )}
      </div>
      {/* Bottom section with logout */}
      <div className="p-6 border-t border-gray-200">
        <Button onClick={handleLogout} variant="danger" fullWidth>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar; 