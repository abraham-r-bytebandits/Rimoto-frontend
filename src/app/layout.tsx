import React from "react";

/**
 * RootLayout — a simple wrapper for page content.
 * Fonts are loaded via Google Fonts CSS @import in globals.css,
 * and mapped to Tailwind tokens (font-sans / font-display) there.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full flex flex-col font-sans antialiased">
      {children}
    </div>
  );
}
