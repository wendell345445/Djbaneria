import type { Metadata } from "next";
import React from "react";
import Script from "next/script";
import { MarketingAttributionCapture } from "@/components/marketing-attribution-capture";
import { MetaPixelProvider } from "@/components/meta-pixel-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "DJ Banner AI",
  description: "Crie banners profissionais para DJs com IA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta
          name="google-adsense-account"
          content="ca-pub-1749884996022733"
        />

        <Script
          id="google-adsense"
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1749884996022733"
          crossOrigin="anonymous"
        />
      </head>

      <body
        style={{
          margin: 0,
          fontFamily: "Inter, Arial, sans-serif",
          background: "#0b0b12",
          color: "#fff",
        }}
      >
        <MarketingAttributionCapture />
        <MetaPixelProvider />
        {children}
      </body>
    </html>
  );
}
