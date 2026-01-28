import { MetadataRoute } from 'next'
import data from './files/data.json'

type ExamData = {
  lc: Record<string, Record<string, unknown>>
  jc: Record<string, Record<string, unknown>>
  lb: Record<string, Record<string, unknown>>
  subNumsToNames: Record<string, string>
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export default function sitemap(): MetadataRoute.Sitemap {
  const examData = data as ExamData
  const baseUrl = 'https://betterexams.ie'
  
  const pages: MetadataRoute.Sitemap = [
    // Static pages
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/v2`, lastModified: new Date() },
  ]

  // Leaving Cert pages
  for (const [subjectNum, years] of Object.entries(examData.lc)) {
    const subjectName = examData.subNumsToNames[subjectNum]
    if (!subjectName) continue
    
    const slug = slugify(subjectName)
    const yearKeys = Object.keys(years).sort().reverse()
    const latestYear = yearKeys[0] || '2024'
    
    // Subject page
    pages.push({
      url: `${baseUrl}/leaving-cert/${slug}`,
      lastModified: new Date(`${latestYear}-06-01`),
    })
    
    // Year pages
    for (const year of yearKeys) {
      pages.push({
        url: `${baseUrl}/leaving-cert/${slug}/${year}`,
        lastModified: new Date(`${year}-06-01`),
      })
    }
  }
  
  // Junior Cert pages
  for (const [subjectNum, years] of Object.entries(examData.jc)) {
    const subjectName = examData.subNumsToNames[subjectNum]
    if (!subjectName) continue
    
    const slug = slugify(subjectName)
    const yearKeys = Object.keys(years).sort().reverse()
    const latestYear = yearKeys[0] || '2024'
    
    // Subject page
    pages.push({
      url: `${baseUrl}/junior-cert/${slug}`,
      lastModified: new Date(`${latestYear}-06-01`),
    })
    
    // Year pages
    for (const year of yearKeys) {
      pages.push({
        url: `${baseUrl}/junior-cert/${slug}/${year}`,
        lastModified: new Date(`${year}-06-01`),
      })
    }
  }

  // Leaving Cert Applied pages (only subjects with recent exam papers)
  const currentYear = new Date().getFullYear()
  const minYear = currentYear - 10
  
  for (const [subjectNum, years] of Object.entries(examData.lb)) {
    const subjectName = examData.subNumsToNames[subjectNum]
    if (!subjectName) continue
    
    const yearKeys = Object.keys(years).sort().reverse()
    const yearNums = yearKeys.map(Number)
    if (!yearNums.some(y => y >= minYear)) continue
    
    // Check if subject has any actual exam papers
    const hasExamPapers = Object.values(years).some(
      (yearData: any) => yearData?.exampapers && yearData.exampapers.length > 0
    )
    if (!hasExamPapers) continue
    
    const slug = slugify(subjectName)
    const latestYear = yearKeys[0] || '2024'
    
    // Subject page
    pages.push({
      url: `${baseUrl}/leaving-cert-applied/${slug}`,
      lastModified: new Date(`${latestYear}-06-01`),
    })
    
    // Year pages
    for (const year of yearKeys) {
      pages.push({
        url: `${baseUrl}/leaving-cert-applied/${slug}/${year}`,
        lastModified: new Date(`${year}-06-01`),
      })
    }
  }

  return pages
}
