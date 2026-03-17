import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clinic CMS",
  description: "Clinic Queue Management frontend",
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
