import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Intelligence",
  description: "Document Intelligence Service",
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
