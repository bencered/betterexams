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
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/v2`,
      lastModified: new Date(),
    },
  ]

  // Generate entries for each subject with dedicated pages
  const subjectPages: MetadataRoute.Sitemap = []
  
  // Leaving Cert subjects
  for (const [subjectNum, years] of Object.entries(examData.lc)) {
    const subjectName = examData.subNumsToNames[subjectNum]
    if (!subjectName) continue
    
    const slug = slugify(subjectName)
    const yearKeys = Object.keys(years).sort().reverse()
    const latestYear = yearKeys[0] || '2024'
    
    subjectPages.push({
      url: `${baseUrl}/leaving-cert/${slug}`,
      lastModified: new Date(`${latestYear}-06-01`),
    })
  }
  
  // Junior Cert subjects
  for (const [subjectNum, years] of Object.entries(examData.jc)) {
    const subjectName = examData.subNumsToNames[subjectNum]
    if (!subjectName) continue
    
    const slug = slugify(subjectName)
    const yearKeys = Object.keys(years).sort().reverse()
    const latestYear = yearKeys[0] || '2024'
    
    subjectPages.push({
      url: `${baseUrl}/junior-cert/${slug}`,
      lastModified: new Date(`${latestYear}-06-01`),
    })
  }

  return [...staticPages, ...subjectPages]
}
