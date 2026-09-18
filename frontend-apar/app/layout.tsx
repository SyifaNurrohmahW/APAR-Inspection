import type { Metadata } from "next";
import "./globals.css";
import FeedbackHost from "./components/FeedbackHost";

export const metadata: Metadata = {
  title: {
    default: "APAR Inspection - Sistem Pemeliharaan APAR",
    template: "%s | APAR Inspection"
  },
  description: "Sistem manajemen inspeksi dan pemeliharaan APAR",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        {children}
        <FeedbackHost />
      </body>
    </html>
  );
}
