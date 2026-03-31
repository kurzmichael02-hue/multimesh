"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const path = usePathname();
  return (
    <nav style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(4,6,14,0.95)", backdropFilter:"blur(12px)", padding:"0 28px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <Link href="/" style={{ textDecoration:"none" }}>
        <span style={{ fontSize:16, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", color:"#EEF2FF" }}>MULTI</span>
        <span style={{ fontSize:16, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", color:"#818CF8" }}>MESH</span>
      </Link>
      <div style={{ display:"flex", gap:24, alignItems:"center" }}>
        {[
          { href:"/", label:"App" },
          { href:"/points", label:"Points ✦" },
          { href:"/refuel", label:"Refuel" },
          { href:"/docs", label:"Docs" },
        ].map(({ href, label }) => (
          <Link key={href} href={href} style={{ fontSize:13, fontWeight:500, color: path === href ? "#818CF8" : "#6B7FA3", textDecoration:"none" }}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}