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

const MULTIMESH_FEE_WALLET = "0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0";

// Primary: /v1/quote — fast, single best route
async function fetchQuote(req: RouteRequest): Promise<RouteResult | null> {
  const params = new URLSearchParams({
    fromChain: String(req.fromChainId),
    toChain: String(req.toChainId),
    fromToken: req.fromTokenAddress,
    toToken: req.toTokenAddress,
    fromAmount: req.fromAmount,
    fromAddress: req.fromAddress ?? MULTIMESH_FEE_WALLET,
    slippage: "0.05",
    maxPriceImpact: "0.5",
    allowDestinationCall: "true",
    integrator: "multimesh",
    fee: "0.0015",
  });

  const res = await fetch(`https://li.quest/v1/quote?${params}`, {
    headers: { "Content-Type": "application/json" },
  });

  const data = await res.json();
  if (!res.ok || !data.estimate) return null;

  return {
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
}

// Fallback: /v1/advanced/routes — broader coverage, finds routes /quote misses
// Used for low-liquidity tokens and non-indexed BSC/chain tokens
async function fetchAdvancedRoutes(req: RouteRequest): Promise<RouteResult | null> {
  const body = {
    fromChainId: req.fromChainId,
    toChainId: req.toChainId,
    fromTokenAddress: req.fromTokenAddress,
    toTokenAddress: req.toTokenAddress,
    fromAmount: req.fromAmount,
    fromAddress: req.fromAddress ?? MULTIMESH_FEE_WALLET,
    toAddress: req.fromAddress ?? MULTIMESH_FEE_WALLET,
    options: {
      slippage: 0.05,
      maxPriceImpact: 0.5,
      allowSwitchChain: true,
      allowDestinationCall: true,
      order: "CHEAPEST",
      integrator: "multimesh",
      fee: 0.0015,
      bridges: { deny: [] },
      exchanges: { deny: [] },
    },
  };

  const res = await fetch("https://li.quest/v1/advanced/routes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok || !data.routes?.length) return null;

  const best = data.routes[0];
  const firstStep = best.steps?.[0];
  const lastStep = best.steps?.[best.steps.length - 1];

  return {
    id: best.id ?? "advanced",
    tool: firstStep?.tool ?? "multihop",
    fromAmount: best.fromAmount ?? firstStep?.estimate?.fromAmount ?? "0",
    toAmount: best.toAmount ?? lastStep?.estimate?.toAmount ?? "0",
    toAmountUSD: best.toAmountUSD ?? "0",
    gasCostUSD: best.gasCostUSD ?? firstStep?.estimate?.gasCosts?.[0]?.amountUSD ?? "0",
    executionDuration: best.steps?.reduce((sum: number, s: any) => sum + (s.estimate?.executionDuration ?? 0), 0) ?? 0,
    steps: best.steps ?? [],
    tags: ["RECOMMENDED"],
    action: firstStep?.action,
    estimate: firstStep?.estimate,
    transactionRequest: firstStep?.transactionRequest,
  };
}

export async function getRoutes(req: RouteRequest): Promise<RouteResult[]> {
  // Try fast /quote first
  const quote = await fetchQuote(req);
  if (quote) return [quote];

  // Fallback to /advanced/routes for broader token coverage
  const advanced = await fetchAdvancedRoutes(req);
  if (advanced) return [advanced];

  // Both failed — throw meaningful error
  throw new Error("No route found for this pair. The token may not be supported by any available bridge.");
}

export function getRiskLabel(tags: string[]): { label: string; color: string; score: number } {
  if (tags.includes("RECOMMENDED")) return { label: "Low Risk",    color: "#00E5FF", score: 1 };
  if (tags.includes("CHEAPEST"))    return { label: "Medium Risk", color: "#F3BA2F", score: 2 };
  if (tags.includes("FASTEST"))     return { label: "Fast Route",  color: "#7B61FF", score: 2 };
  return { label: "Standard", color: "#4A5568", score: 3 };
}