// Monad Testnet Constants
export const MONAD_CONSTANTS = {
  network: {
    name: "Monad Testnet",
    chainId: 10143,
    decimals: 18,
    symbol: "MON",
    rpc: "https://testnet-rpc.monad.xyz",
    explorer: "https://testnet.monadexplorer.com"
  },
  contracts: {
    WMON: "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701"
  }
};

// Format MON balance with proper decimals
export const formatMonBalance = (balance) => {
  try {
    // Return '0.00' for null, undefined, empty string or '0'
    if (!balance || balance === '0') return "0.00";
    
    // Convert to BigInt if it's a string
    let b;
    try {
      b = typeof balance === 'string' ? BigInt(balance) : balance;
    } catch (e) {
      console.error('Error converting balance to BigInt:', e, balance);
      return "0.00";
    }
    
    // If balance is less than 1e14, treat as zero (dust)
    if (b < 100000000000000n) return "0.00";
    
    // Convert from wei to MON (18 decimals)
    // Use string operations to avoid floating point precision issues
    const balanceStr = b.toString();
    
    if (balanceStr.length <= 18) {
      // Less than 1 MON
      const padded = balanceStr.padStart(18, '0');
      const decimalPart = padded.slice(0, padded.length - 18).padStart(1, '0') + '.' + padded.slice(padded.length - 18).padStart(18, '0').substring(0, 4);
      return decimalPart;
    } else {
      // More than 1 MON
      const wholePart = balanceStr.slice(0, balanceStr.length - 18);
      const decimalPart = balanceStr.slice(balanceStr.length - 18).padStart(18, '0').substring(0, 4);
      return `${wholePart}.${decimalPart}`;
    }
  } catch (e) {
    console.error('Error formatting MON balance:', e, balance);
    return "0.00";
  }
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy text: ', error);
    return false;
  }
};

/**
 * Format a wallet address for display
 * @param {string} address - The wallet address
 * @param {number} startChars - Number of starting characters to show
 * @param {number} endChars - Number of ending characters to show
 * @returns {string} - Formatted address
 */
export const formatAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Format a timestamp to a readable date/time
 * @param {string|number} timestamp - ISO string or timestamp
 * @returns {string} - Formatted date
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Format a number with commas
 * @param {number} num - The number to format
 * @returns {string} - Formatted number
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}; 