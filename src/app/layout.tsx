import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MathBloom — Mathematical Art Generator",
  description:
    "Transform keywords into stunning mathematical art. Rose curves, heart curves, butterfly spirals and more — rendered in real-time.",
  keywords: ["mathematics", "art", "generator", "curves", "visualization"],
  authors: [{ name: "MathBloom" }],
  openGraph: {
    title: "MathBloom — Mathematical Art Generator",
    description: "Type a word. Watch mathematics bloom into art.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body
        className="bg-animated-gradient min-h-screen antialiased"
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
