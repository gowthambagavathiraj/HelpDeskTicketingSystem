import { useState } from 'react'
import toast from 'react-hot-toast'
import { aiAPI } from '../api/services'
import { Bot, ClipboardList, LifeBuoy, Send, Sparkles, Wand2 } from 'lucide-react'

const quickPrompts = [
  {
    icon: ClipboardList,
    title: 'Draft Ticket',
    context: 'Ticket creation',
    prompt: 'Turn this issue into a clear helpdesk ticket with title, description, priority, and first troubleshooting steps: ',
  },
  {
    icon: LifeBuoy,
    title: 'Troubleshoot',
    context: 'Troubleshooting',
    prompt: 'Help me troubleshoot this user issue step by step: ',
  },
  {
    icon: Wand2,
    title: 'Reply',
    context: 'Support reply',
    prompt: 'Write a professional support reply for this ticket update: ',
  },
]

export default function AIAgentPage() {
  const [question, setQuestion] = useState('')
  const [context, setContext] = useState('General helpdesk support')
  const [answer, setAnswer] = useState('')
  const [model, setModel] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!question.trim()) {
      toast.error('Ask the agent something first.')
      return
    }

    setLoading(true)
    try {
      const response = await aiAPI.ask({ question, context })
      setAnswer(response.data.data?.answer || '')
      setModel(response.data.data?.model || '')
    } catch (error) {
      const message = error.response?.data?.message || 'AI agent is unavailable right now.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handlePromptClick = (item) => {
    setContext(item.context)
    setQuestion(item.prompt)
  }

  return (
    <div className="min-h-full p-6 animate-fade-in">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-600 text-cyan-300">
            <Sparkles size={13} />
            Gemini Agent
          </div>
          <h1 className="text-xl font-600 text-white">AI Helpdesk Agent</h1>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="card" style={{ padding: '1rem' }}>
            <h2 className="mb-3 text-sm font-600 text-white">Quick Actions</h2>
            <div className="space-y-2">
              {quickPrompts.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => handlePromptClick(item)}
                    className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:border-slate-700 hover:bg-white/5"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-300 ring-1 ring-teal-400/20">
                      <Icon size={17} />
                    </span>
                    <span>
                      <span className="block text-sm font-500 text-slate-200">{item.title}</span>
                      <span className="block text-xs text-slate-500">{item.context}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        <section className="card flex min-h-[620px] flex-col" style={{ padding: 0 }}>
          <form onSubmit={handleSubmit} className="border-b p-4" style={{ borderColor: 'var(--border)' }}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-400/20">
                <Bot size={19} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-600 text-white">Ask SmartDesk AI</h2>
              </div>
            </div>

            <label className="mb-2 block text-xs font-600 uppercase tracking-widest text-slate-600">
              Context
            </label>
            <select
              className="input mb-3"
              value={context}
              onChange={(event) => setContext(event.target.value)}
            >
              <option>General helpdesk support</option>
              <option>Ticket creation</option>
              <option>Troubleshooting</option>
              <option>Support reply</option>
              <option>Priority and routing</option>
            </select>

            <label className="mb-2 block text-xs font-600 uppercase tracking-widest text-slate-600">
              Request
            </label>
            <textarea
              className="input min-h-[150px] resize-y"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Example: A user cannot connect to office Wi-Fi after password reset. Draft a ticket and first troubleshooting checklist."
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">{question.length}/4000 characters</p>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                Ask Agent
              </button>
            </div>
          </form>

          <div className="flex-1 p-4">
            {answer ? (
              <div className="rounded-lg border border-slate-700/70 bg-slate-950/30 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-600 text-white">
                    <Sparkles size={15} className="text-cyan-300" />
                    Response
                  </div>
                  {model && <span className="text-xs text-slate-500">{model}</span>}
                </div>
                <div className="whitespace-pre-wrap text-sm leading-6 text-slate-300">{answer}</div>
              </div>
            ) : (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 text-center">
                <Bot size={34} className="mb-3 text-slate-600" />
                <p className="text-sm font-500 text-slate-300">No response yet</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Choose a quick action or ask a helpdesk question to generate a practical answer.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
