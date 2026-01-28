import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import data from '../../files/data.json'

type ExamData = {
  lb: Record<string, Record<string, { exampapers?: Array<{ details: string; url: string }>; markingschemes?: Array<{ details: string; url: string }> }>>
  subNumsToNames: Record<string, string>
  subNamesToNums: Record<string, string[]>
}

const examData = data as ExamData

// Generate all subject pages at build time (only subjects with recent exam papers)
export async function generateStaticParams() {
  const currentYear = new Date().getFullYear()
  const minYear = currentYear - 10
  
  const subjects = Object.keys(examData.lb)
  return subjects.map((subjectNum) => {
    const subjectName = examData.subNumsToNames[subjectNum]
    if (!subjectName) return null
    
    const subjectData = examData.lb[subjectNum] || {}
    const years = Object.keys(subjectData).map(Number)
    
    // Check if subject has recent papers
    if (!years.some(y => y >= minYear)) return null
    
    // Check if subject has any actual exam papers
    const hasExamPapers = Object.values(subjectData).some(
      (yearData: any) => yearData?.exampapers && yearData.exampapers.length > 0
    )
    if (!hasExamPapers) return null
    
    const slug = subjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    return { subject: slug }
  }).filter(Boolean)
}

function getSubjectBySlug(slug: string): { num: string; name: string } | null {
  for (const [num, name] of Object.entries(examData.subNumsToNames)) {
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    if (nameSlug === slug && examData.lb[num]) {
      return { num, name }
    }
  }
  return null
}

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }): Promise<Metadata> {
  const { subject } = await params
  const subjectInfo = getSubjectBySlug(subject)
  
  if (!subjectInfo) {
    return { title: 'Subject Not Found' }
  }

  return {
    title: `LCA ${subjectInfo.name} Past Papers | Better Exams`,
    description: `Free access to all Leaving Cert Applied ${subjectInfo.name} past exam papers and marking schemes. Download PDFs from examinations.ie.`,
    keywords: `leaving cert applied ${subjectInfo.name.toLowerCase()}, lca ${subjectInfo.name.toLowerCase()}, ${subjectInfo.name.toLowerCase()} past papers, lca ${subjectInfo.name.toLowerCase()} past paper, leaving cert applied ${subjectInfo.name.toLowerCase()} exam, ${subjectInfo.name.toLowerCase()} marking scheme, SEC ${subjectInfo.name.toLowerCase()}, examinations.ie ${subjectInfo.name.toLowerCase()}, examinations.ie alternative`,
    openGraph: {
      title: `LCA ${subjectInfo.name} Past Papers`,
      description: `Free access to all Leaving Cert Applied ${subjectInfo.name} past exam papers and marking schemes.`,
      url: `https://betterexams.ie/leaving-cert-applied/${subject}`,
    },
    alternates: {
      canonical: `https://betterexams.ie/leaving-cert-applied/${subject}`,
    },
  }
}

export default async function LCASubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params
  const subjectInfo = getSubjectBySlug(subject)
  
  if (!subjectInfo) {
    notFound()
  }

  const years = examData.lb[subjectInfo.num]
  if (!years) {
    notFound()
  }

  const sortedYears = Object.keys(years).sort((a, b) => parseInt(b) - parseInt(a))

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
      }
    ]
  }

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `Leaving Cert Applied ${subjectInfo.name}`,
    description: `Past exam papers and marking schemes for Leaving Cert Applied ${subjectInfo.name}`,
    provider: {
      "@type": "Organization",
      name: "Better Exams",
      url: "https://betterexams.ie"
    },
    educationalLevel: "Leaving Certificate Applied",
    inLanguage: "en",
    isAccessibleForFree: true
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <main className="min-h-screen flex flex-col items-center p-8 md:p-24">
      {/* Header - matches homepage */}
      <Link href="/" className="group">
        <h1 className="text-5xl md:text-6xl font-bold text-center hover:text-blue-400 transition-colors">Better Exams</h1>
      </Link>
      <p className="italic text-white/70 mt-1 text-center">An Alternative To Examinations.ie</p>

      {/* Prominent CTA */}
      <Link 
        href={`/?cert=lb&subject=${subjectInfo.num}`}
        className="mt-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
      >
        Open Interactive Version
        <ArrowRight className="w-5 h-5" />
      </Link>

      {/* Subject title */}
      <div className="mt-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">LCA {subjectInfo.name}</h2>
        <p className="text-zinc-400 mt-2">Past exam papers and marking schemes</p>
      </div>

      {/* Years list */}
      <div className="mt-8 w-full max-w-2xl space-y-4">
        {sortedYears.map((year) => {
          const yearData = years[year]
          const paperCount = (yearData.exampapers?.length || 0) + (yearData.markingschemes?.length || 0)
          return (
            <Link
              key={year}
              href={`/leaving-cert-applied/${subject}/${year}`}
              className="block bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 rounded-lg p-4 transition-all duration-200"
            >
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">{year}</span>
                <span className="text-zinc-400 text-sm">{paperCount} files</span>
              </div>
            </Link>
          )
        })}
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
