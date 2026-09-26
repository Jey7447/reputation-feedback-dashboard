import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reputation & Feedback Intelligence",
  description: "Feedback intelligence dashboard for multi-location auto repair operations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}