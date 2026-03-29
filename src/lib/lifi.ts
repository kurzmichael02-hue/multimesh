export interface RouteRequest {
  fromChainId: number;
  toChainId: number;
  fromTokenAddress: string;
  toTokenAddress: string;
  fromAmount: string;
  fromAddress?: string;
}

export interface RouteResult {
  id: string;
  tool: string;
  fromAmount: string;
  toAmount: string;
  toAmountUSD: string;
  gasCostUSD: string;
  executionDuration: number;
  steps: RouteStep[];
  tags: string[];
  action?: {
    fromToken: { address: string; symbol: string; decimals: number; chainId: number };
    toToken: { address: string; symbol: string; decimals: number; chainId: number };
    fromAmount: string;
    fromChainId: number;
    toChainId: number;
  };
  estimate?: {
    fromAmount: string;
    toAmount: string;
    approvalAddress: string;
    executionDuration: number;
    gasCosts: { amountUSD: string }[];
  };
  transactionRequest?: {
    to: string;
    data: string;
    value: string;
    gasLimit: string;
    gasPrice: string;
    chainId: number;
    from: string;
  };
}

export interface RouteStep {
  type: string;
  tool: string;
  estimate: {
    fromAmount: string;
    toAmount: string;
    executionDuration: number;
    gasCosts: { amountUSD: string }[];
  };
}

// MultiMesh protocol fee: 15 bps (0.15%)
// Fee is collected via LI.FI's integrator fee parameter
// Wallet receives the fee on every swap
const MULTIMESH_FEE_BPS = 15;
const MULTIMESH_FEE_WALLET = "0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0";

export async function getRoutes(req: RouteRequest): Promise<RouteResult[]> {
  const params = new URLSearchParams({
    fromChain: String(req.fromChainId),
    toChain: String(req.toChainId),
    fromToken: req.fromTokenAddress,
    toToken: req.toTokenAddress,
    fromAmount: req.fromAmount,
    fromAddress: req.fromAddress ?? MULTIMESH_FEE_WALLET,
    slippage: "0.03",
    // LI.FI integrator fee — collected on every swap to our wallet
    integrator: "multimesh",
    fee: "0.0015",
  });

  const res = await fetch(`https://li.quest/v1/quote?${params}`, {
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();

  if (!res.ok) {
    const code = data?.code;
    if (code === "AMOUNT_TOO_HIGH") throw new Error("Amount too high — try a smaller value.");
    if (code === "AMOUNT_TOO_LOW") throw new Error("Amount too low — try a larger value.");
    if (code === "NO_POSSIBLE_ROUTE") throw new Error("No route found for this pair. Try different tokens or chains.");
    if (code === "NOT_FOUND") throw new Error("Token or chain not supported.");
    throw new Error(data?.message ?? "Could not fetch routes.");
  }

  if (!data.estimate) throw new Error("No route found for this pair.");

  const route: RouteResult = {
    id: data.id ?? "quote",
    tool: data.tool ?? data.toolDetails?.key ?? "unknown",
    fromAmount: data.estimate.fromAmount,
    toAmount: data.estimate.toAmount,
    toAmountUSD: data.estimate.toAmountUSD ?? "0",
    gasCostUSD: data.estimate.gasCosts?.[0]?.amountUSD ?? "0",
    executionDuration: data.estimate.executionDuration ?? 0,
    steps: data.includedSteps ?? [],
    tags: ["RECOMMENDED"],
    action: data.action,
    estimate: data.estimate,
    transactionRequest: data.transactionRequest,
  };

  return [route];
}

export function getRiskLabel(tags: string[]): { label: string; color: string; score: number } {
  if (tags.includes("RECOMMENDED")) return { label: "Low Risk",    color: "#00E5FF", score: 1 };
  if (tags.includes("CHEAPEST"))    return { label: "Medium Risk", color: "#F3BA2F", score: 2 };
  if (tags.includes("FASTEST"))     return { label: "Fast Route",  color: "#7B61FF", score: 2 };
  return { label: "Standard", color: "#4A5568", score: 3 };
}