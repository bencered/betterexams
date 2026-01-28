import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import data from '../../../files/data.json'

type YearData = {
  exampapers?: Array<{ details: string; url: string }>
  markingschemes?: Array<{ details: string; url: string }>
}

type ExamData = {
  jc: Record<string, Record<string, YearData>>
  subNumsToNames: Record<string, string>
}

const examData = data as ExamData

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function getSubjectBySlug(slug: string): { num: string; name: string } | null {
  for (const [num, name] of Object.entries(examData.subNumsToNames)) {
    if (slugify(name) === slug) {
      return { num, name }
    }
  }
  return null
}

export async function generateStaticParams() {
  const params: { subject: string; year: string }[] = []
  
  for (const [subjectNum, years] of Object.entries(examData.jc)) {
    const subjectName = examData.subNumsToNames[subjectNum]
    if (!subjectName) continue
    
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
    title: `Junior Cert ${subjectInfo.name} ${year} - Past Papers & Marking Schemes`,
    description: `Download Junior Cert ${subjectInfo.name} ${year} exam papers and marking schemes. Free PDFs for Higher and Ordinary Level from examinations.ie.`,
    keywords: `junior cert ${subjectInfo.name.toLowerCase()} ${year}, ${subjectInfo.name.toLowerCase()} exam ${year}, junior cert ${year} papers, ${subjectInfo.name.toLowerCase()} marking scheme ${year}`,
    openGraph: {
      title: `Junior Cert ${subjectInfo.name} ${year}`,
      description: `${subjectInfo.name} ${year} exam papers and marking schemes for Junior Cert.`,
      url: `https://betterexams.ie/junior-cert/${subject}/${year}`,
    },
    alternates: {
      canonical: `https://betterexams.ie/junior-cert/${subject}/${year}`,
    },
  }
}

export default async function JuniorCertYearPage({ params }: { params: Promise<{ subject: string; year: string }> }) {
  const { subject, year } = await params
  const subjectInfo = getSubjectBySlug(subject)
  
  if (!subjectInfo) {
    notFound()
  }

  const subjectData = examData.jc[subjectInfo.num]
  if (!subjectData || !subjectData[year]) {
    notFound()
  }

  const yearData = subjectData[year]
  const allYears = Object.keys(subjectData).sort((a, b) => parseInt(b) - parseInt(a))

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href={`/junior-cert/${subject}`} className="hover:text-white">JC {subjectInfo.name}</Link>
          <span>/</span>
          <span className="text-white">{year}</span>
        </div>
        
        <h1 className="text-4xl font-bold mb-2">Junior Cert {subjectInfo.name} {year}</h1>
        <p className="text-zinc-400 mb-8">Exam papers and marking schemes</p>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="grid md:grid-cols-2 gap-6">
            {yearData.exampapers && yearData.exampapers.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-blue-400">Exam Papers</h2>
                <ul className="space-y-2">
                  {yearData.exampapers.map((paper, i) => (
                    <li key={i}>
                      <a
                        href={`https://www.examinations.ie/archive/exampapers/${year}/${paper.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                      >
                        <span className="text-blue-400">📄</span>
                        {paper.details || 'Exam Paper'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {yearData.markingschemes && yearData.markingschemes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-green-400">Marking Schemes</h2>
                <ul className="space-y-2">
                  {yearData.markingschemes.map((scheme, i) => (
                    <li key={i}>
                      <a
                        href={`https://www.examinations.ie/archive/markingschemes/${year}/${scheme.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                      >
                        <span className="text-green-400">✓</span>
                        {scheme.details || 'Marking Scheme'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Other years */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Other Years</h3>
          <div className="flex flex-wrap gap-2">
            {allYears.map((y) => (
              <Link
                key={y}
                href={`/junior-cert/${subject}/${y}`}
                className={`px-3 py-1 rounded text-sm ${
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

        <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-sm">
          <Link href="/" className="text-blue-400 hover:underline">
            ← Use the interactive version
          </Link>
        </div>
      </div>
    </main>
  )
}
