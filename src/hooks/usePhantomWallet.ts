import { useState, useEffect, useCallback } from "react";

interface PhantomProvider {
  isPhantom: boolean;
  publicKey: { toString: () => string } | null;
  isConnected: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signTransaction: (tx: any) => Promise<any>;
}

function getPhantom(): PhantomProvider | null {
  if (typeof window === "undefined") return null;
  return (window as any)?.solana?.isPhantom ? (window as any).solana : null;
}

export function usePhantomWallet() {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const phantom = getPhantom();
    if (!phantom) return;
    if (phantom.isConnected && phantom.publicKey) {
      setConnected(true);
      setPublicKey(phantom.publicKey.toString());
    }
    const onConnect = (pk: { toString: () => string }) => {
      setConnected(true);
      setPublicKey(pk.toString());
    };
    const onDisconnect = () => { setConnected(false); setPublicKey(null); };
    (phantom as any).on?.("connect", onConnect);
    (phantom as any).on?.("disconnect", onDisconnect);
    return () => {
      (phantom as any).off?.("connect", onConnect);
      (phantom as any).off?.("disconnect", onDisconnect);
    };
  }, []);

  const connect = useCallback(async () => {
    const phantom = getPhantom();
    if (!phantom) { window.open("https://phantom.app/", "_blank"); return; }
    setConnecting(true);
    try {
      const res = await phantom.connect();
      setPublicKey(res.publicKey.toString());
      setConnected(true);
    } catch (e) { console.error(e); }
    setConnecting(false);
  }, []);

  const disconnect = useCallback(async () => {
    const phantom = getPhantom();
    if (!phantom) return;
    await phantom.disconnect();
    setConnected(false);
    setPublicKey(null);
  }, []);

  const hasPhantom = typeof window !== "undefined" && !!(window as any)?.solana?.isPhantom;

  return { connected, publicKey, connecting, connect, disconnect, hasPhantom };
}