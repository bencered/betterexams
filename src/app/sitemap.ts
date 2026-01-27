import { MetadataRoute } from 'next'
import data from './files/data.json'

type ExamData = {
  lc: Record<string, Record<string, unknown>>
  jc: Record<string, Record<string, unknown>>
  lb: Record<string, Record<string, unknown>>
  subNumsToNames: Record<string, string>
}

export default function sitemap(): MetadataRoute.Sitemap {
  const examData = data as ExamData
  const baseUrl = 'https://betterexams.ie'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/v2`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  // Generate entries for each subject
  const subjectPages: MetadataRoute.Sitemap = []
  
  const examTypes = [
    { key: 'lc', name: 'leaving-cert' },
    { key: 'jc', name: 'junior-cert' },
  ] as const

  for (const examType of examTypes) {
    const subjects = examData[examType.key]
    
    for (const [subjectNum, years] of Object.entries(subjects)) {
      const subjectName = examData.subNumsToNames[subjectNum]
      if (!subjectName) continue
      
      // Get the most recent year for lastModified
      const yearKeys = Object.keys(years).sort().reverse()
      const latestYear = yearKeys[0] || '2024'
      
      subjectPages.push({
        url: `${baseUrl}/#${examType.name}-${subjectNum}`,
        lastModified: new Date(`${latestYear}-06-01`),
        changeFrequency: 'yearly',
        priority: 0.7,
      })
    }
  }

  return [...staticPages, ...subjectPages]
}
