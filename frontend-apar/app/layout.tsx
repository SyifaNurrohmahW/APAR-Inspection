import type { Metadata } from "next";
import "./globals.css";
import FeedbackHost from "./components/FeedbackHost";

export const metadata: Metadata = {
  title: "APAR Inspection",
  description: "Sistem manajemen inspeksi dan pemeliharaan APAR",
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
