import { SwapInterface } from "@/components/SwapInterface";

export default function Home() {
  return (
    <main className="min-h-screen mesh-grid flex flex-col items-center justify-center px-4 py-12">
      <div className="scanline" />

      {/* Glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-mesh-accent/3 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-mesh-accent2/3 rounded-full blur-3xl pointer-events-none" />

      <SwapInterface />

      <p className="mt-8 text-xs font-mono text-mesh-muted/40 text-center">
        Powered by LI.FI · ETH · MATIC · BNB
      </p>
    </main>
  );
}
