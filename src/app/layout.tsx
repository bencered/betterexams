import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from './contexts/Providers';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Better Exams | Leaving Cert & Junior Cert Past Papers",
  keywords: "leaving cert past papers, junior cert exam papers, leaving cert maths, leaving cert english, leaving cert irish, leaving cert biology, leaving cert chemistry, leaving cert physics, leaving cert history, leaving cert geography, examinations.ie, SEC exam papers, marking schemes, leaving cert 2024, leaving cert 2023, junior cycle, state exams ireland",
  description:
    "Free access to all Leaving Cert and Junior Cert past papers and marking schemes. Search by subject and year. A better alternative to examinations.ie.",
  openGraph: {
    title: "Better Exams | Leaving Cert & Junior Cert Past Papers",
    description:
      "Free access to all Leaving Cert and Junior Cert past papers and marking schemes. Search by subject and year. A better alternative to examinations.ie.",
    url: "https://betterexams.ie",
    type: "website",
    siteName: "Better Exams",
    images: [
      {
        url: "https://betterexams.ie/better_exams_preview.jpg",
        width: 1200,
        height: 630,
        alt: "Better Exams - Leaving Cert and Junior Cert Past Papers",
      },
    ],
  },
  alternates: {
    canonical: "https://betterexams.ie",
  },
  robots: {
    index: true,
    follow: true,
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
