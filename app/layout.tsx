import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "مجلة مدارك",
  description: "مجلة شهرية علمية متخصصه في بيان حقيقة الصوفية",
  icons: {
    icon: "/logo3.png",
    shortcut: "/logo3.png",
    apple: "/logo3.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} antialiased`}>{children}</body>
    </html>
  );
}
