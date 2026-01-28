import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import data from '../../files/data.json'

type ExamData = {
  jc: Record<string, Record<string, { exampapers?: Array<{ details: string; url: string }>; markingschemes?: Array<{ details: string; url: string }> }>>
  subNumsToNames: Record<string, string>
  subNamesToNums: Record<string, string[]>
}

const examData = data as ExamData

// Generate all subject pages at build time
export async function generateStaticParams() {
  const subjects = Object.keys(examData.jc)
  return subjects.map((subjectNum) => {
    const subjectName = examData.subNumsToNames[subjectNum]
    if (!subjectName) return null
    const slug = subjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    return { subject: slug }
  }).filter(Boolean)
}

function getSubjectBySlug(slug: string): { num: string; name: string } | null {
  for (const [num, name] of Object.entries(examData.subNumsToNames)) {
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    if (nameSlug === slug) {
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
    title: `Junior Cert ${subjectInfo.name} Past Papers | Better Exams`,
    description: `Free access to all Junior Cert ${subjectInfo.name} past exam papers and marking schemes from 2000-2025. Download PDFs from examinations.ie.`,
    keywords: `junior cert ${subjectInfo.name.toLowerCase()}, ${subjectInfo.name.toLowerCase()} past papers, junior cert ${subjectInfo.name.toLowerCase()} exam, ${subjectInfo.name.toLowerCase()} marking scheme, junior cycle ${subjectInfo.name.toLowerCase()}`,
    openGraph: {
      title: `Junior Cert ${subjectInfo.name} Past Papers`,
      description: `Free access to all Junior Cert ${subjectInfo.name} past exam papers and marking schemes.`,
      url: `https://betterexams.ie/junior-cert/${subject}`,
    },
    alternates: {
      canonical: `https://betterexams.ie/junior-cert/${subject}`,
    },
  }
}

export default async function JuniorCertSubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params
  const subjectInfo = getSubjectBySlug(subject)
  
  if (!subjectInfo) {
    notFound()
  }

  const years = examData.jc[subjectInfo.num]
  if (!years) {
    notFound()
  }

  const sortedYears = Object.keys(years).sort((a, b) => parseInt(b) - parseInt(a))

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
          ← Back to Better Exams
        </Link>
        
        <h1 className="text-4xl font-bold mb-2">Junior Cert {subjectInfo.name}</h1>
        <p className="text-zinc-400 mb-8">Past exam papers and marking schemes</p>

        <div className="space-y-6">
          {sortedYears.map((year) => {
            const yearData = years[year]
            return (
              <div key={year} className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                <h2 className="text-2xl font-semibold mb-4">{year}</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {yearData.exampapers && yearData.exampapers.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">Exam Papers</h3>
                      <ul className="space-y-1">
                        {yearData.exampapers.map((paper, i) => (
                          <li key={i}>
                            <a
                              href={`https://www.examinations.ie/archive/exampapers/${year}/${paper.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              {paper.details || 'Exam Paper'}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {yearData.markingschemes && yearData.markingschemes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">Marking Schemes</h3>
                      <ul className="space-y-1">
                        {yearData.markingschemes.map((scheme, i) => (
                          <li key={i}>
                            <a
                              href={`https://www.examinations.ie/archive/markingschemes/${year}/${scheme.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 text-sm"
                            >
                              {scheme.details || 'Marking Scheme'}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-sm">
          <p>Papers sourced from <a href="https://examinations.ie" className="text-blue-400 hover:underline">examinations.ie</a></p>
          <Link href="/" className="text-blue-400 hover:underline mt-2 inline-block">
            Use the interactive version →
          </Link>
        </div>
      </div>
    </main>
  )
}
