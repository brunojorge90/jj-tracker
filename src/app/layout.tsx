import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "Jiu Jitsu Tracker",
  description: "Controle de presença — Bruno & Fabiola",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;900&family=Noto+Serif+JP:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[color:var(--dojo-bg)] text-[color:var(--dojo-text)] antialiased">
        <div className="dojo-bg-mesh" aria-hidden="true" />
        <div className="dojo-tatami" aria-hidden="true" />
        <div className="dojo-grain" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
