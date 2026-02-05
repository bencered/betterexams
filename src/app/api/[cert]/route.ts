import { NextRequest, NextResponse } from "next/server";
import {
  certSlugToCode,
  certCodeToName,
  certCodeToSlug,
  subjectIdToSlug,
  getActiveSubjectsForCert,
  getSubjectName,
  getAllSubjectYears,
  type CertCode,
} from "@/lib/exam-utils";

const BASE_URL = "https://betterexams.ie";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cert: string }> }
) {
  const { cert } = await params;
  const certCode = certSlugToCode[cert] as CertCode | undefined;
  if (!certCode) {
    return NextResponse.json({ error: "Invalid certificate" }, { status: 404 });
  }

  const certName = certCodeToName[certCode];
  const certSlug = certCodeToSlug[certCode];
  const subjectIds = getActiveSubjectsForCert(certCode);

  const subjects = subjectIds
    .map((id) => {
      const name = getSubjectName(id);
      const slug = subjectIdToSlug[id];
      if (!slug) return null;
      const years = getAllSubjectYears(certCode, id).sort();
      return {
        name,
        slug,
        years,
        url: `${BASE_URL}/${certSlug}/${slug}`,
        apiUrl: `${BASE_URL}/api/${certSlug}/${slug}/{year}`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.name.localeCompare(b!.name));

  return NextResponse.json(
    {
      certificate: certName,
      slug: certSlug,
      subjectCount: subjects.length,
      subjects,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
