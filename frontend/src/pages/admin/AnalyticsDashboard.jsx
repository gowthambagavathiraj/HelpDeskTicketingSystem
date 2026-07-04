import { useState, useEffect } from 'react'
import { adminAPI } from '../../api/services'
import { StatCard, Spinner, PageHeader } from '../../components/common/ui'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Ticket, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

const COLORS = {
  LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444', CRITICAL: '#dc2626',
  OPEN: '#6366f1', IN_PROGRESS: '#f59e0b', RESOLVED: '#10b981', CLOSED: '#64748b',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.fill || '#818cf8' }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(({ data }) => setData(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (!data) return null

  const priorityData = Object.entries(data.ticketsByPriority || {}).map(([name, value]) => ({ name, value }))
  const deptData = Object.entries(data.ticketsByDepartment || {}).map(([name, value]) => ({ name, value }))
  const statusData = Object.entries(data.ticketsByStatus || {}).map(([name, value]) => ({
    name: name.replace('_', ' '), value, fill: COLORS[name]
  }))

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader title="Analytics" subtitle="Overview of all helpdesk activity" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Tickets" value={data.totalTickets} icon={Ticket} color="indigo" />
        <StatCard label="Open" value={data.openTickets} icon={AlertTriangle} color="yellow" />
        <StatCard label="In Progress" value={data.inProgressTickets} icon={Clock} color="indigo" />
        <StatCard label="Resolved" value={data.resolvedTickets} icon={CheckCircle} color="green" />
        <StatCard 
          label="Avg Resolution" 
          value={data.averageResolutionTimeHours ? `${data.averageResolutionTimeHours}h` : 'N/A'} 
          icon={Clock} 
          color="slate" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status breakdown */}
        <div className="card">
          <h3 className="text-sm font-600 text-white mb-4">Tickets by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority breakdown */}
        <div className="card">
          <h3 className="text-sm font-600 text-white mb-4">Tickets by Priority</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData} barSize={30}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Tickets" radius={[4, 4, 0, 0]}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[entry.name] || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department breakdown */}
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-600 text-white mb-4">Tickets by Department</h3>
          {deptData.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No department data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptData} barSize={32}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Tickets" radius={[4, 4, 0, 0]} fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
