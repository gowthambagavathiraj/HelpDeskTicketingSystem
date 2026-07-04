// Priority & Status badge components
export const PriorityBadge = ({ priority }) => {
  const map = {
    LOW: 'badge-low',
    MEDIUM: 'badge-medium',
    HIGH: 'badge-high',
    CRITICAL: 'badge-critical',
  }
  return <span className={`badge ${map[priority] || 'badge-medium'}`}>{priority}</span>
}

export const StatusBadge = ({ status }) => {
  const map = {
    OPEN: 'badge-open',
    IN_PROGRESS: 'badge-in_progress',
    RESOLVED: 'badge-resolved',
    CLOSED: 'badge-closed',
  }
  const labels = {
    IN_PROGRESS: 'In Progress',
    OPEN: 'Open', RESOLVED: 'Resolved', CLOSED: 'Closed',
  }
  return <span className={`badge ${map[status] || 'badge-open'}`}>{labels[status] || status}</span>
}

export const StatCard = ({ label, value, icon: Icon, color = 'indigo', trend }) => {
  const colors = {
    indigo: { bg: 'rgba(99,102,241,0.1)', text: '#818cf8', border: 'rgba(99,102,241,0.2)' },
    green:  { bg: 'rgba(16,185,129,0.1)', text: '#34d399', border: 'rgba(16,185,129,0.2)' },
    yellow: { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
    red:    { bg: 'rgba(239,68,68,0.1)',  text: '#f87171', border: 'rgba(239,68,68,0.2)' },
    slate:  { bg: 'rgba(100,116,139,0.1)',text: '#94a3b8', border: 'rgba(100,116,139,0.2)' },
  }
  const c = colors[color] || colors.indigo

  return (
    <div className="card flex items-start gap-4" style={{ padding: '1.25rem' }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: c.bg, border: `1px solid ${c.border}` }}>
        <Icon size={18} style={{ color: c.text }} />
      </div>
      <div>
        <p className="text-2xl font-700 text-white">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-xl font-600 text-white">{title}</h1>
      {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
)

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
      <Icon size={24} className="text-slate-500" />
    </div>
    <h3 className="text-base font-500 text-slate-300 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 mb-4 max-w-xs">{description}</p>
    {action}
  </div>
)

export const Spinner = ({ size = 'sm' }) => (
  <div className={`${size === 'sm' ? 'w-4 h-4' : 'w-8 h-8'} rounded-full border-2 border-indigo-500 border-t-transparent animate-spin`} />
)
