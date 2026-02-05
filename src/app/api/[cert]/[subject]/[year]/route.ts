import { NextRequest, NextResponse } from "next/server";
import {
  certSlugToCode,
  certCodeToName,
  certCodeToSlug,
  subjectSlugToId,
  subjectIdToSlug,
  categoryCodeToSlug,
  getExamData,
  getSubjectName,
  type CertCode,
} from "@/lib/exam-utils";

const BASE_URL = "https://betterexams.ie";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cert: string; subject: string; year: string }> }
) {
  const { cert, subject, year } = await params;
  const certCode = certSlugToCode[cert] as CertCode | undefined;
  if (!certCode) {
    return NextResponse.json({ error: "Invalid certificate" }, { status: 404 });
  }

  const subjectId = subjectSlugToId[subject];
  if (!subjectId) {
    return NextResponse.json({ error: "Invalid subject" }, { status: 404 });
  }

  const yearData = getExamData(certCode, subjectId, year);
  if (!yearData) {
    return NextResponse.json(
      { error: "Year not found for this subject" },
      { status: 404 }
    );
  }

  const certSlug = certCodeToSlug[certCode];
  const subjectSlug = subjectIdToSlug[subjectId];
  const subjectName = getSubjectName(subjectId);

  const documents: Record<
    string,
    { details: string; filename: string; pdfUrl: string }[]
  > = {};

  for (const [categoryCode, docs] of Object.entries(yearData)) {
    const catSlug = categoryCodeToSlug[categoryCode];
    if (!catSlug) continue;

    documents[categoryCode] = docs.map((doc) => ({
      details: doc.details,
      filename: doc.url,
      pdfUrl: `${BASE_URL}/pdf/${certSlug}/${subjectSlug}/${year}/${catSlug}/${doc.url}`,
    }));
  }

  const response = {
    certificate: certCodeToName[certCode],
    subject: subjectName,
    year,
    pageUrl: `${BASE_URL}/${certSlug}/${subjectSlug}/${year}`,
    documents,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
