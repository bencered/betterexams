import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, FileText, CheckCircle } from 'lucide-react'
import data from '../../../files/data.json'

type YearData = {
  exampapers?: Array<{ details: string; url: string }>
  markingschemes?: Array<{ details: string; url: string }>
}

type ExamData = {
  lb: Record<string, Record<string, YearData>>
  subNumsToNames: Record<string, string>
}

const examData = data as ExamData

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function getSubjectBySlug(slug: string): { num: string; name: string } | null {
  for (const [num, name] of Object.entries(examData.subNumsToNames)) {
    if (slugify(name) === slug && examData.lb[num]) {
      return { num, name }
    }
  }
  return null
}

export async function generateStaticParams() {
  const currentYear = new Date().getFullYear()
  const minYear = currentYear - 10
  const params: { subject: string; year: string }[] = []
  
  for (const [subjectNum, years] of Object.entries(examData.lb)) {
    const subjectName = examData.subNumsToNames[subjectNum]
    if (!subjectName) continue
    
    // Only include subjects with recent papers
    const yearNums = Object.keys(years).map(Number)
    if (!yearNums.some(y => y >= minYear)) continue
    
    // Check if subject has any actual exam papers
    const hasExamPapers = Object.values(years).some(
      (yearData: any) => yearData?.exampapers && yearData.exampapers.length > 0
    )
    if (!hasExamPapers) continue
    
    const subjectSlug = slugify(subjectName)
    
    for (const year of Object.keys(years)) {
      params.push({ subject: subjectSlug, year })
    }
  }
  
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ subject: string; year: string }> }): Promise<Metadata> {
  const { subject, year } = await params
  const subjectInfo = getSubjectBySlug(subject)
  
  if (!subjectInfo) {
    return { title: 'Not Found' }
  }

  return {
    title: `LCA ${subjectInfo.name} ${year} - Past Papers & Marking Schemes`,
    description: `Download Leaving Cert Applied ${subjectInfo.name} ${year} exam papers and marking schemes. Free PDFs from examinations.ie.`,
    keywords: `leaving cert applied ${subjectInfo.name.toLowerCase()} ${year}, lca ${subjectInfo.name.toLowerCase()} ${year}, ${subjectInfo.name.toLowerCase()} past paper ${year}, leaving cert applied ${year} papers, ${subjectInfo.name.toLowerCase()} marking scheme ${year}, examinations.ie ${subjectInfo.name.toLowerCase()}, sec exam papers ${year}, lca ${subjectInfo.name.toLowerCase()} past papers`,
    openGraph: {
      title: `LCA ${subjectInfo.name} ${year}`,
      description: `${subjectInfo.name} ${year} exam papers and marking schemes for Leaving Cert Applied.`,
      url: `https://betterexams.ie/leaving-cert-applied/${subject}/${year}`,
    },
    alternates: {
      canonical: `https://betterexams.ie/leaving-cert-applied/${subject}/${year}`,
    },
  }
}

export default async function LCAYearPage({ params }: { params: Promise<{ subject: string; year: string }> }) {
  const { subject, year } = await params
  const subjectInfo = getSubjectBySlug(subject)
  
  if (!subjectInfo) {
    notFound()
  }

  const subjectData = examData.lb[subjectInfo.num]
  if (!subjectData || !subjectData[year]) {
    notFound()
  }

  const yearData = subjectData[year]
  const allYears = Object.keys(subjectData).sort((a, b) => parseInt(b) - parseInt(a))

  // Schema markup
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://betterexams.ie"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `LCA ${subjectInfo.name}`,
        item: `https://betterexams.ie/leaving-cert-applied/${subject}`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: year,
        item: `https://betterexams.ie/leaving-cert-applied/${subject}/${year}`
      }
    ]
  }

  const learningResourceSchema = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `Leaving Cert Applied ${subjectInfo.name} ${year} Exam Papers`,
    description: `Past exam papers and marking schemes for Leaving Cert Applied ${subjectInfo.name} ${year}`,
    educationalLevel: "Leaving Certificate Applied",
    learningResourceType: "Exam",
    inLanguage: "en",
    isAccessibleForFree: true,
    provider: {
      "@type": "Organization",
      name: "Better Exams",
      url: "https://betterexams.ie"
    },
    datePublished: year
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceSchema) }}
      />
      <main className="min-h-screen flex flex-col items-center p-8 md:p-24">
      {/* Header - matches homepage */}
      <Link href="/" className="group">
        <h1 className="text-5xl md:text-6xl font-bold text-center hover:text-blue-400 transition-colors">Better Exams</h1>
      </Link>
      <p className="italic text-white/70 mt-1 text-center">An Alternative To Examinations.ie</p>

      {/* Prominent CTA */}
      <Link 
        href={`/?cert=lb&subject=${subjectInfo.num}&year=${year}`}
        className="mt-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
      >
        Open Interactive Version
        <ArrowRight className="w-5 h-5" />
      </Link>

      {/* Breadcrumb */}
      <div className="mt-8 flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link href={`/leaving-cert-applied/${subject}`} className="hover:text-white">{subjectInfo.name}</Link>
        <span>/</span>
        <span className="text-white">{year}</span>
      </div>

      {/* Title */}
      <div className="mt-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">LCA {subjectInfo.name} {year}</h2>
        <p className="text-zinc-400 mt-2">Exam papers and marking schemes</p>
      </div>

      {/* Papers grid */}
      <div className="mt-8 w-full max-w-2xl grid md:grid-cols-2 gap-6">
        {yearData.exampapers && yearData.exampapers.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4 text-blue-400 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Exam Papers
            </h3>
            <ul className="space-y-3">
              {yearData.exampapers.map((paper, i) => (
                <li key={i}>
                  <a
                    href={`https://www.examinations.ie/archive/exampapers/${year}/${paper.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-300 hover:text-white transition-colors hover:underline"
                  >
                    {paper.details || 'Exam Paper'}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {yearData.markingschemes && yearData.markingschemes.length > 0 && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-4 text-green-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Marking Schemes
            </h3>
            <ul className="space-y-3">
              {yearData.markingschemes.map((scheme, i) => (
                <li key={i}>
                  <a
                    href={`https://www.examinations.ie/archive/markingschemes/${year}/${scheme.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-300 hover:text-white transition-colors hover:underline"
                  >
                    {scheme.details || 'Marking Scheme'}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Other years */}
      <div className="mt-10 w-full max-w-2xl">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 text-center">Other Years</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {allYears.map((y) => (
            <Link
              key={y}
              href={`/leaving-cert-applied/${subject}/${y}`}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                y === year
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {y}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-zinc-500 text-sm">
        <p>Papers sourced from <a href="https://examinations.ie" className="text-blue-400 hover:underline">examinations.ie</a></p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <Link href="/" className="text-blue-400 hover:underline">Home</Link>
          <span>•</span>
          <a href="https://github.com/General-Mudkip/betterexams" target="_blank" className="text-green-400 hover:underline">GitHub</a>
        </div>
      </div>
    </main>
    </>
  )
}
