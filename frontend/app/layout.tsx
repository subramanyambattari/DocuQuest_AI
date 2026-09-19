import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Intelligence",
  description: "Document Intelligence Service",
};

import './globals.css';

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
