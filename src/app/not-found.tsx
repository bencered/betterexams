import { Metadata } from 'next'
import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Page Not Found | Better Exams',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Header */}
      <Link href="/" className="group">
        <h1 className="text-5xl md:text-6xl font-bold text-center hover:text-blue-400 transition-colors">Better Exams</h1>
      </Link>
      <p className="italic text-white/70 mt-1 text-center">An Alternative To Examinations.ie</p>

      {/* 404 Content */}
      <div className="mt-16 text-center">
        <p className="text-8xl font-bold text-zinc-700">404</p>
        <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mt-2 text-zinc-400 max-w-md">
          The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
        >
          <Home className="w-5 h-5" />
          Go Home
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
        >
          <Search className="w-5 h-5" />
          Find Papers
        </Link>
      </div>

      {/* Popular subjects */}
      <div className="mt-16 text-center">
        <p className="text-sm text-zinc-400 uppercase tracking-wider mb-4">Popular Subjects</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['Mathematics', 'English', 'Irish', 'Biology', 'Chemistry', 'Physics'].map((subject) => {
            const slug = subject.toLowerCase()
            return (
              <Link
                key={subject}
                href={`/leaving-cert/${slug}`}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded text-sm transition-colors"
              >
                {subject}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-zinc-500 text-sm">
        <div className="flex items-center justify-center gap-4">
          <Link href="/" className="inline-block py-2 text-blue-400 hover:underline">Home</Link>
          <span>•</span>
          <a href="https://github.com/General-Mudkip/betterexams" target="_blank" className="inline-block py-2 text-green-400 hover:underline">GitHub</a>
        </div>
      </div>
    </main>
  )
}
