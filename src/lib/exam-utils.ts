import data from "../app/files/data.json";

// --- Cert mapping ---
const certSlugToCode: Record<string, string> = {
  "leaving-cert": "lc",
  "junior-cert": "jc",
  "leaving-cert-applied": "lb",
};
const certCodeToSlug: Record<string, string> = {
  lc: "leaving-cert",
  jc: "junior-cert",
  lb: "leaving-cert-applied",
};
const certCodeToName: Record<string, string> = {
  lc: "Leaving Certificate",
  jc: "Junior Certificate",
  lb: "Leaving Cert Applied",
};

// --- Category mapping ---
const categorySlugToCode: Record<string, string> = {
  "exam-papers": "exampapers",
  "marking-schemes": "markingschemes",
  "deferred-exams": "deferredexams",
  "deferred-marking-schemes": "deferredmarkingschemes",
};
const categoryCodeToSlug: Record<string, string> = {
  exampapers: "exam-papers",
  markingschemes: "marking-schemes",
  deferredexams: "deferred-exams",
  deferredmarkingschemes: "deferred-marking-schemes",
};
const categoryCodeToName: Record<string, string> = {
  exampapers: "Exam Paper",
  markingschemes: "Marking Scheme",
  deferredexams: "Deferred Exam",
  deferredmarkingschemes: "Deferred Marking Scheme",
};

// --- Subject slug generation ---
type CertData = Record<string, Record<string, Record<string, { details: string; url: string }[]>>>;

const typedData = data as {
  lc: CertData;
  jc: CertData;
  lb: CertData;
  subNumsToNames: Record<string, string>;
  subNamesToNums: Record<string, string | string[]>;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSubjectMaps() {
  const lcIds = Object.keys(typedData.lc);
  const jcIds = Object.keys(typedData.jc);
  const lbIds = Object.keys(typedData.lb ?? {});
  const allIds = Array.from(new Set(lcIds.concat(jcIds, lbIds)));

  // Group IDs by their base slug to find duplicates
  const slugToIds: Record<string, string[]> = {};
  for (const id of allIds) {
    const name = typedData.subNumsToNames[id];
    if (!name) continue;
    const slug = slugify(name);
    if (!slugToIds[slug]) slugToIds[slug] = [];
    slugToIds[slug].push(id);
  }

  const idToSlug: Record<string, string> = {};
  const slugToId: Record<string, string> = {};

  for (const [slug, ids] of Object.entries(slugToIds)) {
    if (ids.length === 1) {
      idToSlug[ids[0]] = slug;
      slugToId[slug] = ids[0];
    } else {
      // Disambiguate by appending -${id}
      for (const id of ids) {
        const disambiguated = `${slug}-${id}`;
        idToSlug[id] = disambiguated;
        slugToId[disambiguated] = id;
      }
    }
  }

  return { idToSlug, slugToId };
}

const { idToSlug: subjectIdToSlug, slugToId: subjectSlugToId } =
  buildSubjectMaps();

// --- Data access helpers ---
type CertCode = "lc" | "jc" | "lb";

function getCertData(certCode: CertCode) {
  return typedData[certCode];
}

function getExamData(
  certCode: CertCode,
  subjectId: string,
  year: string
): Record<string, { details: string; url: string }[]> | null {
  const cert = getCertData(certCode);
  return cert?.[subjectId]?.[year] ?? null;
}

function getAllSubjectYears(certCode: CertCode, subjectId: string): string[] {
  const cert = getCertData(certCode);
  const subject = cert?.[subjectId];
  if (!subject) return [];
  return Object.keys(subject);
}

function getSubjectsForCert(certCode: CertCode): string[] {
  const cert = getCertData(certCode);
  return Object.keys(cert);
}

function getSubjectName(subjectId: string): string {
  return typedData.subNumsToNames[subjectId] ?? "Unknown";
}

function slugifyDocInCategory(
  doc: { details: string; url: string },
  categoryDocs: { details: string; url: string }[]
): string {
  const ext = doc.url.split(".").pop()?.toLowerCase() ?? "pdf";
  const base = slugify(doc.details);
  const sameSlugDocs = categoryDocs.filter((d) => slugify(d.details) === base);
  if (sameSlugDocs.length <= 1) return `${base}.${ext}`;
  const idx = sameSlugDocs.indexOf(doc);
  return idx <= 0 ? `${base}.${ext}` : `${base}-${idx + 1}.${ext}`;
}

function resolveDocSlug(
  categoryDocs: { details: string; url: string }[],
  docSlug: string
): { details: string; url: string } | undefined {
  // Try exact match first (most docs), then indexed match
  for (let i = 0; i < categoryDocs.length; i++) {
    const slug = slugifyDocInCategory(categoryDocs[i], categoryDocs);
    if (slug === docSlug) return categoryDocs[i];
  }
  return undefined;
}

function getUpstreamPdfUrl(
  categoryCode: string,
  year: string,
  filename: string
): string {
  return `https://www.examinations.ie/archive/${categoryCode}/${year}/${filename}`;
}

// --- Content type helpers ---
function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "mp3":
      return "audio/mpeg";
    case "mp4":
      return "video/mp4";
    default:
      return "application/octet-stream";
  }
}

// --- Counting helpers ---
function getDocCountForYear(
  certCode: CertCode,
  subjectId: string,
  year: string
): number {
  const yearData = getExamData(certCode, subjectId, year);
  if (!yearData) return 0;
  let count = 0;
  for (const docs of Object.values(yearData)) {
    count += (docs as { details: string; url: string }[]).length;
  }
  return count;
}

function getDocCountForSubject(
  certCode: CertCode,
  subjectId: string
): number {
  const years = getAllSubjectYears(certCode, subjectId);
  let count = 0;
  for (const year of years) {
    count += getDocCountForYear(certCode, subjectId, year);
  }
  return count;
}

function getDocCountForCert(certCode: CertCode): number {
  const subjectIds = getSubjectsForCert(certCode);
  let count = 0;
  for (const subjectId of subjectIds) {
    count += getDocCountForSubject(certCode, subjectId);
  }
  return count;
}

function getActiveSubjectsForCert(certCode: CertCode): string[] {
  const allSubjects = getSubjectsForCert(certCode);
  if (certCode !== "lb") return allSubjects;

  // For LCA, filter to subjects with papers in the last 10 years that have actual exam papers
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 10;

  return allSubjects.filter((subjectId) => {
    const years = getAllSubjectYears(certCode, subjectId);
    const hasRecentYear = years.some((y) => Number(y) >= minYear);
    if (!hasRecentYear) return false;

    // Check for actual exam papers in at least one year
    return years.some((y) => {
      const yearData = getExamData(certCode, subjectId, y);
      return yearData?.exampapers && yearData.exampapers.length > 0;
    });
  });
}

function getYearRangeForCert(certCode: CertCode): { min: string; max: string } {
  const subjectIds = getSubjectsForCert(certCode);
  let min = "9999";
  let max = "0000";
  for (const subjectId of subjectIds) {
    const years = getAllSubjectYears(certCode, subjectId);
    for (const y of years) {
      if (y < min) min = y;
      if (y > max) max = y;
    }
  }
  return { min, max };
}

export {
  certSlugToCode,
  certCodeToSlug,
  certCodeToName,
  categorySlugToCode,
  categoryCodeToSlug,
  categoryCodeToName,
  subjectIdToSlug,
  subjectSlugToId,
  typedData,
  slugify,
  getExamData,
  getAllSubjectYears,
  getSubjectsForCert,
  getActiveSubjectsForCert,
  getSubjectName,
  slugifyDocInCategory,
  resolveDocSlug,
  getUpstreamPdfUrl,
  getContentType,
  getDocCountForYear,
  getDocCountForSubject,
  getDocCountForCert,
  getYearRangeForCert,
};
export type { CertCode };
