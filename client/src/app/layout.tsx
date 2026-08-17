import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicTrack — Report · Track · Resolve",
  description:
    "CivicTrack helps citizens report, track and resolve local civic issues.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
      
    </html>
  );
}

