import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ticketAPI } from '../../api/services'
import { PriorityBadge, StatusBadge, EmptyState, Spinner, PageHeader } from '../../components/common/ui'
import { Search, PlusCircle, Ticket, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
const PRIORITIES = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function TicketListPage() {
  const [tickets, setTickets] = useState([])
  const [meta, setMeta] = useState({ totalElements: 0, totalPages: 0, page: 0 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ keyword: '', status: '', priority: '', page: 0, size: 12 })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      const { data } = await ticketAPI.list(params)
      const page = data.data || {}
      setTickets(page.content || [])
      setMeta({ totalElements: page.totalElements || 0, totalPages: page.totalPages || 0, page: page.number || 0 })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const setFilter = (key) => (e) =>
    setFilters(p => ({ ...p, [key]: e.target.value, page: 0 }))

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        title="Tickets"
        subtitle={`${meta.totalElements} total ticket${meta.totalElements !== 1 ? 's' : ''}`}
        actions={
          <Link to="/tickets/new" className="btn btn-primary">
            <PlusCircle size={15} /> New Ticket
          </Link>
        }
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-9" placeholder="Search tickets..."
            value={filters.keyword} onChange={setFilter('keyword')} />
        </div>
        <select className="input w-36" value={filters.status} onChange={setFilter('status')}>
          <option value="">All Status</option>
          {STATUSES.slice(1).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className="input w-36" value={filters.priority} onChange={setFilter('priority')}>
          <option value="">All Priority</option>
          {PRIORITIES.slice(1).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No tickets found"
          description="Try adjusting your filters or create a new ticket."
          action={<Link to="/tickets/new" className="btn btn-primary"><PlusCircle size={14} />Create Ticket</Link>}
        />
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                    {['#', 'Title', 'Department', 'Priority', 'Status', 'Created By', 'Assigned To', 'Messages', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-600 uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket, i) => (
                    <tr
                      key={ticket.id}
                      className="group transition-colors"
                      style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                    >
                      <td className="px-4 py-3 text-xs font-500 text-slate-500">#{ticket.id}</td>
                      <td className="px-4 py-3 max-w-48">
                        <Link to={`/tickets/${ticket.id}`}
                          className="text-sm font-500 text-slate-200 hover:text-indigo-300 transition-colors truncate block">
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{ticket.department?.departmentName}</td>
                      <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-indigo-700 flex items-center justify-center text-xs text-white">
                            {ticket.createdBy?.name?.[0]}
                          </div>
                          <span className="truncate max-w-24">{ticket.createdBy?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {ticket.assignedTo ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center text-xs text-white">
                              {ticket.assignedTo.name?.[0]}
                            </div>
                            <span className="truncate max-w-24">{ticket.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MessageSquare size={12} /> {ticket.messageCount}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-slate-500">
                Page {meta.page + 1} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  className="btn btn-ghost py-1.5 px-3"
                  disabled={meta.page === 0}
                  onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  className="btn btn-ghost py-1.5 px-3"
                  disabled={meta.page >= meta.totalPages - 1}
                  onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
