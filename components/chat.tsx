"use client"

import { useState } from 'react'
import { FormattedResponse } from './formatted-response'
import { CalculatorType } from './calculator-layout'
import { BookOpen, Calculator, Loader2 } from 'lucide-react'

const SUGGESTED_QUESTIONS = [
  "How do I calculate compound interest?",
  "What's the formula for present value?",
  "Explain the time value of money",
  "How to use the retirement calculator?",
];

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  metadata?: {
    hasFormula: boolean
    hasCalculatorLink: boolean
    calculatorType: string | null
  }
}

interface ChatProps {
  onCalculatorSelect?: (calculator: CalculatorType) => void
}

export function Chat({ onCalculatorSelect }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent, suggestedQuestion?: string) => {
    e.preventDefault()
    const messageToSend = suggestedQuestion || input.trim()
    if (!messageToSend || isLoading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      })

      const data = await response.json()
      
      if (response.ok) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.response,
          metadata: data.metadata
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        console.error('Failed to get response:', data.error)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100%-56px)] md:h-full bg-background text-foreground">
      <div className="flex flex-col flex-1 min-h-0">
        {messages.length === 0 && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Calculator className="h-4 w-4 text-white" />
              </div>
              <p className="text-[15px]">Hi! Ask me about financial calculations and concepts.</p>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {messages.length === 0 ? (
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Suggested Questions</h3>
              <div className="space-y-2">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg border hover:bg-muted text-left"
                    onClick={(e) => handleSubmit(e, question)}
                  >
                    <BookOpen className="h-4 w-4" />
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 break-words ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    {message.role === 'assistant' && message.metadata ? (
                      <div className="prose dark:prose-invert max-w-none prose-sm">
                        <FormattedResponse
                          response={message.content}
                          metadata={message.metadata}
                          onCalculatorSelect={onCalculatorSelect}
                        />
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="p-4 border-t mt-auto">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about financial concepts and calculations..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border bg-background"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
} 