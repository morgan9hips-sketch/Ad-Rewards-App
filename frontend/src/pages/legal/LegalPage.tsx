import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import LoadingSpinner from '../../components/LoadingSpinner'

interface LegalPageProps {
  endpoint: string
  title: string
}

export default function LegalPage({ endpoint, title }: LegalPageProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const backendUrl =
          import.meta.env.VITE_API_URL || 'https://api.adrevtechnologies.com'
        const response = await fetch(`${backendUrl}/api/legal/${endpoint}`)

        if (!response.ok) {
          throw new Error('Failed to load legal document')
        }

        const text = await response.text()
        setContent(text)
      } catch (err: any) {
        setError(err.message || 'Failed to load content')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [endpoint])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-2">
              ⚠️ Error Loading Content
            </h2>
            <p className="text-gray-300">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-32 sm:pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
        </div>

        <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ ...props }) => (
                <h1
                  className="text-3xl font-bold mt-8 mb-4 text-white"
                  {...props}
                />
              ),
              h2: ({ ...props }) => (
                <h2
                  className="text-2xl font-bold mt-6 mb-3 text-white"
                  {...props}
                />
              ),
              h3: ({ ...props }) => (
                <h3
                  className="text-xl font-bold mt-4 mb-2 text-white"
                  {...props}
                />
              ),
              h4: ({ ...props }) => (
                <h4
                  className="text-lg font-bold mt-3 mb-2 text-gray-200"
                  {...props}
                />
              ),
              p: ({ ...props }) => (
                <p className="mb-4 text-gray-300 leading-relaxed" {...props} />
              ),
              ul: ({ ...props }) => (
                <ul className="list-disc pl-6 mb-4 text-gray-300" {...props} />
              ),
              ol: ({ ...props }) => (
                <ol
                  className="list-decimal pl-6 mb-4 text-gray-300"
                  {...props}
                />
              ),
              li: ({ ...props }) => <li className="mb-2" {...props} />,
              a: ({ ...props }) => (
                <a
                  className="text-blue-400 hover:text-blue-300 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              strong: ({ ...props }) => (
                <strong className="font-bold text-white" {...props} />
              ),
              em: ({ ...props }) => (
                <em className="italic text-gray-200" {...props} />
              ),
              blockquote: ({ ...props }) => (
                <blockquote
                  className="border-l-4 border-blue-500 pl-4 py-2 mb-4 text-gray-400 italic"
                  {...props}
                />
              ),
              code: ({ ...props }) => (
                <code
                  className="bg-gray-800 px-1 py-0.5 rounded text-sm text-blue-300"
                  {...props}
                />
              ),
              pre: ({ ...props }) => (
                <pre
                  className="bg-gray-900 p-4 rounded-lg mb-4 overflow-x-auto"
                  {...props}
                />
              ),
              table: ({ ...props }) => (
                <div className="overflow-x-auto mb-4">
                  <table
                    className="min-w-full border border-gray-700"
                    {...props}
                  />
                </div>
              ),
              thead: ({ ...props }) => (
                <thead className="bg-gray-800" {...props} />
              ),
              tbody: ({ ...props }) => <tbody {...props} />,
              tr: ({ ...props }) => (
                <tr className="border-b border-gray-700" {...props} />
              ),
              th: ({ ...props }) => (
                <th
                  className="px-4 py-2 text-left text-white font-semibold"
                  {...props}
                />
              ),
              td: ({ ...props }) => (
                <td className="px-4 py-2 text-gray-300" {...props} />
              ),
              hr: ({ ...props }) => (
                <hr className="my-8 border-gray-700" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
