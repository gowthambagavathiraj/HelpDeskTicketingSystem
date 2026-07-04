import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Ticket, PlusCircle, BarChart3,
  Users, Settings, LogOut, Zap, Bot
} from 'lucide-react'

const NavItem = ({ to, icon: Icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        isActive
          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`
    }
  >
    <Icon size={16} />
    <span>{label}</span>
  </NavLink>
)

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'ADMIN'
  const isSupport = user?.role === 'SUPPORT_STAFF'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* ─── Sidebar ─────────────────────────── */}
      <aside
        className="flex flex-col w-60 flex-shrink-0 border-r"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-700 text-white tracking-tight">SmartDesk</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-600 uppercase tracking-widest text-slate-600">Main</p>
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end />
          <NavItem to="/tickets" icon={Ticket} label="Tickets" />
          <NavItem to="/tickets/new" icon={PlusCircle} label="New Ticket" />
          <NavItem to="/ai-agent" icon={Bot} label="AI Agent" />

          {(isAdmin || isSupport) && (
            <>
              <p className="px-3 mt-5 mb-2 text-xs font-600 uppercase tracking-widest text-slate-600">Admin</p>
              {isAdmin && <NavItem to="/admin/analytics" icon={BarChart3} label="Analytics" />}
              {isAdmin && <NavItem to="/admin/users" icon={Users} label="Users" />}
              {isAdmin && <NavItem to="/admin" icon={Settings} label="Settings" />}
            </>
          )}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-700 text-white flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-500 text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
