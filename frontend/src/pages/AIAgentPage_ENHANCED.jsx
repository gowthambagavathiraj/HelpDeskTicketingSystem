import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { aiAPI } from '../api/services'
import { Bot, Building2, Clock, Copy, Download, GraduationCap, History, RefreshCw, Send, Sparkles, Trash2, X } from 'lucide-react'

const academicActions = [
  { icon: GraduationCap, title: 'Course Info', prompt: 'Tell me about course prerequisites for: ' },
  { icon: GraduationCap, title: 'Exam Schedule', prompt: 'When are the exams for: ' },
  { icon: GraduationCap, title: 'Assignment Help', prompt: 'Help me understand this assignment: ' },
  { icon: GraduationCap, title: 'Study Resources', prompt: 'Where can I find study materials for: ' },
]

const administrativeActions = [
  { icon: Building2, title: 'Registration', prompt: 'How do I register for: ' },
  { icon: Building2, title: 'Fees', prompt: 'Tell me about fees for: ' },
  { icon: Building2, title: 'Scholarship', prompt: 'What scholarships are available for: ' },
  { icon: Building2, title: 'Facilities', prompt: 'Tell me about campus facilities: ' },
]

export default function AIAgentPage() {
  const [activeTab, setActiveTab] = useState('academic')
  const [question, setQuestion] = useState('')
  const [context, setContext] = useState('Academic queries')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [conversationHistory, setConversationHistory] = useState([])
  const [suggestedQuestions, setSuggestedQuestions] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [stats, setStats] = useState({ totalQuestions: 0, avgResponseTime: 0 })
  
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    loadSuggestions(context)
    scrollToBottom()
  }, [context])

  useEffect(() => {
    scrollToBottom()
  }, [conversationHistory])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadSuggestions = async (ctx) => {
    try {
      const response = await aiAPI.getSuggestions(ctx)
      setSuggestedQuestions(response.data.data || [])
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!question.trim()) {
      toast.error('Please enter a question')
      return
    }

    const userQuestion = question
    setQuestion('')
    setLoading(true)

    const startTime = Date.now()
    
    // Add user message immediately
    const userMessage = {
      role: 'user',
      content: userQuestion,
      timestamp: new Date().toISOString()
    }
    setConversationHistory(prev => [...prev, userMessage])

    try {
      const response = await aiAPI.ask({ question: userQuestion, context }, sessionId)
      const responseTime = Date.now() - startTime
      
      const assistantMessage = {
        role: 'assistant',
        content: response.data.data?.answer || '',
        model: response.data.data?.model || '',
        timestamp: new Date().toISOString(),
        responseTime
      }
      
      setConversationHistory(prev => [...prev, assistantMessage])
      
      // Update stats
      setStats(prev => ({
        totalQuestions: prev.totalQuestions + 1,
        avgResponseTime: ((prev.avgResponseTime * prev.totalQuestions) + responseTime) / (prev.totalQuestions + 1)
      }))
      
      toast.success('Response received')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to get response'
      toast.error(errorMessage)
      
      // Add error message to chat
      setConversationHistory(prev => [...prev, {
        role: 'error',
        content: errorMessage,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    const newContext = tab === 'academic' ? 'Academic queries' : 'Administrative queries'
    setContext(newContext)
    loadSuggestions(newContext)
  }

  const handlePromptClick = (prompt) => {
    setQuestion(prompt)
    inputRef.current?.focus()
  }

  const handleSuggestionClick = (suggestion) => {
    setQuestion(suggestion)
    inputRef.current?.focus()
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const clearConversation = async () => {
    if (window.confirm('Clear entire conversation history?')) {
      try {
        await aiAPI.clearHistory(sessionId)
        setConversationHistory([])
        setStats({ totalQuestions: 0, avgResponseTime: 0 })
        toast.success('Conversation cleared')
      } catch (error) {
        toast.error('Failed to clear history')
      }
    }
  }

  const exportConversation = () => {
    const text = conversationHistory
      .map(msg => `[${msg.role.toUpperCase()}] ${new Date(msg.timestamp).toLocaleString()}\n${msg.content}\n`)
      .join('\n---\n\n')
    
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `campusbot-conversation-${new Date().toISOString()}.txt`
    a.click()
    toast.success('Conversation exported')
  }

  const currentActions = activeTab === 'academic' ? academicActions : administrativeActions

  return (
    <div className="min-h-full p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-green-400/20 bg-green-400/10 px-2.5 py-1 text-xs font-600 text-green-300">
            <Sparkles size={13} />
            Groq AI (Llama 3.3) • Enhanced
          </div>
          <h1 className="text-xl font-600 text-white">CampusBot - AI Assistant</h1>
          <p className="mt-1 text-sm text-slate-400">
            {stats.totalQuestions > 0 && (
              <span>{stats.totalQuestions} questions • Avg response: {Math.round(stats.avgResponseTime)}ms</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn btn-secondary"
            title="Toggle chat history"
          >
            <History size={16} />
          </button>
          <button
            onClick={exportConversation}
            className="btn btn-secondary"
            disabled={conversationHistory.length === 0}
            title="Export conversation"
          >
            <Download size={16} />
          </button>
          <button
            onClick={clearConversation}
            className="btn btn-secondary"
            disabled={conversationHistory.length === 0}
            title="Clear conversation"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 border-b border-slate-700/50">
        <button
          onClick={() => handleTabChange('academic')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-500 transition-colors border-b-2 ${
            activeTab === 'academic'
              ? 'border-green-500 text-green-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <GraduationCap size={18} />
          Academic & Support
        </button>
        <button
          onClick={() => handleTabChange('administrative')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-500 transition-colors border-b-2 ${
            activeTab === 'administrative'
              ? 'border-green-500 text-green-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <Building2 size={18} />
          Administrative Services
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Quick Actions */}
          <div className="card" style={{ padding: '1rem' }}>
            <h2 className="mb-3 text-sm font-600 text-white">Quick Start</h2>
            <div className="space-y-2">
              {currentActions.map((item, idx) => {
                const Icon = item.icon
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePromptClick(item.prompt)}
                    className="flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-left transition-colors hover:border-slate-700 hover:bg-white/5"
                  >
                    <Icon size={16} className="text-green-400" />
                    <span className="text-sm font-500 text-slate-200">{item.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Suggested Questions */}
          {suggestedQuestions.length > 0 && (
            <div className="card" style={{ padding: '1rem' }}>
              <h2 className="mb-3 text-sm font-600 text-white">Suggested Questions</h2>
              <div className="space-y-2">
                {suggestedQuestions.slice(0, 4).map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(question)}
                    className="w-full text-left text-xs text-slate-400 hover:text-green-400 transition-colors"
                  >
                    • {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Chat Area */}
        <div className="card flex flex-col" style={{ padding: 0, minHeight: '600px', maxHeight: '80vh' }}>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversationHistory.length === 0 ? (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                <Bot size={48} className="mb-4 text-slate-600" />
                <p className="text-lg font-500 text-slate-300">Start a conversation with CampusBot</p>
                <p className="mt-2 max-w-md text-sm text-slate-500">
                  {activeTab === 'academic' 
                    ? 'Ask about courses, exams, assignments, or any academic topic.'
                    : 'Ask about registration, fees, scholarships, facilities, or any administrative service.'
                  }
                </p>
              </div>
            ) : (
              conversationHistory.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role !== 'user' && (
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                        <Bot size={16} />
                      </div>
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user' 
                      ? 'bg-green-600/20 text-slate-200' 
                      : msg.role === 'error'
                      ? 'bg-red-600/20 text-red-300'
                      : 'bg-slate-800/50 text-slate-300'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <Clock size={12} />
                      {new Date(msg.timestamp).toLocaleTimeString()}
                      {msg.responseTime && ` • ${msg.responseTime}ms`}
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(msg.content)}
                          className="ml-auto hover:text-green-400 transition-colors"
                          title="Copy response"
                        >
                          <Copy size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                  <RefreshCw size={16} className="animate-spin" />
                </div>
                <div className="rounded-lg bg-slate-800/50 p-3">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="animate-pulse">CampusBot is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="border-t border-slate-700/50 p-4">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                className="input flex-1 min-h-[60px] max-h-[120px] resize-y"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder={
                  activeTab === 'academic'
                    ? 'Ask about courses, exams, assignments...'
                    : 'Ask about registration, fees, facilities...'
                }
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary h-[60px]"
                disabled={loading || !question.trim()}
              >
                {loading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>{question.length}/4000</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
