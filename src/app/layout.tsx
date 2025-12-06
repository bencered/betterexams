import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from './contexts/Providers';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Better Exams | Past Papers Made Easy",
  keywords: "examinations.ie, exams, leaving cert, junior cert, past papers",
  description:
    "The best way to search for past leaving cert exam papers and marking schemes sourced from examinations.ie's material archive.",
  openGraph: {
    title: "Better Exams | Past Papers Made Easy",
    description:
      "The best way to search for past leaving cert exam papers and marking schemes sourced from examinations.ie's material archive.",
    url: "https://betterexams.ie",
    type: "website",
    siteName: "Better Exams",
    images: [
      {
        url: "https://betterexams.ie/better_exams_preview.jpg",
        width: 1200,
        height: 630,
        alt: "Better Exams | Past Papers Made Easy",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
      <Analytics />
      <SpeedInsights />
    </html>
  );
}
