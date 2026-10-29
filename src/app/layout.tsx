import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Backdoor | Career Acceleration Command Center",
  description: "High-density command center based on the Three Doors thesis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-canvas text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
