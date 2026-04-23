import type { Metadata } from "next";
import React from "react";
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
      <body
        style={{
          margin: 0,
          fontFamily: "Inter, Arial, sans-serif",
          background: "#0b0b12",
          color: "#fff",
        }}
      >
        {children}
      </body>
    </html>
  );
}
