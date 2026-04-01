"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://fommgavmoligvesyxbmx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvbW1nYXZtb2xpZ3Zlc3l4Ym14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjg5NzQsImV4cCI6MjA4ODY0NDk3NH0.0-7VmvjoqXUYQ2AoMFCgiJEI7X9xYxN0DAG2KrkOk0w"
);

interface LeaderboardEntry {
  wallet: string;
  total_swaps: number;
  total_fees_usd: number;
  total_points: number;
  last_swap: string;
}

interface UserStats {
  total_swaps: number;
  total_fees_usd: number;
  total_points: number;
  rank: number;
}

function truncate(addr: string) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function fmtPoints(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function getRankBadge(rank: number) {
  if (rank === 1) return { label: "1", color: "#FFD700" };
  if (rank === 2) return { label: "2", color: "#C0C0C0" };
  if (rank === 3) return { label: "3", color: "#CD7F32" };
  return { label: `${rank}`, color: "#4B5A72" };
}

export default function PointsPage() {
  const { address } = useAccount();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralInput, setReferralInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"leaderboard" | "my-points">("leaderboard");

  useEffect(() => { fetchLeaderboard(); }, []);
  useEffect(() => {
    if (address) { fetchUserStats(address); fetchOrCreateReferralCode(address); }
  }, [address]);

  async function fetchLeaderboard() {
    setLoading(true);
    const { data } = await supabase.from("mm_leaderboard").select("*").limit(100);
    setLeaderboard(data ?? []);
    setLoading(false);
  }

  async function fetchUserStats(wallet: string) {
    const { data: allData } = await supabase.from("mm_leaderboard").select("wallet, total_points").order("total_points", { ascending: false });
    const rank = (allData ?? []).findIndex((d: any) => d.wallet.toLowerCase() === wallet.toLowerCase()) + 1;
    const { data } = await supabase.from("mm_leaderboard").select("*").ilike("wallet", wallet).single();
    if (data) setUserStats({ ...data, rank: rank || (allData?.length ?? 0) + 1 });
    else setUserStats({ total_swaps: 0, total_fees_usd: 0, total_points: 0, rank: (allData?.length ?? 0) + 1 });
  }

  async function fetchOrCreateReferralCode(wallet: string) {
    const { data } = await supabase.from("mm_referrals").select("code").ilike("referrer_wallet", wallet).is("referred_wallet", null).limit(1).single();
    if (data?.code) { setReferralCode(data.code); return; }
    const code = wallet.slice(2, 8).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    await supabase.from("mm_referrals").insert({ code, referrer_wallet: wallet, bonus_points: 0 });
    setReferralCode(code);
  }

  async function submitReferral() {
    if (!address || !referralInput.trim()) return;
    const code = referralInput.trim().toUpperCase();
    const { data: ref } = await supabase.from("mm_referrals").select("*").eq("code", code).single();
    if (!ref) { alert("Invalid referral code."); return; }
    if (ref.referrer_wallet.toLowerCase() === address.toLowerCase()) { alert("You can't use your own referral code."); return; }
    await supabase.from("mm_referrals").update({ referred_wallet: address }).eq("code", code);
    setReferralInput("");
    alert("Referral code applied! You'll earn bonus points on your next swap.");
  }

  const referralLink = referralCode ? `${typeof window !== "undefined" ? window.location.origin : "https://themultimesh.com"}?ref=${referralCode}` : null;
  const copyLink = () => { if (referralLink) { navigator.clipboard.writeText(referralLink); setCopied(true); setTimeout(() => setCopied(false), 2000); } };

  return (
    <div style={{ minHeight: "100vh", background: "#04060E", fontFamily: "'DM Sans', sans-serif", color: "#EEF2FF" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        .row-hover:hover { background: rgba(99,102,241,0.04) !important; }
        .tab-btn { transition: all 0.15s; cursor: pointer; }
        .tab-btn:hover { border-color: rgba(99,102,241,0.3) !important; }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .user-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .leaderboard-grid { grid-template-columns: 44px 1fr 64px 80px !important; }
          .leaderboard-vol { display: none !important; }
        }
      `}} />

      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.02) 1px,transparent 1px)", backgroundSize: "72px 72px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: -300, right: -300, width: 700, height: 700, background: "radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 65%)", pointerEvents: "none" }} />

      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(4,6,14,0.95)", backdropFilter: "blur(12px)", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <img src="/logo.jpg" width={48} height={48} style={{ borderRadius: "50%", mixBlendMode: "screen", marginRight: 8 }} />
<span style={{ fontSize:17, fontWeight:700, fontFamily:"'Space Grotesk', sans-serif", color:"#EEF2FF" }}>MULTI</span>
<span style={{ fontSize:17, fontWeight:700, fontFamily:"'Space Grotesk', sans-serif", color:"#818CF8" }}>MESH</span>
        </a>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <a href="/" style={{ fontSize: 13, color: "#6B7FA3", textDecoration: "none", fontWeight: 500 }}>App</a>
          <a href="/refuel" style={{ fontSize: 13, color: "#6B7FA3", textDecoration: "none", fontWeight: 500 }}>Refuel</a>
          <ConnectButton chainStatus="none" showBalance={false} />
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "52px 20px 100px", position: "relative", zIndex: 1 }}>

        <div className="fade-in" style={{ marginBottom: 44, textAlign: "center" }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 2, marginBottom: 14 }}>MULTIMESH POINTS</div>
          <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: -1, lineHeight: 1.1, margin: "0 0 16px" }}>
            Swap. Earn Points.<br />
            <span style={{ background: "linear-gradient(135deg,#818CF8,#C084FC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Get Rewarded.</span>
          </h1>
          <p style={{ fontSize: 15, color: "#6B7FA3", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            Earn 100 points for every $1 in swap fees. Points may be redeemable for future rewards.
          </p>
        </div>

        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { label: "Points per $1 fees", value: "100" },
            { label: "Referral bonus", value: "+25%" },
            { label: "Early user perk", value: "OG" },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(10,12,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "18px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#818CF8", marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["leaderboard", "my-points"] as const).map(t => (
            <button key={t} className="tab-btn" onClick={() => setTab(t)}
              style={{ padding: "8px 18px", borderRadius: 10, background: tab === t ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)", border: tab === t ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.06)", color: tab === t ? "#818CF8" : "#6B7FA3", fontSize: 13, fontWeight: 600 }}>
              {t === "leaderboard" ? "Leaderboard" : "My Points"}
            </button>
          ))}
        </div>

        {tab === "leaderboard" && (
          <div className="fade-in">
            <div style={{ background: "rgba(10,12,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
              <div className="leaderboard-grid" style={{ display: "grid", gridTemplateColumns: "44px 1fr 72px 80px 100px", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                {["#", "Wallet", "Swaps", "Volume", "Points"].map(h => (
                  <div key={h} style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1 }}>{h}</div>
                ))}
              </div>
              {loading ? (
                <div style={{ padding: "40px 20px", textAlign: "center", fontSize: 13, fontFamily: "monospace", color: "#4B5A72" }}>Loading...</div>
              ) : leaderboard.length === 0 ? (
                <div style={{ padding: "60px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>No swaps yet</div>
                  <div style={{ fontSize: 13, color: "#6B7FA3", marginBottom: 16 }}>Be the first to earn points.</div>
                  <a href="/" style={{ display: "inline-block", padding: "10px 22px", borderRadius: 10, background: "#6366F1", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Start Swapping →</a>
                </div>
              ) : leaderboard.map((entry, i) => {
                const badge = getRankBadge(i + 1);
                const isMe = address && entry.wallet.toLowerCase() === address.toLowerCase();
                return (
                  <div key={entry.wallet} className="row-hover leaderboard-grid"
                    style={{ display: "grid", gridTemplateColumns: "44px 1fr 72px 80px 100px", padding: "13px 20px", borderBottom: i < leaderboard.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: isMe ? "rgba(99,102,241,0.04)" : "transparent" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: badge.color, fontFamily: "monospace" }}>{badge.label}</div>
                    <div style={{ fontSize: 13, fontFamily: "monospace", color: isMe ? "#818CF8" : "#A0B0C8" }}>
                      {truncate(entry.wallet)}
                      {isMe && <span style={{ fontSize: 9, marginLeft: 6, background: "rgba(99,102,241,0.15)", color: "#818CF8", padding: "1px 5px", borderRadius: 4, letterSpacing: 0.5 }}>YOU</span>}
                    </div>
                    <div style={{ fontSize: 13, fontFamily: "monospace", color: "#6B7FA3" }}>{entry.total_swaps}</div>
                    <div className="leaderboard-vol" style={{ fontSize: 13, fontFamily: "monospace", color: "#6B7FA3" }}>${parseFloat(entry.total_fees_usd?.toString() ?? "0").toFixed(0)}</div>
                    <div style={{ fontSize: 13, fontFamily: "monospace", color: "#818CF8", fontWeight: 700 }}>{fmtPoints(entry.total_points)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "my-points" && (
          <div className="fade-in">
            {!address ? (
              <div style={{ background: "rgba(10,12,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Connect your wallet</div>
                <div style={{ fontSize: 14, color: "#6B7FA3", marginBottom: 24 }}>Connect to see your points and referral link.</div>
                <ConnectButton />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "rgba(10,12,22,0.9)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 16, padding: "24px 28px" }}>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1, marginBottom: 16 }}>YOUR STATS</div>
                  <div className="user-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
                    {[
                      { label: "Points", value: fmtPoints(userStats?.total_points ?? 0) },
                      { label: "Rank", value: userStats ? `#${userStats.rank}` : "—" },
                      { label: "Swaps", value: userStats?.total_swaps ?? 0 },
                      { label: "Fees Paid", value: `$${parseFloat(userStats?.total_fees_usd?.toString() ?? "0").toFixed(2)}` },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#818CF8", marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif" }}>{s.value}</div>
                        <div style={{ fontSize: 10, fontFamily: "monospace", color: "#4B5A72", letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(10,12,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>How to earn points</div>
                  {[
                    { icon: "⇄", label: "Make a cross-chain swap", pts: "100 pts per $1 in fees" },
                    { icon: "→", label: "Refer friends to MultiMesh", pts: "+25% bonus on their swaps" },
                    { icon: "✓", label: "Use a referral code", pts: "Bonus points on first swap" },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 16, color: "#818CF8" }}>{item.icon}</span>
                        <span style={{ fontSize: 13, color: "#A0B0C8" }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: 12, fontFamily: "monospace", color: "#818CF8" }}>{item.pts}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 14 }}>
                    <a href="/" style={{ display: "inline-block", padding: "10px 22px", borderRadius: 10, background: "#6366F1", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Start Swapping →</a>
                  </div>
                </div>

                {referralLink && (
                  <div style={{ background: "rgba(10,12,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Your Referral Link</div>
                    <div style={{ fontSize: 13, color: "#6B7FA3", marginBottom: 14 }}>Share this. When friends swap, you both earn bonus points.</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1, background: "rgba(4,6,14,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", fontSize: 12, fontFamily: "monospace", color: "#A0B0C8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {referralLink}
                      </div>
                      <button onClick={copyLink} style={{ padding: "10px 18px", borderRadius: 10, background: copied ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", border: copied ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)", color: copied ? "#818CF8" : "#A0B0C8", fontSize: 12, fontFamily: "monospace", cursor: "pointer", whiteSpace: "nowrap" }}>
                        {copied ? "COPIED ✓" : "COPY"}
                      </button>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, fontFamily: "monospace", color: "#4B5A72" }}>
                      Code: <span style={{ color: "#818CF8" }}>{referralCode}</span>
                    </div>
                  </div>
                )}

                <div style={{ background: "rgba(10,12,22,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 24px" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Have a Referral Code?</div>
                  <div style={{ fontSize: 13, color: "#6B7FA3", marginBottom: 14 }}>Enter a friend's code to earn bonus points.</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={referralInput} onChange={e => setReferralInput(e.target.value.toUpperCase())} placeholder="Enter code e.g. AB12CD"
                      style={{ flex: 1, background: "rgba(4,6,14,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", fontSize: 13, fontFamily: "monospace", color: "#EEF2FF", outline: "none" }} />
                    <button onClick={submitReferral} style={{ padding: "10px 20px", borderRadius: 10, background: "#6366F1", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", border: "none", whiteSpace: "nowrap" }}>
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 40, padding: "14px 18px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: 12, fontSize: 12, color: "#6B7FA3", lineHeight: 1.6 }}>
          Points are for tracking purposes only. No token has been issued. Points may or may not be redeemable for future rewards at MultiMesh's discretion.
        </div>
      </div>
    </div>
  );
}