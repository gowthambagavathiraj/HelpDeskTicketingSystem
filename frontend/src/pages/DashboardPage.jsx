import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ticketAPI, announcementAPI, notificationAPI } from '../api/services'
import { 
  Box, Grid, Card, CardContent, Typography, Button, 
  List, ListItem, ListItemText, ListItemIcon, Badge, Chip
} from '@mui/material'
import { 
  Bot, Ticket, PlusCircle, HelpCircle, Megaphone, Bell, 
  CheckCircle2, Clock, Info, ArrowRight, MessageSquare
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [notifications, setNotifications] = useState([])
  const [unreadNotifCount, setUnreadNotifCount] = useState(0)

  const isStudent = user?.role === 'USER' // USER role maps to Student

  useEffect(() => {
    loadDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load recent tickets
      const tRes = await ticketAPI.list({ page: 0, size: 5, sortBy: 'createdAt', sortDir: 'desc' })
      setTickets(tRes.data.data?.content || [])

      // Load announcements
      const aRes = await announcementAPI.list(null)
      setAnnouncements(aRes.data.data?.slice(0, 3) || [])

      // Load notifications
      if (user) {
        const nRes = await notificationAPI.list()
        setNotifications(nRes.data.data?.slice(0, 5) || [])
        const countRes = await notificationAPI.getUnreadCount()
        setUnreadNotifCount(countRes.data.data || 0)
      }
    } catch (error) {
      console.error('Failed to load dashboard data', error)
    }
  }

  const handleMarkNotificationRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id)
      loadDashboardData()
    } catch (e) {
      console.error(e)
    }
  }

  const activeTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED')
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED')

  return (
    <Box sx={{ p: 4 }} className="animate-fade-in">
      {/* Welcome Banner */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Manage your academic queries and administrative tasks from your campus portal dashboard.
          </Typography>
        </Box>
        <Box>
          <Chip 
            icon={<Megaphone size={14} />} 
            label={isStudent ? "Student Portal" : "Admin Dashboard"} 
            color="primary" 
            sx={{ fontWeight: 600 }} 
          />
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Quick Stats Banner */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bg: 'primary.light', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <Ticket size={24} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{tickets.length}</Typography>
                    <Typography variant="caption" color="textSecondary">Total Tickets</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <Clock size={24} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{activeTickets.length}</Typography>
                    <Typography variant="caption" color="textSecondary">Active Tickets</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <CheckCircle2 size={24} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{resolvedTickets.length}</Typography>
                    <Typography variant="caption" color="textSecondary">Resolved Tickets</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                    <Badge badgeContent={unreadNotifCount} color="error">
                      <Bell size={24} />
                    </Badge>
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{unreadNotifCount}</Typography>
                    <Typography variant="caption" color="textSecondary">Unread Alerts</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Quick Actions Panel */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Quick Actions</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}
                onClick={() => navigate('/ai-agent')}
              >
                <CardContent sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                    <Bot size={32} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Ask CampusBot AI</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
                      Get instant, AI-powered answers about registrations, schedules, and fee guidelines.
                    </Typography>
                    <Button size="small" endIcon={<ArrowRight size={14} />}>Ask AI</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}
                onClick={() => navigate('/tickets/new')}
              >
                <CardContent sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <PlusCircle size={32} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>New Support Ticket</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
                      Open a support ticket for manual help from specific departments.
                    </Typography>
                    <Button size="small" endIcon={<ArrowRight size={14} />}>Open Ticket</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}
                onClick={() => navigate('/faqs')}
              >
                <CardContent sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <HelpCircle size={32} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Browse FAQs</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
                      Search and navigate the knowledge base of campus procedures.
                    </Typography>
                    <Button size="small" endIcon={<ArrowRight size={14} />}>View FAQs</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}
                onClick={() => navigate('/announcements')}
              >
                <CardContent sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                    <Megaphone size={32} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>College Noticeboard</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
                      Read announcements about placement cells, exams, and workshops.
                    </Typography>
                    <Button size="small" endIcon={<ArrowRight size={14} />}>View Notices</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Alerts & Notifications Feed */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Recent Notifications</Typography>
          <Card sx={{ maxHeight: 375, overflowY: 'auto' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              {notifications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Bell size={28} className="mx-auto text-slate-500 mb-1.5" />
                  <Typography variant="body2" color="textSecondary">All caught up!</Typography>
                </Box>
              ) : (
                <List dense sx={{ p: 0 }}>
                  {notifications.map((notif) => (
                    <ListItem 
                      key={notif.id} 
                      sx={{ 
                        mb: 1, 
                        borderRadius: 1.5, 
                        backgroundColor: notif.isRead ? 'transparent' : 'action.hover',
                        cursor: 'pointer' 
                      }}
                      onClick={() => !notif.isRead && handleMarkNotificationRead(notif.id)}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Info size={16} className={notif.isRead ? "text-slate-500" : "text-blue-500"} />
                      </ListItemIcon>
                      <ListItemText
                        primary={notif.title}
                        secondary={
                          <>
                            <Typography variant="caption" component="span" display="block" color="textSecondary">
                              {notif.message}
                            </Typography>
                            <Typography variant="caption" component="span" sx={{ fontSize: '0.65rem' }}>
                              {new Date(notif.createdAt).toLocaleTimeString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Tickets List */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Active Support Tickets</Typography>
          <Card>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              {tickets.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Ticket size={40} className="mx-auto text-slate-500 mb-2" />
                  <Typography variant="body2" color="textSecondary">No tickets created.</Typography>
                  <Button variant="outlined" size="small" onClick={() => navigate('/tickets/new')} sx={{ mt: 2 }}>
                    Create Ticket
                  </Button>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {tickets.slice(0, 4).map((ticket) => (
                    <ListItem 
                      key={ticket.id} 
                      sx={{ 
                        borderBottom: '1px solid var(--border)',
                        '&:last-child': { borderBottom: 'none' },
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <MessageSquare size={18} className="text-slate-400" />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            #{ticket.id} {ticket.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {ticket.department?.departmentName} • {new Date(ticket.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip size="small" label={ticket.priority} variant="outlined" color={ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? 'error' : 'default'} />
                        <Chip size="small" label={ticket.status} color="primary" variant="filled" />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Notices Board */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Latest Notices</Typography>
          <Card sx={{ height: 'calc(100% - 32px)' }}>
            <CardContent sx={{ p: 2 }}>
              {announcements.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Megaphone size={28} className="mx-auto text-slate-500 mb-2" />
                  <Typography variant="body2" color="textSecondary">No announcements.</Typography>
                </Box>
              ) : (
                announcements.map((item) => (
                  <Box 
                    key={item.id} 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      borderRadius: 1.5, 
                      backgroundColor: 'action.hover', 
                      borderLeft: '4px solid #3b82f6' 
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} className="truncate">
                        {item.title}
                      </Typography>
                      <Chip label={item.category} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
                    </Box>
                    <Typography variant="caption" color="textSecondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.content}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                        By: {item.createdBy}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
