import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, bsc } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "MultiMesh",
  projectId: "multimesh_mvp_project_id",
  chains: [mainnet, polygon, bsc],
  ssr: true,
});

export const SUPPORTED_CHAINS = [
  { id: 1,   name: "Ethereum", symbol: "ETH", logo: "⟠", color: "#627EEA" },
  { id: 137, name: "Polygon",  symbol: "MATIC", logo: "⬡", color: "#8247E5" },
  { id: 56,  name: "BNB Chain", symbol: "BNB", logo: "◈", color: "#F3BA2F" },
];

export const SUPPORTED_TOKENS: Record<number, Token[]> = {
  1: [
    { symbol: "ETH",  name: "Ethereum",   address: "0x0000000000000000000000000000000000000000", decimals: 18, logo: "⟠" },
    { symbol: "USDC", name: "USD Coin",   address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6,  logo: "◎" },
    { symbol: "USDT", name: "Tether",     address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6,  logo: "₮" },
    { symbol: "WBTC", name: "Wrapped BTC",address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8,  logo: "₿" },
  ],
  137: [
    { symbol: "MATIC", name: "Polygon",   address: "0x0000000000000000000000000000000000000000", decimals: 18, logo: "⬡" },
    { symbol: "USDC",  name: "USD Coin",  address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6,  logo: "◎" },
    { symbol: "USDT",  name: "Tether",    address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6,  logo: "₮" },
  ],
  56: [
    { symbol: "BNB",  name: "BNB",        address: "0x0000000000000000000000000000000000000000", decimals: 18, logo: "◈" },
    { symbol: "USDC", name: "USD Coin",   address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18, logo: "◎" },
    { symbol: "USDT", name: "Tether",     address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18, logo: "₮" },
  ],
};

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo: string;
}
