import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 920, width: "100%", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, padding: 32, background: "rgba(255,255,255,0.04)" }}>
        <p style={{ opacity: 0.7, letterSpacing: 2, textTransform: "uppercase", fontSize: 12 }}>DJ Banner AI</p>
        <h1 style={{ fontSize: 52, lineHeight: 1.05, margin: "12px 0 16px" }}>Crie banners profissionais para DJs com IA</h1>
        <p style={{ fontSize: 18, opacity: 0.82, maxWidth: 700 }}>
          Projeto inicial focado em geração de banner completo por IA, com assinatura mensal e créditos por uso.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <Link href="/dashboard" style={{ padding: "14px 18px", background: "#fff", color: "#000", borderRadius: 14, textDecoration: "none", fontWeight: 700 }}>
            Abrir dashboard
          </Link>
          <Link href="/dashboard/banners/new" style={{ padding: "14px 18px", background: "rgba(255,255,255,0.08)", color: "#fff", borderRadius: 14, textDecoration: "none", fontWeight: 700 }}>
            Novo banner
          </Link>
        </div>
      </div>
    </main>
  );
}
