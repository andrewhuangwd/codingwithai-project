import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Andies",
  description: "Care for your life-dimension Andies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
