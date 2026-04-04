import { z } from "zod";

// ============================================================================
// TYPES & VALIDATION
// ============================================================================

export const RouteRequestSchema = z.object({
  fromChainId: z.number().positive(),
  toChainId: z.number().positive(),
  fromTokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  toTokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  fromAmount: z.string().regex(/^\d+$/),
  fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  slippage: z.number().min(0.01).max(1).optional(),
});

export type RouteRequest = z.infer<typeof RouteRequestSchema>;

export interface RefuelRequest {
  fromChainId: number;
  toChainId: number;
  fromAddress: string;
  toAddress: string;
  fromAmount: string;
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

// ============================================================================
// CONFIG
// ============================================================================

const CONFIG = {
  API_BASE: "https://li.quest/v1",
  API_TIMEOUT_MS: 8000,
  MAX_RETRIES: 2, 
  RETRY_DELAY_MS: 1000,
  FEE_WALLET: process.env.NEXT_PUBLIC_LIFI_FEE_WALLET || "0xf60EA8a04555D87c9b252096cE98197f87cC080e",
  FEE_PERCENTAGE: 0.0015, // 15 bps
  MIN_GAS_USD: {
    1: 5.0,
    137: 0.1,
    56: 0.2,
    42161: 0.5,
    10: 0.2,
    8453: 0.2,
  } as Record<number, number>,
  CHAIN_GAS_SYMBOL: {
    1: "ETH",
    137: "MATIC",
    56: "BNB",
    42161: "ETH",
    10: "ETH",
    8453: "ETH",
  } as Record<number, string>,
} as const;
export const MIN_GAS_USD = CONFIG.MIN_GAS_USD;
export const CHAIN_GAS_SYMBOL = CONFIG.CHAIN_GAS_SYMBOL;

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class LiFiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "LiFiError";
  }
}

class Logger {
  private isDev = process.env.NODE_ENV === "development";

  error(msg: string, err?: unknown) {
    console.error(`[LiFi Error] ${msg}`, err);
  }

  warn(msg: string, data?: unknown) {
    if (this.isDev) console.warn(`[LiFi Warn] ${msg}`, data);
  }

  info(msg: string, data?: unknown) {
    if (this.isDev) console.log(`[LiFi Info] ${msg}`, data);
  }
}

const logger = new Logger();

// ============================================================================
// UTILITIES
// ============================================================================

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = CONFIG.MAX_RETRIES
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text().catch(() => "Unknown error");
      throw new LiFiError(
        "API_ERROR",
        `LiFi API returned ${response.status}: ${error}`,
        response.status
      );
    }

    return response;
  } catch (err) {
    clearTimeout(timeout);

    if (err instanceof TypeError && err.message.includes("aborted")) {
      throw new LiFiError("TIMEOUT", `Request timeout after ${CONFIG.API_TIMEOUT_MS}ms`);
    }

    if (err instanceof LiFiError) throw err;

    if (retries > 0) {
      logger.warn(`Request failed, retrying... (${CONFIG.MAX_RETRIES - retries + 1}/${CONFIG.MAX_RETRIES})`);
      await new Promise((resolve) => setTimeout(resolve, CONFIG.RETRY_DELAY_MS));
      return fetchWithRetry(url, options, retries - 1);
    }

    throw new LiFiError("NETWORK_ERROR", `Failed to fetch after ${CONFIG.MAX_RETRIES} retries`, 0, err);
  }
}

function validateApiResponse<T>(data: unknown, requiredFields: string[]): T {
  if (!data || typeof data !== "object") {
    throw new LiFiError("INVALID_RESPONSE", "API response is not an object");
  }

  const obj = data as Record<string, unknown>;
  const missing = requiredFields.filter((field) => !(field in obj));

  if (missing.length > 0) {
    throw new LiFiError("MISSING_FIELDS", `Missing required fields: ${missing.join(", ")}`);
  }

  return data as T;
}

// ============================================================================
// GAS CHECKING
// ============================================================================

export async function checkDestinationGas(
  walletAddress: string,
  chainId: number
): Promise<{ hasGas: boolean; balanceUSD: number }> {
  try {
    const nativeToken = "0x0000000000000000000000000000000000000000";

    // Fetch token price
    const priceUrl = `${CONFIG.API_BASE}/token?chain=${chainId}&token=${nativeToken}`;
    const priceRes = await fetchWithRetry(priceUrl);
    const priceData = validateApiResponse(await priceRes.json(), ["priceUSD"]);
    const priceUSD = parseFloat((priceData as any).priceUSD ?? "0");

    // Fetch wallet balance
    const balUrl = `${CONFIG.API_BASE}/balances/${walletAddress}?chains=${chainId}`;
    const balRes = await fetchWithRetry(balUrl);
    const balData = await balRes.json();

    if (!balData || typeof balData !== "object") {
      throw new LiFiError("INVALID_BALANCE_DATA", "Unexpected balance response format");
    }

    const chainBalances = (balData as any)[chainId] ?? [];
    const nativeBal = Array.isArray(chainBalances)
      ? chainBalances.find((b: any) => b?.address === nativeToken)
      : null;

    const balanceUSD = parseFloat(nativeBal?.amount ?? "0") * priceUSD;
    const minRequired = CONFIG.MIN_GAS_USD[chainId] ?? 0.2;

    return { hasGas: balanceUSD >= minRequired, balanceUSD };
  } catch (err) {
    logger.error("Failed to check destination gas", err);
    // Fail-safe: allow user to proceed, they'll find out if gas is insufficient
    return { hasGas: true, balanceUSD: 0 };
  }
}

// ============================================================================
// REFUEL QUOTES
// ============================================================================

export async function getRefuelQuote(req: RefuelRequest): Promise<RouteResult | null> {
  try {
    const params = new URLSearchParams({
      fromChain: String(req.fromChainId),
      toChain: String(req.toChainId),
      fromToken: "0x0000000000000000000000000000000000000000",
      toToken: "0x0000000000000000000000000000000000000000",
      fromAmount: req.fromAmount,
      fromAddress: req.fromAddress,
      toAddress: req.toAddress,
      integrator: "multimesh",
    });

    const url = `${CONFIG.API_BASE}/quote?${params}`;
    const res = await fetchWithRetry(url);
    const data = validateApiResponse(await res.json(), ["estimate", "id"]);

    const refuelData = data as any;
    return {
      id: refuelData.id,
      tool: refuelData.tool ?? "refuel",
      fromAmount: refuelData.estimate.fromAmount,
      toAmount: refuelData.estimate.toAmount,
      toAmountUSD: refuelData.estimate.toAmountUSD ?? "0",
      gasCostUSD: refuelData.estimate.gasCosts?.[0]?.amountUSD ?? "0",
      executionDuration: refuelData.estimate.executionDuration ?? 0,
      steps: refuelData.includedSteps ?? [],
      tags: ["REFUEL"],
      action: refuelData.action,
      estimate: refuelData.estimate,
      transactionRequest: refuelData.transactionRequest,
    };
  } catch (err) {
    logger.error("Failed to get refuel quote", err);
    return null;
  }
}

// ============================================================================
// ROUTE FETCHING
// ============================================================================

async function fetchQuote(req: RouteRequest): Promise<RouteResult | null> {
  try {
    const params = new URLSearchParams({
      fromChain: String(req.fromChainId),
      toChain: String(req.toChainId),
      fromToken: req.fromTokenAddress,
      toToken: req.toTokenAddress,
      fromAmount: req.fromAmount,
      fromAddress: req.fromAddress ?? CONFIG.FEE_WALLET,
      slippage: String(req.slippage ?? 0.05),
      maxPriceImpact: "0.5",
      allowDestinationCall: "true",
      integrator: "multimesh",
      fee: String(CONFIG.FEE_PERCENTAGE),
    });

    const url = `${CONFIG.API_BASE}/quote?${params}`;
    const res = await fetchWithRetry(url);
    const data = validateApiResponse(await res.json(), ["estimate"]);

    const quoteData = data as any;
    return {
      id: quoteData.id ?? "quote",
      tool: quoteData.tool ?? quoteData.toolDetails?.key ?? "unknown",
      fromAmount: quoteData.estimate.fromAmount,
      toAmount: quoteData.estimate.toAmount,
      toAmountUSD: quoteData.estimate.toAmountUSD ?? "0",
      gasCostUSD: quoteData.estimate.gasCosts?.[0]?.amountUSD ?? "0",
      executionDuration: quoteData.estimate.executionDuration ?? 0,
      steps: quoteData.includedSteps ?? [],
      tags: ["RECOMMENDED"],
      action: quoteData.action,
      estimate: quoteData.estimate,
      transactionRequest: quoteData.transactionRequest,
    };
  } catch (err) {
    logger.warn("Quote fetch failed, trying advanced routes", err);
    return null;
  }
}

async function fetchAdvancedRoutes(req: RouteRequest): Promise<RouteResult | null> {
  try {
    const body = {
      fromChainId: req.fromChainId,
      toChainId: req.toChainId,
      fromTokenAddress: req.fromTokenAddress,
      toTokenAddress: req.toTokenAddress,
      fromAmount: req.fromAmount,
      fromAddress: req.fromAddress ?? CONFIG.FEE_WALLET,
      toAddress: req.fromAddress ?? CONFIG.FEE_WALLET,
      options: {
        slippage: req.slippage ?? 0.05,
        maxPriceImpact: 0.5,
        allowSwitchChain: true,
        allowDestinationCall: true,
        order: "CHEAPEST",
        integrator: "multimesh",
        fee: CONFIG.FEE_PERCENTAGE,
        bridges: { deny: [] },
        exchanges: { deny: [] },
      },
    };

    const url = `${CONFIG.API_BASE}/advanced/routes`;
    const res = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = validateApiResponse(await res.json(), ["routes"]);
    const advData = data as any;

    if (!Array.isArray(advData.routes) || advData.routes.length === 0) {
      throw new LiFiError("NO_ROUTES", "No routes returned from advanced routes API");
    }

    const best = advData.routes[0];
    const firstStep = best.steps?.[0];
    const lastStep = best.steps?.[best.steps.length - 1];

    return {
      id: best.id ?? "advanced",
      tool: firstStep?.tool ?? "multihop",
      fromAmount: best.fromAmount ?? firstStep?.estimate?.fromAmount ?? "0",
      toAmount: best.toAmount ?? lastStep?.estimate?.toAmount ?? "0",
      toAmountUSD: best.toAmountUSD ?? "0",
      gasCostUSD: best.gasCostUSD ?? firstStep?.estimate?.gasCosts?.[0]?.amountUSD ?? "0",
      executionDuration:
        best.steps?.reduce((sum: number, s: any) => sum + (s.estimate?.executionDuration ?? 0), 0) ?? 0,
      steps: best.steps ?? [],
      tags: ["RECOMMENDED"],
      action: firstStep?.action,
      estimate: firstStep?.estimate,
      transactionRequest: firstStep?.transactionRequest,
    };
  } catch (err) {
    logger.error("Advanced routes fetch failed", err);
    return null;
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

async function fetchSwapApiFallback(req: RouteRequest): Promise<RouteResult | null> {
  // Only for same-chain swaps
  if (req.fromChainId !== req.toChainId) return null;
  try {
    const params = new URLSearchParams({
      tokenIn: req.fromTokenAddress,
      tokenOut: req.toTokenAddress,
      amount: req.fromAmount,
      sender: req.fromAddress ?? CONFIG.FEE_WALLET,
      slippage: String((req.slippage ?? 0.05) * 100),
    });
    const url = `https://api.swapapi.dev/v1/swap/${req.fromChainId}?${params}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !json?.data?.tx) return null;
    const d = json.data;
    return {
      id: "swapapi-fallback",
      tool: d.dex ?? "DEX",
      fromAmount: d.amountIn ?? req.fromAmount,
      toAmount: d.expectedAmountOut ?? "0",
      toAmountUSD: "0",
      gasCostUSD: "0",
      executionDuration: 30,
      steps: [],
      tags: ["RECOMMENDED"],
      action: {
        fromToken: { address: req.fromTokenAddress, symbol: "", decimals: 18, chainId: req.fromChainId },
        toToken: { address: req.toTokenAddress, symbol: "", decimals: 18, chainId: req.toChainId },
        fromAmount: req.fromAmount,
        fromChainId: req.fromChainId,
        toChainId: req.toChainId,
      },
      estimate: {
        fromAmount: d.amountIn ?? req.fromAmount,
        toAmount: d.expectedAmountOut ?? "0",
        approvalAddress: d.tx.to,
        executionDuration: 30,
        gasCosts: [{ amountUSD: "0" }],
      },
      transactionRequest: {
        to: d.tx.to,
        data: d.tx.data,
        value: d.tx.value ?? "0",
        gasLimit: d.tx.gas ?? "300000",
        gasPrice: d.tx.gasPrice ?? "0",
        chainId: req.fromChainId,
        from: req.fromAddress ?? CONFIG.FEE_WALLET,
      },
    };
  } catch {
    return null;
  }
}

export async function getRoutes(req: RouteRequest): Promise<RouteResult[]> {
  try {
    RouteRequestSchema.parse(req);

    const [quote, advanced] = await Promise.allSettled([
      fetchQuote(req),
      fetchAdvancedRoutes(req),
    ]).then((results) => [
      results[0].status === "fulfilled" ? results[0].value : null,
      results[1].status === "fulfilled" ? results[1].value : null,
    ]);

    if (quote) return [quote];
    if (advanced) return [advanced];

    // LI.FI found nothing — try SwapAPI for same-chain tokens
    const swapApiFallback = await fetchSwapApiFallback(req);
    if (swapApiFallback) return [swapApiFallback];

    throw new LiFiError(
      "NO_ROUTES",
      "No route found for this pair. The token may not be supported by any available bridge."
    );
  } catch (err) {
    if (err instanceof LiFiError) throw err;
    logger.error("getRoutes failed", err);
    throw new LiFiError("UNKNOWN", "Failed to get routes", 0, err);
  }
}

export function getRiskLabel(
  tags: string[]
): { label: string; color: string; score: number } {
  if (tags.includes("RECOMMENDED")) return { label: "Low Risk", color: "#00E5FF", score: 1 };
  if (tags.includes("CHEAPEST")) return { label: "Budget Route", color: "#FFA500", score: 2 };
  if (tags.includes("FASTEST")) return { label: "Fast Route", color: "#90EE90", score: 2 };
  return { label: "Standard", color: "#4A5568", score: 3 };
}