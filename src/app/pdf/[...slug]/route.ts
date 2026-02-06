import { NextRequest, NextResponse } from "next/server";
import {
  certSlugToCode,
  certCodeToName,
  categoryCodeToName,
  subjectSlugToId,
  categorySlugToCode,
  getExamData,
  getSubjectName,
  resolveDocSlug,
  getUpstreamPdfUrl,
  getContentType,
  type CertCode,
} from "@/lib/exam-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  // The last slug segment is a slugified doc name (e.g. "paper-one-higher-level")
  const doc = resolveDocSlug(categoryDocs, filename);
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const upstreamUrl = getUpstreamPdfUrl(categoryCode, year, doc.url);
  const subjectName = getSubjectName(subjectId);
  const certName = certCodeToName[certCode];
  const catName = categoryCodeToName[categoryCode] ?? categoryCode;
  const contentType = getContentType(doc.url);
  const pageUrl = `https://betterexams.ie/${certSlug}/${subjectSlug}/${year}`;
  const pdfUrl = `https://betterexams.ie/pdf/${slug.join("/")}`;

  // Serve bots/crawlers an HTML page so AI tools can verify the link.
  // Regular browsers get the actual PDF.
  const ua = request.headers.get("user-agent") ?? "";
  const isBot = /bot|crawl|spider|chatgpt|gpt|anthropic|claude|perplexity|cohere|ai2|bytespider|semrush|ahref/i.test(ua);

  if (isBot) {
    const title = `${subjectName} ${year} ${catName} – ${doc.details} | Better Exams`;
    const description = `Download the ${certName} ${subjectName} ${year} ${doc.details} (${catName}). Free past papers from the State Examinations Commission.`;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${pdfUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${pdfUrl}">
  <meta property="og:site_name" content="Better Exams">
</head>
<body>
  <h1>${subjectName} – ${doc.details} (${year})</h1>
  <p>${description}</p>
  <p><strong>Certificate:</strong> ${certName}</p>
  <p><strong>Subject:</strong> ${subjectName}</p>
  <p><strong>Year:</strong> ${year}</p>
  <p><strong>Category:</strong> ${catName}</p>
  <p><strong>Document:</strong> ${doc.details}</p>
  <p><a href="${upstreamUrl}">Download PDF</a></p>
  <p><a href="${pageUrl}">View all ${subjectName} ${year} papers on Better Exams</a></p>
</body>
</html>`;
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  // Try to proxy the PDF so content stays on our domain (better for SEO/GEO).
  // Falls back to redirect if upstream blocks the server IP.
  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstreamUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Referer: "https://www.examinations.ie/",
        Accept: "application/pdf,*/*",
      },
    });
  } catch {
    return NextResponse.redirect(upstreamUrl, 302);
  }

  if (!upstreamRes.ok) {
    return NextResponse.redirect(upstreamUrl, 302);
  }

  return new NextResponse(upstreamRes.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${subjectName} - ${year} - ${doc.details}.${doc.url.split(".").pop()}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Robots-Tag": "index, follow",
    },
  });
}
