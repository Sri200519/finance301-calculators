"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, Calculator, BookOpen } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "How do I calculate compound interest?",
  "What's the formula for present value?",
  "Explain the time value of money",
  "How to use the retirement calculator?",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent, suggestedQuestion?: string) => {
    e.preventDefault();
    const messageToSend = suggestedQuestion || input.trim();
    if (!messageToSend || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white">
      <div className="flex flex-col flex-1 min-h-0">
        {messages.length === 0 && (
          <div className="p-4 border-b border-[#333]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Calculator className="h-4 w-4 text-white" />
              </div>
              <p className="text-[15px]">Hi! Ask me about financial calculations and concepts.</p>
            </div>
          </div>
        )}
        
        <ScrollArea className="flex-1">
          <div className="p-4">
            {messages.length === 0 ? (
              <div>
                <h3 className="text-sm text-gray-400 mb-2">Suggested Questions</h3>
                <div className="space-y-2">
                  {SUGGESTED_QUESTIONS.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start gap-2 text-[13px] h-10 bg-[#1A1A1A] border-[#333] hover:bg-[#252525] text-white"
                      onClick={() => handleSubmit(new Event('submit') as any, question)}
                    >
                      <BookOpen className="h-4 w-4" />
                      {question}
                    </Button>
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
                      className={`max-w-[85%] rounded-lg p-3 text-sm ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#1A1A1A] text-white'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#1A1A1A] rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-[#333]">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about financial concepts and calculations..."
            className="flex-1 text-sm h-10 bg-[#1A1A1A] border-[#333] text-white placeholder-gray-400"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white h-10"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
} 