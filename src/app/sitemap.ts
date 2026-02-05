import { MetadataRoute } from "next";
import {
  certCodeToSlug,
  subjectIdToSlug,
  categoryCodeToSlug,
  getActiveSubjectsForCert,
  getAllSubjectYears,
  getExamData,
  type CertCode,
} from "@/lib/exam-utils";

const BASE_URL = "https://betterexams.ie";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage and /v2
  entries.push(
    { url: BASE_URL, lastModified: new Date() },
    { url: `${BASE_URL}/v2`, lastModified: new Date() }
  );

  for (const certCode of ["lc", "jc", "lb"] as CertCode[]) {
    const certSlug = certCodeToSlug[certCode];
    const subjectIds = getActiveSubjectsForCert(certCode);

    // Cert-level index page
    entries.push({ url: `${BASE_URL}/${certSlug}`, lastModified: new Date() });

    for (const subjectId of subjectIds) {
      const subjectSlug = subjectIdToSlug[subjectId];
      if (!subjectSlug) continue;

      // Subject-level index page
      entries.push({
        url: `${BASE_URL}/${certSlug}/${subjectSlug}`,
        lastModified: new Date(),
      });

      const years = getAllSubjectYears(certCode, subjectId);
      for (const year of years) {
        // Subject/year SEO page
        entries.push({
          url: `${BASE_URL}/${certSlug}/${subjectSlug}/${year}`,
          lastModified: new Date(`${year}-06-01`),
        });

        // PDF proxy URLs
        const yearData = getExamData(certCode, subjectId, year);
        if (!yearData) continue;

        for (const [categoryCode, docs] of Object.entries(yearData)) {
          const catSlug = categoryCodeToSlug[categoryCode];
          if (!catSlug) continue;

          for (const doc of docs) {
            if (!doc.url.toLowerCase().endsWith(".pdf")) continue;
            entries.push({
              url: `${BASE_URL}/pdf/${certSlug}/${subjectSlug}/${year}/${catSlug}/${doc.url}`,
            });
          }
        }
      }
    }
  }

  return entries;
}
