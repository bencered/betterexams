import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/app/components/Breadcrumb";
import {
  certSlugToCode,
  certCodeToSlug,
  certCodeToName,
  subjectIdToSlug,
  getActiveSubjectsForCert,
  getSubjectName,
  getAllSubjectYears,
  getDocCountForCert,
  getDocCountForSubject,
  getYearRangeForCert,
  type CertCode,
} from "@/lib/exam-utils";

const BASE_URL = "https://betterexams.ie";

interface PageParams {
  cert: string;
}

export function generateStaticParams(): PageParams[] {
  return [
    { cert: "leaving-cert" },
    { cert: "junior-cert" },
    { cert: "leaving-cert-applied" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { cert } = await params;
  const certCode = certSlugToCode[cert] as CertCode | undefined;
  if (!certCode) return {};

  const certName = certCodeToName[certCode];
  const yearRange = getYearRangeForCert(certCode);
  const title = `${certName} Past Papers - All Subjects | Better Exams`;
  const description = `Browse ${certName} past papers and marking schemes for all subjects. Free access to exam papers from ${yearRange.min} to ${yearRange.max}, sourced from examinations.ie.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/${cert}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${cert}`,
      type: "website",
      siteName: "Better Exams",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CertIndexPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { cert } = await params;
  const certCode = certSlugToCode[cert] as CertCode | undefined;
  if (!certCode) notFound();

  const certName = certCodeToName[certCode];
  const certSlug = certCodeToSlug[certCode];
  const subjectIds = getActiveSubjectsForCert(certCode);
  const totalDocs = getDocCountForCert(certCode);
  const yearRange = getYearRangeForCert(certCode);

  const subjects = subjectIds
    .map((id) => ({
      id,
      name: getSubjectName(id),
      slug: subjectIdToSlug[id],
      yearCount: getAllSubjectYears(certCode, id).length,
      docCount: getDocCountForSubject(certCode, id),
    }))
    .filter((s) => s.slug)
    .sort((a, b) => a.name.localeCompare(b.name));

  const faqs = [
    {
      question: `Where can I find ${certName} past papers?`,
      answer: `Better Exams provides free access to all ${certName} past papers and marking schemes from ${yearRange.min} to ${yearRange.max}. All papers are sourced directly from the State Examinations Commission (examinations.ie).`,
    },
    {
      question: `How many ${certName} subjects have past papers available?`,
      answer: `There are past papers available for ${subjects.length} ${certName} subjects, with a total of ${totalDocs.toLocaleString()} documents including exam papers, marking schemes, and deferred exams.`,
    },
    {
      question: `Are ${certName} marking schemes available?`,
      answer: `Yes. Most ${certName} subjects have marking schemes available alongside the exam papers. These are official marking schemes published by the State Examinations Commission.`,
    },
    {
      question: `What years are available for ${certName} past papers?`,
      answer: `${certName} past papers are available from ${yearRange.min} to ${yearRange.max}. The exact years available vary by subject.`,
    },
  ];

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${certName} Past Papers`,
    description: `Browse all ${certName} past papers and marking schemes.`,
    url: `${BASE_URL}/${certSlug}`,
    isPartOf: { "@type": "WebSite", name: "Better Exams", url: BASE_URL },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: subjects.length,
      itemListElement: subjects.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${s.name} Past Papers`,
        url: `${BASE_URL}/${certSlug}/${s.slug}`,
      })),
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: `${certName} Past Papers`, href: `/${certSlug}` },
        ]}
      />

      <h1 className="text-3xl font-bold text-white mb-3">
        {certName} Past Papers
      </h1>

      <p className="text-zinc-300 text-lg mb-2">
        Browse and download free {certName} past papers and marking schemes for
        all {subjects.length} subjects. Better Exams provides past papers
        from {yearRange.min} to {yearRange.max}, sourced directly from the State
        Examinations Commission at examinations.ie.
      </p>

      <div className="flex flex-wrap gap-4 mb-8 text-sm text-zinc-400">
        <span>{subjects.length} subjects</span>
        <span className="text-zinc-600">|</span>
        <span>{yearRange.min}&ndash;{yearRange.max}</span>
        <span className="text-zinc-600">|</span>
        <span>{totalDocs.toLocaleString()} documents</span>
      </div>

      <h2 className="text-xl font-semibold text-white mb-4">All Subjects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
        {subjects.map((s) => (
          <Link
            key={s.id}
            href={`/${certSlug}/${s.slug}`}
            className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 hover:border-zinc-600 hover:bg-zinc-800 transition-colors"
          >
            <span className="text-white font-medium">{s.name}</span>
            <span className="text-zinc-500 text-sm">
              {s.yearCount} yrs &middot; {s.docCount} docs
            </span>
          </Link>
        ))}
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3"
            >
              <summary className="cursor-pointer font-medium text-white">
                {faq.question}
              </summary>
              <p className="mt-2 text-zinc-300">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <Link
        href="/"
        className="inline-block py-3 text-blue-400 hover:text-blue-300 underline underline-offset-2"
      >
        &larr; Back to Better Exams
      </Link>
    </main>
  );
}
