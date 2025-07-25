'use client'

import { useState } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { UploadedFile, ChatMessage } from '@/types'
import { useMutation } from 'react-query'
import toast from 'react-hot-toast'

interface ChatInterfaceProps {
  uploadedFiles: UploadedFile[]
}

export default function ChatInterface({ uploadedFiles }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI job application assistant. I can help you with resume optimization, cover letter writing, interview preparation, and job matching. Upload your documents and let\'s get started!',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')

  const sendMessageMutation = useMutation(
    async (message: string) => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          uploadedFiles: uploadedFiles.map(f => ({ name: f.name, content: f.content }))
        }),
      })
      if (!response.ok) throw new Error('Failed to send message')
      return response.json()
    },
    {
      onSuccess: (data) => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }])
      },
      onError: () => {
        toast.error('Failed to send message. Please try again.')
      }
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    sendMessageMutation.mutate(input)
    setInput('')
  }

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'justify-end' : ''
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-600" />
              </div>
            )}
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.content}
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {sendMessageMutation.isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-600" />
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="spinner"></div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about job applications, resume optimization, or interview tips..."
            className="flex-1 input-field"
            disabled={sendMessageMutation.isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || sendMessageMutation.isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {uploadedFiles.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Using {uploadedFiles.length} uploaded document{uploadedFiles.length > 1 ? 's' : ''} for context
          </div>
        )}
      </form>
    </div>
  )
} 