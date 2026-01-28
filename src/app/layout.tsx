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

// Schema markup for the website
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Better Exams",
  alternateName: "BetterExams.ie",
  url: "https://betterexams.ie",
  description: "Free access to all Leaving Cert and Junior Cert past papers and marking schemes.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://betterexams.ie/?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Better Exams",
  url: "https://betterexams.ie",
  logo: "https://betterexams.ie/favicon.ico",
  description: "Free educational resource providing Leaving Cert and Junior Cert past exam papers and marking schemes for Irish students.",
  sameAs: [
    "https://github.com/General-Mudkip/betterexams"
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
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
