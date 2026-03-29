import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, bsc, sepolia, arbitrum, optimism } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "MultiMesh",
  projectId: "29975bd3e0414e493cdfa9979d53cd40",
  chains: [mainnet, polygon, bsc, arbitrum, optimism, sepolia],
  transports: {
    [mainnet.id]:   http("https://eth.llamarpc.com"),
    [polygon.id]:   http("https://polygon.llamarpc.com"),
    [bsc.id]:       http("https://binance.llamarpc.com"),
    [arbitrum.id]:  http("https://arbitrum.llamarpc.com"),
    [optimism.id]:  http("https://optimism.llamarpc.com"),
    [sepolia.id]:   http("https://rpc.sepolia.org"),
  },
  ssr: true,
});

export const SUPPORTED_CHAINS = [
  { id: 1,        name: "Ethereum",  symbol: "ETH",   logo: "⟠", color: "#627EEA" },
  { id: 137,      name: "Polygon",   symbol: "MATIC", logo: "⬡", color: "#8247E5" },
  { id: 56,       name: "BNB Chain", symbol: "BNB",   logo: "◈", color: "#F3BA2F" },
  { id: 42161,    name: "Arbitrum",  symbol: "ETH",   logo: "◎", color: "#28A0F0" },
  { id: 10,       name: "Optimism",  symbol: "ETH",   logo: "◉", color: "#FF0420" },
  { id: 11155111, name: "Sepolia",   symbol: "ETH",   logo: "⟠", color: "#627EEA" },
];

export const SUPPORTED_TOKENS: Record<number, Token[]> = {
  1: [
    { symbol: "ETH",  name: "Ethereum",    address: "0x0000000000000000000000000000000000000000", decimals: 18, logo: "⟠" },
    { symbol: "USDC", name: "USD Coin",    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6,  logo: "◎" },
    { symbol: "USDT", name: "Tether",      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6,  logo: "₮" },
    { symbol: "WBTC", name: "Wrapped BTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8,  logo: "₿" },
  ],
  137: [
    { symbol: "MATIC", name: "Polygon",  address: "0x0000000000000000000000000000000000000000", decimals: 18, logo: "⬡" },
    { symbol: "USDC",  name: "USD Coin", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6,  logo: "◎" },
    { symbol: "USDT",  name: "Tether",   address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6,  logo: "₮" },
  ],
  56: [
    { symbol: "BNB",  name: "BNB",      address: "0x0000000000000000000000000000000000000000", decimals: 18, logo: "◈" },
    { symbol: "USDC", name: "USD Coin", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18, logo: "◎" },
    { symbol: "USDT", name: "Tether",   address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18, logo: "₮" },
  ],
  42161: [
    { symbol: "ETH",  name: "Ethereum", address: "0x0000000000000000000000000000000000000000", decimals: 18, logo: "⟠" },
    { symbol: "USDC", name: "USD Coin", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6,  logo: "◎" },
    { symbol: "USDT", name: "Tether",   address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6,  logo: "₮" },
    { symbol: "ARB",  name: "Arbitrum", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18, logo: "◎" },
  ],
  10: [
    { symbol: "ETH",  name: "Ethereum", address: "0x0000000000000000000000000000000000000000", decimals: 18, logo: "⟠" },
    { symbol: "USDC", name: "USD Coin", address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6,  logo: "◎" },
    { symbol: "USDT", name: "Tether",   address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6,  logo: "₮" },
    { symbol: "OP",   name: "Optimism", address: "0x4200000000000000000000000000000000000042", decimals: 18, logo: "◉" },
  ],
  11155111: [
    { symbol: "ETH", name: "Sepolia ETH", address: "0x0000000000000000000000000000000000000000", decimals: 18, logo: "⟠" },
  ],
};

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo: string;
}