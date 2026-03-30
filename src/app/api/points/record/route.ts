import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  "https://fommgavmoligvesyxbmx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbW1nYXZtb2xpZ3Zlc3l4Ym14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjg5NzQsImV4cCI6MjA4ODY0NDk3NH0.0-7VmvjoqXUYQ2AoMFCgiJEI7X9xYxN0DAG2KrkOk0w"
);

// POST /api/points/record
// Body: { wallet, txHash, fromChain, toChain, fromToken, toToken, amountUSD, feeUSD, referralCode? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, txHash, fromChain, toChain, fromToken, toToken, amountUSD, feeUSD, referralCode } = body;

    if (!wallet || !txHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Calculate points: 100 per $1 in fees
    const feeAmount = parseFloat(feeUSD ?? "0");
    let points = Math.floor(feeAmount * 100);

    // Check for referral bonus (+25%)
    if (referralCode) {
      const { data: ref } = await supabase
        .from("mm_referrals")
        .select("*")
        .eq("code", referralCode.toUpperCase())
        .single();

      if (ref && ref.referrer_wallet.toLowerCase() !== wallet.toLowerCase()) {
        points = Math.floor(points * 1.25);
        // Add bonus to referrer too
        await supabase.from("mm_swaps").insert({
          wallet: ref.referrer_wallet,
          tx_hash: txHash + "_referral_bonus",
          from_chain: "referral",
          to_chain: "referral",
          fee_usd: 0,
          points: Math.floor(feeAmount * 25), // 25 bonus points per $1 of referred swap fees
        });
      }
    }

    const { error } = await supabase.from("mm_swaps").upsert({
      wallet,
      tx_hash: txHash,
      from_chain: fromChain,
      to_chain: toChain,
      from_token: fromToken,
      to_token: toToken,
      amount_usd: parseFloat(amountUSD ?? "0"),
      fee_usd: feeAmount,
      points,
      referral_code: referralCode ?? null,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, points });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}