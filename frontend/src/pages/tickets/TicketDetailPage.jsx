import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ticketAPI, messageAPI } from '../../api/services'
import { PriorityBadge, StatusBadge, Spinner } from '../../components/common/ui'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Send, ArrowLeft } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

export default function TicketDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [sendLoading, setSendLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const chatBottomRef = useRef(null)
  const stompRef = useRef(null)

  const loadData = useCallback(async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        ticketAPI.getById(id),
        messageAPI.list(id),
      ])
      setTicket(tRes.data.data)
      setMessages(mRes.data.data || [])
    } catch (e) {
      toast.error('Failed to load ticket')
      navigate('/tickets')
    } finally {
      setLoading(false)
    }
  }, [id, user.role, navigate])

  useEffect(() => { loadData() }, [loadData])

  // WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('helpdesk_token')
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(`/topic/ticket/${id}`, (msg) => {
          const data = JSON.parse(msg.body)
          setMessages(prev => {
            if (prev.some(m => m.id === data.id)) return prev
            return [...prev, data]
          })
        })
      },
      reconnectDelay: 5000,
    })
    client.activate()
    stompRef.current = client
    return () => client.deactivate()
  }, [id])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMsg.trim()) return
    setSendLoading(true)
    try {
      await messageAPI.send(id, newMsg.trim())
      setNewMsg('')
    } catch (e) {
      toast.error('Failed to send message')
    } finally {
      setSendLoading(false)
    }
  }

  const updateStatus = async (status) => {
    try {
      const { data } = await ticketAPI.updateStatus(id, status)
      setTicket(data.data)
      toast.success(`Status updated to ${status.replace('_', ' ')}`)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update status')
    }
  }


  if (loading) return (
    <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  )
  if (!ticket) return null

  const isClosed = ticket.status === 'CLOSED'
  const isAdmin = user.role === 'ADMIN'
  const canChangeStatus = isAdmin || ticket.createdBy?.id === user.id

  return (
    <div className="flex h-full animate-fade-in">
      {/* ─── Left: Ticket Info ─────────────────── */}
      <div className="w-72 flex-shrink-0 border-r overflow-y-auto p-4 space-y-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

        <button className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          onClick={() => navigate('/tickets')}>
          <ArrowLeft size={13} /> Back to tickets
        </button>

        <div>
          <p className="text-xs text-slate-500 mb-1">Ticket #{ticket.id}</p>
          <h2 className="text-sm font-600 text-white leading-snug">{ticket.title}</h2>
        </div>

        <div className="flex gap-2 flex-wrap">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>

        <div className="text-xs text-slate-400 leading-relaxed p-3 rounded-lg"
          style={{ background: 'var(--surface-3)' }}>
          {ticket.description}
        </div>

        {/* Meta */}
        <div className="space-y-2">
          {[
            { label: 'Department', value: ticket.department?.departmentName },
            { label: 'Created by', value: ticket.createdBy?.name },
            { label: 'Assigned to', value: ticket.assignedTo?.name || 'Unassigned' },
            { label: 'Created', value: format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a') },
            ticket.closedAt && { label: 'Closed', value: format(new Date(ticket.closedAt), 'MMM d, yyyy h:mm a') },
          ].filter(Boolean).map(({ label, value }) => (
            <div key={label} className="flex items-start gap-2">
              <span className="text-xs text-slate-600 w-20 flex-shrink-0">{label}</span>
              <span className="text-xs text-slate-300">{value}</span>
            </div>
          ))}
        </div>

        {/* Status Update */}
        {canChangeStatus && !isClosed && (
          <div>
            <p className="text-xs font-500 text-slate-400 mb-2">Update Status</p>
            <div className="space-y-1">
              {STATUSES.filter(s => s !== ticket.status).map(s => (
                <button key={s}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 transition-colors border border-transparent hover:border-slate-700"
                  onClick={() => updateStatus(s)}>
                  → Set {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}


      </div>

      {/* ─── Right: Chat ───────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b flex items-center gap-3"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-500 text-slate-200">Ticket Chat</span>
          <span className="text-xs text-slate-500 ml-auto">{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-slate-500">No messages yet. Start the conversation.</p>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.sender?.id === user.id
            const isStaff = msg.sender?.role === 'ADMIN'
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-600 flex-shrink-0 ${
                  isStaff ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-700 text-slate-200'
                }`}>
                  {msg.sender?.name?.[0]}
                </div>
                <div className={`max-w-lg ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-500 text-slate-400">{msg.sender?.name}</span>
                    {isStaff && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-700/30 text-indigo-300">
                        Admin
                      </span>
                    )}
                    <span className="text-xs text-slate-600">
                      {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'text-slate-200 rounded-tl-sm'
                  }`} style={!isMe ? { background: 'var(--surface-3)', border: '1px solid var(--border)' } : {}}>
                    {msg.message}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={chatBottomRef} />
        </div>

        {/* Message Input */}
        {!isClosed ? (
          <form onSubmit={sendMessage}
            className="p-4 border-t flex gap-3"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <input
              className="input flex-1"
              placeholder="Type a message..."
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              disabled={sendLoading}
            />
            <button
              type="submit"
              className="btn btn-primary px-4"
              disabled={!newMsg.trim() || sendLoading}
            >
              <Send size={15} />
            </button>
          </form>
        ) : (
          <div className="p-4 border-t text-center text-sm text-slate-500"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            This ticket is closed. No new messages allowed.
          </div>
        )}
      </div>
    </div>
  )
}
