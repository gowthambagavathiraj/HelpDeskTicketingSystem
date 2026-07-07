import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { aiAPI, feedbackAPI } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { 
  Box, Card, CardContent, Typography, TextField, Button, Grid, 
  CircularProgress, LinearProgress, Chip, Rating, Alert
} from '@mui/material'
import { 
  Bot, Send, Sparkles, Trash2, AlertTriangle, Smile
} from 'lucide-react'

const academicSuggestions = [
  "What is the minimum attendance requirement?",
  "What is the grading system for my courses?",
  "When is the end semester exam timetable published?",
  "Tell me about course credits."
]

const adminSuggestions = [
  "How do I apply for a Bus Pass?",
  "What is the process to apply for a scholarship?",
  "How can I pay my semester fees online?",
  "What are the hostel room registration rules?"
]

export default function AIAgentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('academic')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [chatHistory, setChatHistory] = useState([])
  const [showDiagnostics] = useState(true)
  const [lastDiagnostics, setLastDiagnostics] = useState(null)
  
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    loadDatabaseHistory()
    loadSuggestions('Academic queries')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory, loading])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadDatabaseHistory = async () => {
    if (!user) return
    try {
      const response = await aiAPI.getHistory()
      const logs = response.data.data || []
      // Convert database logs to local chat structure
      const formatted = logs.map(logItem => ({
        id: logItem.id,
        role: 'user',
        content: logItem.question,
        timestamp: logItem.createdAt,
        isDbRecord: true
      })).flatMap((val, index) => {
        // Interleave user and assistant answers
        const dbLog = logs[index]
        return [
          { role: 'user', content: dbLog.question, timestamp: dbLog.createdAt },
          { 
            role: 'assistant', 
            content: dbLog.answer, 
            timestamp: dbLog.createdAt,
            confidenceScore: dbLog.confidenceScore,
            intent: dbLog.intent,
            sentiment: dbLog.sentiment,
            ticketCreated: dbLog.ticketCreated,
            ticketId: dbLog.ticketId
          }
        ]
      })
      // Reverse to chronological order (since logs are desc)
      setChatHistory(formatted.reverse())
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const loadSuggestions = async (context) => {
    // API suggestions placeholder
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    const context = tab === 'academic' ? 'Academic queries' : 'Administrative queries'
    loadSuggestions(context)
  }

  const handleSubmit = async (event) => {
    if (event) event.preventDefault()
    if (!question.trim()) {
      toast.error('Please enter a question')
      return
    }

    const userQuestion = question
    setQuestion('')
    setLoading(true)

    // Add user message
    const userMessage = {
      role: 'user',
      content: userQuestion,
      timestamp: new Date().toISOString()
    }
    setChatHistory(prev => [...prev, userMessage])

    try {
      const contextStr = activeTab === 'academic' ? 'Academic queries' : 'Administrative queries'
      const response = await aiAPI.ask({ question: userQuestion, context: contextStr }, sessionId)
      const data = response.data.data

      const assistantMessage = {
        role: 'assistant',
        content: data.answer,
        confidenceScore: data.confidenceScore,
        intent: data.intent,
        sentiment: data.sentiment,
        suggestedFAQs: data.suggestedFAQs,
        ticketCreated: data.ticketCreated,
        ticketId: data.ticketId,
        timestamp: new Date().toISOString()
      }

      setChatHistory(prev => [...prev, assistantMessage])
      setLastDiagnostics({
        confidenceScore: data.confidenceScore,
        intent: data.intent,
        sentiment: data.sentiment
      })
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to connect to CampusBot'
      toast.error(errMsg)
      setChatHistory(prev => [...prev, {
        role: 'error',
        content: errMsg,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleRatingSubmit = async (val, type) => {
    try {
      await feedbackAPI.submit({
        aiRating: type === 'ai' ? val : 5,
        staffRating: 5,
        overallRating: 5,
        comment: `Inline chat feedback score: ${val}`
      })
      toast.success('Thank you for rating this response!')
    } catch (e) {
      toast.error('Failed to submit rating')
    }
  }

  const clearChat = async () => {
    if (window.confirm('Clear all conversation history?')) {
      try {
        await aiAPI.clearHistory(sessionId)
        setChatHistory([])
        setLastDiagnostics(null)
        toast.success('Chat history cleared')
      } catch (error) {
        toast.error('Failed to clear history')
      }
    }
  }

  const handleSuggestClick = (q) => {
    setQuestion(q)
    inputRef.current?.focus()
  }

  const currentSuggestions = activeTab === 'academic' ? academicSuggestions : adminSuggestions

  return (
    <Box sx={{ p: 4 }} className="animate-fade-in">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Bot size={32} className="text-blue-500" />
            CampusBot AI Assistant
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Ask questions about academic schedules, exams, placement cells, and fees in natural language.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Trash2 size={16} />}
            onClick={clearChat}
            disabled={chatHistory.length === 0}
          >
            Clear History
          </Button>
        </Box>
      </Box>

      {/* Grid containing Chat Panel and Diagnostics Panel */}
      <Grid container spacing={4}>
        {/* Sidebar suggestions */}
        <Grid item xs={12} lg={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Context Switcher */}
            <Card>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Assistant Focus</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button 
                      fullWidth 
                      variant={activeTab === 'academic' ? 'contained' : 'outlined'} 
                      onClick={() => handleTabChange('academic')}
                      size="small"
                    >
                      Academic
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button 
                      fullWidth 
                      variant={activeTab === 'administrative' ? 'contained' : 'outlined'} 
                      onClick={() => handleTabChange('administrative')}
                      size="small"
                      color="secondary"
                    >
                      Admin
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Quick Prompts */}
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Suggested Queries</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {currentSuggestions.map((q, idx) => (
                    <Button 
                      key={idx} 
                      variant="text" 
                      onClick={() => handleSuggestClick(q)}
                      sx={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: '0.75rem', py: 0.5, px: 1, color: 'text.secondary' }}
                    >
                      • {q}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Live Diagnostics Card */}
            {lastDiagnostics && showDiagnostics && (
              <Card sx={{ borderLeft: '4px solid #8b5cf6' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Sparkles size={16} className="text-purple-500" />
                    AI Engine Diagnostics
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="textSecondary">Confidence Score</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{Math.round(lastDiagnostics.confidenceScore * 100)}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={lastDiagnostics.confidenceScore * 100} 
                        color={lastDiagnostics.confidenceScore >= 0.8 ? 'success' : lastDiagnostics.confidenceScore >= 0.6 ? 'warning' : 'error'}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="textSecondary">User Intent</Typography>
                      <Chip label={lastDiagnostics.intent} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600 }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="textSecondary">Student Sentiment</Typography>
                      <Chip 
                        icon={<Smile size={12} />} 
                        label={lastDiagnostics.sentiment} 
                        size="small" 
                        color={lastDiagnostics.sentiment === 'FRUSTRATED' || lastDiagnostics.sentiment === 'URGENT' ? 'error' : 'default'} 
                        sx={{ fontSize: '0.65rem', fontWeight: 600 }} 
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Grid>

        {/* Chat window */}
        <Grid item xs={12} lg={9}>
          <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column', p: 0 }}>
            {/* Conversations container */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {chatHistory.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', py: 8 }}>
                  <Bot size={48} className="text-slate-500 mb-3 animate-bounce" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>How can I help you today?</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 400, mt: 1 }}>
                    Type your academic or administrative question below. If I can't resolve it, a ticket will be auto-generated for support staff.
                  </Typography>
                </Box>
              ) : (
                chatHistory.map((msg, idx) => (
                  <Box 
                    key={idx} 
                    sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      width: '100%' 
                    }}
                  >
                    {msg.role !== 'user' && (
                      <Box sx={{ p: 1, borderRadius: 2, backgroundColor: 'primary.light', color: 'primary.contrastText', height: 36, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bot size={20} />
                      </Box>
                    )}
                    <Box 
                      sx={{ 
                        maxWidth: '75%', 
                        p: 2, 
                        borderRadius: 3, 
                        backgroundColor: msg.role === 'user' ? 'rgba(59, 130, 246, 0.15)' : msg.role === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'var(--surface-2)',
                        border: msg.role === 'user' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--border)'
                      }}
                    >
                      <Typography variant="body2" className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </Typography>

                      {/* Display Alert for auto-created ticket */}
                      {msg.ticketCreated && msg.ticketId && (
                        <Alert 
                          severity="warning" 
                          icon={<AlertTriangle size={18} />} 
                          sx={{ mt: 2, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Support Ticket Opened</Typography>
                          <Typography variant="caption" color="textSecondary" display="block">
                            I opened ticket <b>#{msg.ticketId}</b> because this request requires manual administrative approval.
                          </Typography>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            color="inherit" 
                            onClick={() => navigate(`/tickets/${msg.ticketId}`)}
                            sx={{ mt: 1, fontSize: '0.65rem' }}
                          >
                            Track Ticket Status
                          </Button>
                        </Alert>
                      )}

                      {/* Follow-up suggested FAQs */}
                      {msg.suggestedFAQs && msg.suggestedFAQs.length > 0 && (
                        <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Related Questions:</Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {msg.suggestedFAQs.map((faq, fIdx) => (
                              <Chip 
                                key={fIdx} 
                                label={faq} 
                                size="small" 
                                onClick={() => handleSuggestClick(faq)}
                                sx={{ fontSize: '0.7rem', cursor: 'pointer' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Response Footer (Timestamp & Rating) */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, pt: 1, borderTop: '1px dotted var(--border)' }}>
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </Typography>
                        
                        {msg.role === 'assistant' && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>Rate response:</Typography>
                            <Rating 
                              size="small" 
                              defaultValue={5} 
                              onChange={(event, val) => handleRatingSubmit(val, 'ai')}
                              sx={{ fontSize: '0.8rem' }}
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))
              )}

              {/* Typing indicators */}
              {loading && (
                <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                  <Box sx={{ p: 1, borderRadius: 2, backgroundColor: 'primary.light', color: 'primary.contrastText', height: 36, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress size={16} color="inherit" />
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 3, backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
                      CampusBot is analyzing query parameters...
                    </Typography>
                  </Box>
                </Box>
              )}
              <div ref={chatEndRef} />
            </Box>

            {/* Form input */}
            <form onSubmit={handleSubmit} style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs>
                  <TextField
                    fullWidth
                    inputRef={inputRef}
                    placeholder={
                      activeTab === 'academic'
                        ? 'Ask about exams, timetables, syllabus, placement drives...'
                        : 'Ask about hostel rooms, fee payment, bus passes...'
                    }
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit()
                      }
                    }}
                  />
                </Grid>
                <Grid item>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    disabled={loading || !question.trim()}
                    sx={{ height: 56, px: 3 }}
                  >
                    <Send size={18} />
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
