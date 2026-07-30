import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");

  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title: "Martinova knižnica",
    description: "Osobná knižná polička s titulmi uloženými v Google Keep.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: {
      title: "Martinova knižnica",
      description: "Knihy, ktoré čakajú na prečítanie.",
      images: [{ url: "/og.png", width: 1736, height: 909 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Martinova knižnica",
      description: "Knihy, ktoré čakajú na prečítanie.",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sk">
      <body>{children}</body>
    </html>
  );
}
