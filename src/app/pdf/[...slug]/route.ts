import { NextRequest, NextResponse } from "next/server";
import {
  certSlugToCode,
  subjectSlugToId,
  categorySlugToCode,
  categoryCodeToSlug,
  getExamData,
  getSubjectName,
  getUpstreamPdfUrl,
  getContentType,
  type CertCode,
} from "@/lib/exam-utils";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;

  // Expected: [certSlug, subjectSlug, year, categorySlug, filename]
  if (slug.length !== 5) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [certSlug, subjectSlug, year, categorySlug, filename] = slug;

  const certCode = certSlugToCode[certSlug] as CertCode | undefined;
  if (!certCode) {
    return NextResponse.json({ error: "Invalid certificate" }, { status: 404 });
  }

  const subjectId = subjectSlugToId[subjectSlug];
  if (!subjectId) {
    return NextResponse.json({ error: "Invalid subject" }, { status: 404 });
  }

  const categoryCode = categorySlugToCode[categorySlug];
  if (!categoryCode) {
    return NextResponse.json({ error: "Invalid category" }, { status: 404 });
  }

  // Verify the document exists in data.json
  const yearData = getExamData(certCode, subjectId, year);
  if (!yearData) {
    return NextResponse.json(
      { error: "Year not found for this subject" },
      { status: 404 }
    );
  }

  const categoryDocs = yearData[categoryCode];
  if (!categoryDocs) {
    return NextResponse.json(
      { error: "Category not found for this year" },
      { status: 404 }
    );
  }

  const doc = categoryDocs.find((d) => d.url === filename);
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Fetch from upstream
  const upstreamUrl = getUpstreamPdfUrl(categoryCode, year, filename);
  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstreamUrl);
  } catch {
    return NextResponse.json(
      { error: "Upstream fetch failed" },
      { status: 502 }
    );
  }

  if (!upstreamRes.ok) {
    return NextResponse.json(
      { error: "Upstream returned " + upstreamRes.status },
      { status: 502 }
    );
  }

  const subjectName = getSubjectName(subjectId);
  const contentType = getContentType(filename);

  return new NextResponse(upstreamRes.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${subjectName} - ${year} - ${filename}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Robots-Tag": "index, follow",
    },
  });
}
