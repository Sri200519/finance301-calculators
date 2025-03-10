"use client"

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { useRouter } from 'next/navigation'
import 'katex/dist/katex.min.css'
import type { Components } from 'react-markdown'
import type { ReactNode } from 'react'
import { CalculatorType } from './calculator-layout'

interface FormattedResponseProps {
  response: string
  metadata: {
    hasFormula: boolean
    hasCalculatorLink: boolean
    calculatorType: string | null
  }
  onCalculatorSelect?: (calculator: CalculatorType) => void
}

interface CustomComponentProps {
  href?: string
  children?: ReactNode
  inline?: boolean
}

export function FormattedResponse({ response, metadata, onCalculatorSelect }: FormattedResponseProps) {
  const router = useRouter()

  const handleCalculatorClick = (href: string) => {
    // Extract calculator type from href
    const calculatorType = href.split('/').pop() as CalculatorType
    
    if (onCalculatorSelect) {
      // If we have a callback, use it (for in-page navigation)
      onCalculatorSelect(calculatorType)
    } else {
      // Otherwise use router (for full page navigation)
      router.push(href)
    }
  }

  // Custom components for markdown rendering
  const components: Partial<Components> = {
    // Handle calculator links specially
    a: ({ href, children }: CustomComponentProps) => {
      if (href?.startsWith('/calculators/')) {
        return (
          <button
            onClick={() => href && handleCalculatorClick(href)}
            className="inline-flex items-center gap-2 px-4 py-2 mt-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {children}
          </button>
        )
      }
      return <a href={href} className="text-blue-600 hover:underline">{children}</a>
    },
    // Style paragraphs
    p: ({ children }: CustomComponentProps) => (
      <p className="my-2 text-gray-700 dark:text-gray-300">{children}</p>
    ),
    // Style math formulas
    code: ({ inline, children }: CustomComponentProps) => {
      if (inline) {
        return <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{children}</code>
      }
      return (
        <pre className="p-4 my-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto">
          <code>{children}</code>
        </pre>
      )
    }
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {response}
      </ReactMarkdown>
    </div>
  )
} 