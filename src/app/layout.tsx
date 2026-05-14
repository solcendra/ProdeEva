import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import { AppProvider } from "@/context/app-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "El Prode de Eva · Bayer",
  description: "¿Le podés ganar a Eva? Prode interno gamificado para impulsar la IA corporativa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} font-sans antialiased`}
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
