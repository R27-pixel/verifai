import { BrowserProvider } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Checks if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  return typeof window.ethereum !== 'undefined';
}

/**
 * Connects to MetaMask and returns the wallet address
 */
export async function connectWallet(): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }
  
  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);
  
  if (accounts.length === 0) {
    throw new Error('No accounts found. Please unlock MetaMask.');
  }
  
  return accounts[0];
}

/**
 * Signs a message with the connected wallet
 */
export async function signMessage(message: string): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed.');
  }
  
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const signature = await signer.signMessage(message);
  
  return signature;
}

/**
 * Simulates sending a transaction (for demo purposes)
 * In production, this would interact with a smart contract
 */
export async function simulateTransaction(hash: string): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed.');
  }
  
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  // For now, just sign the hash as proof of wallet ownership
  const signature = await signer.signMessage(hash);
  
  // Return a simulated transaction ID (in production, this would be a real tx hash)
  return `0x${signature.slice(2, 66)}`;
}
