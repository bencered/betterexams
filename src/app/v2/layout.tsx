import { Metadata } from "next";

const title = "Side-by-Side Exam Viewer | Better Exams";
const description =
  "View Leaving Cert and Junior Cert past papers and marking schemes side by side. Desktop exam paper viewer powered by Better Exams.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://betterexams.ie/v2" },
  openGraph: {
    title,
    description,
    url: "https://betterexams.ie/v2",
    type: "website",
    siteName: "Better Exams",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return children;
}
