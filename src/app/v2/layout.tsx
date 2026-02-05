import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Side-by-Side Exam Viewer | Better Exams",
  description:
    "View Leaving Cert and Junior Cert past papers and marking schemes side by side. Desktop exam paper viewer powered by Better Exams.",
  robots: { index: true, follow: true },
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return children;
}
