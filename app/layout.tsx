import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Abstract — Filter Engine",
  description: "AI-powered image abstraction and stripe filter tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 font-mono h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
