import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { notificationAPI } from '../../api/services'
import {
  LayoutDashboard, Ticket, PlusCircle, BarChart3,
  Users, LogOut, Bot, HelpCircle, Megaphone, 
  MessageSquare, Moon, Sun
} from 'lucide-react'
import { useColorMode } from '../../context/ThemeContext'
import { IconButton } from '@mui/material'

const NavItem = ({ to, icon: Icon, label, end, badgeContent }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`
    }
  >
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span>{label}</span>
    </div>
    {badgeContent > 0 && (
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-700 text-white">
        {badgeContent}
      </span>
    )}
  </NavLink>
)

export default function Layout() {
  const { user, logout } = useAuth()
  const { mode, toggleColorMode } = useColorMode()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadUnreadNotificationCount()
    const timer = setInterval(loadUnreadNotificationCount, 15000) // Poll every 15s
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUnreadNotificationCount = async () => {
    if (!user) return
    try {
      const response = await notificationAPI.getUnreadCount()
      setUnreadCount(response.data.data || 0)
    } catch (e) {
      console.error(e)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'ADMIN'
  const isSupport = user?.role === 'SUPPORT_STAFF'
  const isStudent = user?.role === 'USER'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* ─── Sidebar ─────────────────────────── */}
      <aside
        className="flex flex-col w-64 flex-shrink-0 border-r transition-colors duration-300"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Logo Banner */}
        <div className="flex items-center justify-between px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <span className="text-sm font-800 text-white tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                QueryQuest
              </span>
            </div>
          </div>
          <IconButton onClick={toggleColorMode} size="small" sx={{ color: 'var(--text-muted)' }}>
            {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </IconButton>
        </div>

        {/* Navigation Feed */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-700 uppercase tracking-widest text-slate-500">Academic Hub</p>
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end />
          <NavItem to="/ai-agent" icon={Bot} label="CampusBot AI" />
          <NavItem to="/tickets" icon={Ticket} label="Support Tickets" />
          {isStudent && <NavItem to="/tickets/new" icon={PlusCircle} label="New Ticket" />}
          
          <p className="px-3 mt-4 mb-2 text-[10px] font-700 uppercase tracking-widest text-slate-500">Information</p>
          <NavItem to="/faqs" icon={HelpCircle} label="Browse FAQs" />
          <NavItem to="/announcements" icon={Megaphone} label="Announcements" badgeContent={unreadCount} />
          {isStudent && <NavItem to="/feedback" icon={MessageSquare} label="Submit Feedback" />}

          {/* Admin Management Section */}
          {(isAdmin || isSupport) && (
            <>
              <p className="px-3 mt-5 mb-2 text-[10px] font-700 uppercase tracking-widest text-slate-500">Staff Control</p>
              {isAdmin && <NavItem to="/admin/analytics" icon={BarChart3} label="Analytics" />}
              {isAdmin && <NavItem to="/admin/users" icon={Users} label="Manage Students" />}
            </>
          )}
        </nav>

        {/* User Card Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <NavLink to="/profile" className="flex items-center gap-3 flex-1 min-w-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-700 text-white flex-shrink-0 shadow-md">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-700 text-slate-200 truncate group-hover:text-blue-400 transition-colors">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate font-500">
                  {user?.role === 'USER' ? 'Student' : user?.role?.replace('_', ' ')}
                </p>
              </div>
            </NavLink>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Container ─────────────────────── */}
      <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  )
}
