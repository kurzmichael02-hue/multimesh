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
  fromAmount: string;
  toAmount: string;
  toAmountUSD: string;
  gasCostUSD: string;
  executionDuration: number;
  steps: RouteStep[];
  tags: string[];
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

export async function getRoutes(req: RouteRequest): Promise<RouteResult[]> {
  const params = new URLSearchParams({
    fromChainId: String(req.fromChainId),
    toChainId: String(req.toChainId),
    fromTokenAddress: req.fromTokenAddress,
    toTokenAddress: req.toTokenAddress,
    fromAmount: req.fromAmount,
    ...(req.fromAddress ? { fromAddress: req.fromAddress } : {}),
  });

  const res = await fetch(`https://li.quest/v1/routes?${params}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Failed to fetch routes");
  const data = await res.json();
  return data.routes ?? [];
}

export function getRiskLabel(tags: string[]): { label: string; color: string; score: number } {
  if (tags.includes("RECOMMENDED")) return { label: "Low Risk",    color: "#00E5FF", score: 1 };
  if (tags.includes("CHEAPEST"))    return { label: "Medium Risk", color: "#F3BA2F", score: 2 };
  if (tags.includes("FASTEST"))     return { label: "Fast Route",  color: "#7B61FF", score: 2 };
  return { label: "Standard", color: "#4A5568", score: 3 };
}
