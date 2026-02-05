import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/app/components/Breadcrumb";
import {
  certSlugToCode,
  certCodeToSlug,
  certCodeToName,
  subjectSlugToId,
  subjectIdToSlug,
  getSubjectName,
  getActiveSubjectsForCert,
  getAllSubjectYears,
  getDocCountForSubject,
  getDocCountForYear,
  type CertCode,
} from "@/lib/exam-utils";

const BASE_URL = "https://betterexams.ie";

interface PageParams {
  cert: string;
  subject: string;
}

export function generateStaticParams(): PageParams[] {
  const paramsList: PageParams[] = [];
  for (const certCode of ["lc", "jc", "lb"] as CertCode[]) {
    const certSlug = certCodeToSlug[certCode];
    for (const subjectId of getActiveSubjectsForCert(certCode)) {
      const slug = subjectIdToSlug[subjectId];
      if (slug) paramsList.push({ cert: certSlug, subject: slug });
    }
  }
  return paramsList;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { cert, subject } = await params;
  const certCode = certSlugToCode[cert] as CertCode | undefined;
  if (!certCode) return {};
  const subjectId = subjectSlugToId[subject];
  if (!subjectId) return {};

  const certName = certCodeToName[certCode];
  const subjectName = getSubjectName(subjectId);
  const years = getAllSubjectYears(certCode, subjectId).sort();

  const title = `${subjectName} - ${certName} Past Papers | Better Exams`;
  const description = `Download ${certName} ${subjectName} past papers and marking schemes from ${years[0]} to ${years[years.length - 1]}. Free access to ${years.length} years of exam papers.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/${cert}/${subject}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${cert}/${subject}`,
      type: "website",
      siteName: "Better Exams",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SubjectIndexPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { cert, subject } = await params;
  const certCode = certSlugToCode[cert] as CertCode | undefined;
  if (!certCode) notFound();

  const subjectId = subjectSlugToId[subject];
  if (!subjectId) notFound();

  const subjectIds = getActiveSubjectsForCert(certCode);
  if (!subjectIds.includes(subjectId)) notFound();

  const certName = certCodeToName[certCode];
  const certSlug = certCodeToSlug[certCode];
  const subjectName = getSubjectName(subjectId);
  const subjectSlug = subjectIdToSlug[subjectId];
  const years = getAllSubjectYears(certCode, subjectId).sort().reverse();
  const totalDocs = getDocCountForSubject(certCode, subjectId);

  const yearList = years.map((y) => ({
    year: y,
    docCount: getDocCountForYear(certCode, subjectId, y),
  }));

  // Prev/next subject navigation
  const allSubjects = subjectIds
    .map((id) => ({ id, name: getSubjectName(id), slug: subjectIdToSlug[id] }))
    .filter((s) => s.slug)
    .sort((a, b) => a.name.localeCompare(b.name));
  const currentIndex = allSubjects.findIndex((s) => s.id === subjectId);
  const prevSubject = currentIndex > 0 ? allSubjects[currentIndex - 1] : null;
  const nextSubject =
    currentIndex < allSubjects.length - 1
      ? allSubjects[currentIndex + 1]
      : null;

  const faqs = [
    {
      question: `Where can I find ${certName} ${subjectName} past papers?`,
      answer: `Better Exams has ${certName} ${subjectName} past papers from ${years[years.length - 1]} to ${years[0]}. All ${totalDocs} documents are free to download, sourced directly from examinations.ie.`,
    },
    {
      question: `How many years of ${subjectName} papers are available?`,
      answer: `There are ${years.length} years of ${certName} ${subjectName} past papers available, spanning from ${years[years.length - 1]} to ${years[0]}.`,
    },
    {
      question: `Are ${subjectName} marking schemes included?`,
      answer: `Yes, marking schemes are available for most years of ${certName} ${subjectName}. Each year page shows all available documents including exam papers, marking schemes, and any deferred papers.`,
    },
  ];

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${certName} ${subjectName} Past Papers`,
    description: `All ${certName} ${subjectName} past papers and marking schemes.`,
    url: `${BASE_URL}/${certSlug}/${subjectSlug}`,
    isPartOf: { "@type": "WebSite", name: "Better Exams", url: BASE_URL },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: years.length,
      itemListElement: years.map((y, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${subjectName} ${y}`,
        url: `${BASE_URL}/${certSlug}/${subjectSlug}/${y}`,
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
          { label: certName, href: `/${certSlug}` },
          {
            label: `${subjectName} Past Papers`,
            href: `/${certSlug}/${subjectSlug}`,
          },
        ]}
      />

      <h1 className="text-3xl font-bold text-white mb-3">
        {certName} {subjectName} Past Papers
      </h1>

      <p className="text-zinc-300 text-lg mb-2">
        Download free {certName} {subjectName} past papers and marking schemes.
        Better Exams has {totalDocs} documents covering {years.length} years
        from {years[years.length - 1]} to {years[0]}, sourced from the State
        Examinations Commission.
      </p>

      <div className="flex flex-wrap gap-4 mb-8 text-sm text-zinc-400">
        <span>{years.length} years</span>
        <span className="text-zinc-600">|</span>
        <span>
          {years[years.length - 1]}&ndash;{years[0]}
        </span>
        <span className="text-zinc-600">|</span>
        <span>{totalDocs} documents</span>
      </div>

      <h2 className="text-xl font-semibold text-white mb-4">
        Available Years
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-12">
        {yearList.map((yl) => (
          <Link
            key={yl.year}
            href={`/${certSlug}/${subjectSlug}/${yl.year}`}
            className="flex flex-col items-center rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 hover:border-zinc-600 hover:bg-zinc-800 transition-colors"
          >
            <span className="text-white font-semibold text-lg">{yl.year}</span>
            <span className="text-zinc-500 text-xs">
              {yl.docCount} documents
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

      <nav className="flex justify-between items-center border-t border-zinc-800 pt-4 mb-8">
        {prevSubject ? (
          <Link
            href={`/${certSlug}/${prevSubject.slug}`}
            className="inline-block py-3 text-blue-400 hover:text-blue-300 text-sm"
          >
            &larr; {prevSubject.name}
          </Link>
        ) : (
          <span />
        )}
        {nextSubject ? (
          <Link
            href={`/${certSlug}/${nextSubject.slug}`}
            className="inline-block py-3 text-blue-400 hover:text-blue-300 text-sm"
          >
            {nextSubject.name} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <Link
        href={`/${certSlug}`}
        className="inline-block py-3 text-blue-400 hover:text-blue-300 underline underline-offset-2"
      >
        &larr; All {certName} subjects
      </Link>
    </main>
  );
}
