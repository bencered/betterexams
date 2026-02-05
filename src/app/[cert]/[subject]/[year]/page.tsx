import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/app/components/Breadcrumb";
import {
  certSlugToCode,
  certCodeToName,
  certCodeToSlug,
  subjectSlugToId,
  subjectIdToSlug,
  categoryCodeToSlug,
  categoryCodeToName,
  getExamData,
  getAllSubjectYears,
  getActiveSubjectsForCert,
  getSubjectName,
  getDocCountForYear,
  type CertCode,
} from "@/lib/exam-utils";

const BASE_URL = "https://betterexams.ie";

interface PageParams {
  cert: string;
  subject: string;
  year: string;
}

function resolveParams(params: PageParams) {
  const certCode = certSlugToCode[params.cert] as CertCode | undefined;
  if (!certCode) return null;

  const subjectId = subjectSlugToId[params.subject];
  if (!subjectId) return null;

  const yearData = getExamData(certCode, subjectId, params.year);
  if (!yearData) return null;

  return {
    certCode,
    subjectId,
    yearData,
    certName: certCodeToName[certCode],
    subjectName: getSubjectName(subjectId),
    year: params.year,
  };
}

export async function generateStaticParams() {
  const paramsList: PageParams[] = [];

  for (const certCode of ["lc", "jc", "lb"] as CertCode[]) {
    const certSlug = certCodeToSlug[certCode];
    const subjectIds = getActiveSubjectsForCert(certCode);

    for (const subjectId of subjectIds) {
      const slug = subjectIdToSlug[subjectId];
      if (!slug) continue;

      const years = getAllSubjectYears(certCode, subjectId);
      for (const year of years) {
        paramsList.push({ cert: certSlug, subject: slug, year });
      }
    }
  }

  return paramsList;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const p = await params;
  const resolved = resolveParams(p);
  if (!resolved) return {};

  const title = `${resolved.subjectName} ${resolved.year} - ${resolved.certName} Past Papers | Better Exams`;
  const description = `Download ${resolved.certName} ${resolved.subjectName} ${resolved.year} exam papers and marking schemes. Free access to past papers from examinations.ie.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${p.cert}/${p.subject}/${p.year}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${p.cert}/${p.subject}/${p.year}`,
      type: "website",
      siteName: "Better Exams",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SubjectYearPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const p = await params;
  const resolved = resolveParams(p);
  if (!resolved) notFound();

  const { certCode, subjectId, yearData, certName, subjectName, year } =
    resolved;
  const certSlug = certCodeToSlug[certCode];
  const subjectSlug = subjectIdToSlug[subjectId];
  const docCount = getDocCountForYear(certCode, subjectId, year);

  // Prev/next year navigation
  const allYears = getAllSubjectYears(certCode, subjectId).sort();
  const currentYearIndex = allYears.indexOf(year);
  const prevYear =
    currentYearIndex > 0 ? allYears[currentYearIndex - 1] : null;
  const nextYear =
    currentYearIndex < allYears.length - 1
      ? allYears[currentYearIndex + 1]
      : null;

  const categories = Object.entries(yearData) as [
    string,
    { details: string; url: string }[],
  ][];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalResource",
    name: `${certName} ${subjectName} ${year} Past Papers`,
    description: `${certName} ${subjectName} ${year} exam papers and marking schemes.`,
    url: `${BASE_URL}/${certSlug}/${subjectSlug}/${year}`,
    educationalLevel: certName,
    datePublished: year,
    dateModified: year,
    inLanguage: ["en", "ga"],
    encodingFormat: "application/pdf",
    isAccessibleForFree: true,
    provider: {
      "@type": "Organization",
      name: "Better Exams",
      url: BASE_URL,
    },
    author: {
      "@type": "Organization",
      name: "State Examinations Commission",
      url: "https://www.examinations.ie",
    },
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: certName, href: `/${certSlug}` },
          { label: subjectName, href: `/${certSlug}/${subjectSlug}` },
          { label: year, href: `/${certSlug}/${subjectSlug}/${year}` },
        ]}
      />

      <h1 className="text-3xl font-bold text-white mb-2">
        {subjectName} {year}
      </h1>
      <p className="text-zinc-400 mb-6">
        {certName} Past Papers &amp; Marking Schemes
      </p>

      <p className="text-zinc-300 mb-8">
        This page contains all available {certName} {subjectName} documents
        for {year}, including {docCount} exam papers, marking schemes, and any
        deferred papers. All documents are sourced from the State Examinations
        Commission and are free to download.
      </p>

      {categories.map(([categoryCode, docs]) => {
        const catSlug = categoryCodeToSlug[categoryCode];
        const catName = categoryCodeToName[categoryCode] ?? categoryCode;
        if (!catSlug || docs.length === 0) return null;

        return (
          <section key={categoryCode} className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">
              {catName}s
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              {docs.map((doc) => (
                <li key={doc.url}>
                  <a
                    href={`/pdf/${certSlug}/${subjectSlug}/${year}/${catSlug}/${doc.url}`}
                    className="inline-block py-1.5 text-blue-400 hover:text-blue-300 underline underline-offset-2"
                  >
                    {doc.details}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <nav className="flex justify-between items-center border-t border-zinc-800 pt-4 mt-8 mb-8">
        {prevYear ? (
          <Link
            href={`/${certSlug}/${subjectSlug}/${prevYear}`}
            className="inline-block py-3 text-blue-400 hover:text-blue-300 text-sm"
          >
            &larr; {prevYear}
          </Link>
        ) : (
          <span />
        )}
        {nextYear ? (
          <Link
            href={`/${certSlug}/${subjectSlug}/${nextYear}`}
            className="inline-block py-3 text-blue-400 hover:text-blue-300 text-sm"
          >
            {nextYear} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <Link
        href={`/${certSlug}/${subjectSlug}`}
        className="inline-block py-3 text-blue-400 hover:text-blue-300 underline underline-offset-2"
      >
        &larr; All {subjectName} years
      </Link>
    </main>
  );
}
