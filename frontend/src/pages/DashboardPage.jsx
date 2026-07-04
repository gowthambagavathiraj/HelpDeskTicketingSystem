import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ticketAPI, adminAPI } from '../api/services'
import { StatCard, PriorityBadge, StatusBadge, Spinner } from '../components/common/ui'
import { Ticket, CheckCircle, Clock, AlertTriangle, PlusCircle, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function DashboardPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes] = await Promise.all([
          ticketAPI.list({ page: 0, size: 5, sortBy: 'createdAt', sortDir: 'desc' })
        ])
        setTickets(tRes.data.data?.content || [])

        if (user.role === 'ADMIN') {
          const aRes = await adminAPI.getAnalytics()
          setAnalytics(aRes.data.data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.role])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Spinner size="lg" />
    </div>
  )

  const openCount = tickets.filter(t => t.status === 'OPEN').length
  const criticalCount = tickets.filter(t => t.priority === 'CRITICAL').length

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-600 text-white">
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">Here's what's happening in your helpdesk today.</p>
      </div>

      {/* Stats Grid */}
      {user.role === 'ADMIN' && analytics ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard label="Total Tickets" value={analytics.totalTickets} icon={Ticket} color="indigo" />
          <StatCard label="Open" value={analytics.openTickets} icon={Clock} color="yellow" />
          <StatCard label="Resolved" value={analytics.resolvedTickets} icon={CheckCircle} color="green" />
          <StatCard label="Closed" value={analytics.closedTickets} icon={CheckCircle} color="slate" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard label="My Tickets" value={tickets.length} icon={Ticket} color="indigo" />
          <StatCard label="Open" value={openCount} icon={Clock} color="yellow" />
          <StatCard label="Critical" value={criticalCount} icon={AlertTriangle} color="red" />
          <StatCard label="Resolved" value={tickets.filter(t => t.status === 'RESOLVED').length} icon={CheckCircle} color="green" />
        </div>
      )}

      {/* Recent Tickets */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-600 text-white">Recent Tickets</h2>
          <Link to="/tickets" className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
            View all <ChevronRight size={12} />
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-10">
            <Ticket size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No tickets yet.</p>
            {user.role === 'USER' && (
              <Link to="/tickets/new" className="btn btn-primary mt-3 text-xs">
                <PlusCircle size={14} /> Create First Ticket
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map(ticket => (
              <Link key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-500 text-slate-200 truncate group-hover:text-white">
                    #{ticket.id} {ticket.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {ticket.department?.departmentName} · {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {user.role === 'USER' ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link to="/tickets/new" className="card flex items-center gap-3 hover:border-green-500/50 transition-colors cursor-pointer" style={{ padding: '1rem' }}>
            <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center">
              <PlusCircle size={16} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm font-500 text-white">New Ticket</p>
              <p className="text-xs text-slate-500">Report an issue</p>
            </div>
          </Link>
          <Link to="/tickets" className="card flex items-center gap-3 hover:border-green-500/50 transition-colors cursor-pointer" style={{ padding: '1rem' }}>
            <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
              <Ticket size={16} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-500 text-white">All Tickets</p>
              <p className="text-xs text-slate-500">View & manage</p>
            </div>
          </Link>
        </div>
      ) : (
        <div className="mt-4">
          <Link to="/tickets" className="card flex items-center gap-3 hover:border-green-500/50 transition-colors cursor-pointer" style={{ padding: '1rem' }}>
            <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
              <Ticket size={16} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-500 text-white">Manage Tickets</p>
              <p className="text-xs text-slate-500">Review, assign & resolve</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
