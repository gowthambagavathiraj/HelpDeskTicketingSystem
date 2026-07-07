import { useState, useEffect } from 'react'
import { adminAPI, aiAPI } from '../../api/services'
import { 
  Box, Grid, Card, CardContent, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip 
} from '@mui/material'
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler 
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'
import { 
  Users, Bot, Ticket, CheckCircle2, AlertCircle, 
  HelpCircle, BarChart3, TrendingUp 
} from 'lucide-react'

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      const [analyticsRes, logsRes] = await Promise.all([
        adminAPI.getAnalytics(),
        aiAPI.getLogs()
      ])
      setData(analyticsRes.data.data)
      setLogs(logsRes.data.data?.slice(0, 5) || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Typography variant="body1">Loading system analytics...</Typography>
      </Box>
    )
  }

  if (!data) return null

  // 1. Daily Queries Chart Data (Bar Chart)
  const dailyLabels = (data.dailyQueries || []).map(d => new Date(d.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})).reverse()
  const dailyValues = (data.dailyQueries || []).map(d => d.count).reverse()
  const barChartData = {
    labels: dailyLabels.length > 0 ? dailyLabels : ['No Data'],
    datasets: [{
      label: 'AI Student Queries',
      data: dailyValues.length > 0 ? dailyValues : [0],
      backgroundColor: 'rgba(59, 130, 246, 0.65)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      borderRadius: 6
    }]
  }

  // 2. Peak Hours Chart Data (Line Chart)
  const hourlyCounts = Array(24).fill(0)
  if (data.peakUsageHours) {
    data.peakUsageHours.forEach(h => {
      if (h.hour >= 0 && h.hour < 24) {
        hourlyCounts[h.hour] = h.count
      }
    })
  }
  const lineChartData = {
    labels: Array.from({length: 24}, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Queries count',
      data: hourlyCounts,
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4,
      pointBackgroundColor: '#8b5cf6',
      fill: true
    }]
  }

  // 3. Sentiment Analysis (Pie Chart)
  const sentimentLabels = (data.sentimentDistribution || []).map(s => s.sentiment || 'NEUTRAL')
  const sentimentValues = (data.sentimentDistribution || []).map(s => s.count)
  const pieChartData = {
    labels: sentimentLabels.length > 0 ? sentimentLabels : ['NEUTRAL'],
    datasets: [{
      data: sentimentValues.length > 0 ? sentimentValues : [1],
      backgroundColor: [
        'rgba(16, 185, 129, 0.7)', // POSITIVE -> green
        'rgba(59, 130, 246, 0.7)',  // NEUTRAL -> blue
        'rgba(245, 158, 11, 0.7)',  // FRUSTRATED -> orange
        'rgba(239, 68, 68, 0.7)',   // URGENT -> red
      ],
      borderColor: 'var(--surface-2)',
      borderWidth: 2
    }]
  }

  // 4. Department Ticket Volumes (Area Chart)
  const deptLabels = Object.keys(data.ticketsByDepartment || {})
  const deptValues = Object.values(data.ticketsByDepartment || {})
  const areaChartData = {
    labels: deptLabels.length > 0 ? deptLabels : ['None'],
    datasets: [{
      label: 'Ticket volume',
      data: deptValues.length > 0 ? deptValues : [0],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      fill: true, // Area Chart
      tension: 0.3,
      pointRadius: 4
    }]
  }

  return (
    <Box sx={{ p: 4 }} className="animate-fade-in">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
          <BarChart3 size={32} className="text-blue-500" />
          Analytics Dashboard
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
          Real-time metrics, AI accuracy performance logs, and ticket tracking analytics.
        </Typography>
      </Box>

      {/* Grid of Key Performance Indicators (KPIs) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>STUDENTS</Typography>
                <Users size={16} className="text-blue-500" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{data.totalStudents}</Typography>
              <Typography variant="caption" color="textSecondary">Active registered</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>AI QUERIES</Typography>
                <Bot size={16} className="text-purple-500" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{data.totalAIQueries}</Typography>
              <Typography variant="caption" color="textSecondary">Total automated chats</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>MANUAL TICKETS</Typography>
                <Ticket size={16} className="text-emerald-500" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{data.manualQueries}</Typography>
              <Typography variant="caption" color="textSecondary">Total support tickets</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>RESOLVED TICKETS</Typography>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{data.resolvedTickets}</Typography>
              <Typography variant="caption" color="textSecondary">Tickets closed/resolved</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>PENDING</Typography>
                <AlertCircle size={16} className="text-amber-500" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{data.pendingTickets}</Typography>
              <Typography variant="caption" color="textSecondary">Open & in progress</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card>
            <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>AI RESOLUTION %</Typography>
                <TrendingUp size={16} className="text-purple-500" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{data.aiResolutionPercentage}%</Typography>
              <Typography variant="caption" color="textSecondary">No manual escalation</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Charts Grid */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Daily Queries - Bar */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Daily AI Conversations Volume</Typography>
              <Box sx={{ height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bar 
                  data={barChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Peak Hours - Line */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Peak Usage Hours (Daily Average)</Typography>
              <Box sx={{ height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Line 
                  data={lineChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sentiment Analysis - Pie */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Student Sentiment Analysis</Typography>
              <Box sx={{ height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pie 
                  data={pieChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false 
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Departments Ticket Volumes - Area */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Manual Tickets by Category (Area representation)</Typography>
              <Box sx={{ height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Line 
                  data={areaChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tables Section */}
      <Grid container spacing={4}>
        {/* Most Asked Questions */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <HelpCircle size={20} className="text-blue-500" />
            Most Asked Questions
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: 'action.hover' }}>
                <TableRow>
                  <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Query Question</Typography></TableCell>
                  <TableCell align="right"><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Hits</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.mostAskedQuestions && data.mostAskedQuestions.length > 0 ? (
                  data.mostAskedQuestions.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontSize: '0.85rem' }}>{row.question}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{row.count}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">No logs recorded yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* AI Performance Logs */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Bot size={20} className="text-purple-500" />
            AI Confidence & Diagnostic Logs
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: 'action.hover' }}>
                <TableRow>
                  <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Student Query</Typography></TableCell>
                  <TableCell align="center"><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Confidence</Typography></TableCell>
                  <TableCell align="center"><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Intent / Sentiment</Typography></TableCell>
                  <TableCell align="center"><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Action</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length > 0 ? (
                  logs.map((logItem) => (
                    <TableRow key={logItem.id}>
                      <TableCell sx={{ fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {logItem.question}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          size="small"
                          label={`${Math.round(logItem.confidenceScore * 100)}%`} 
                          color={logItem.confidenceScore >= 0.8 ? 'success' : logItem.confidenceScore >= 0.6 ? 'warning' : 'error'}
                          sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                          <Chip size="small" label={logItem.intent} sx={{ fontSize: '0.6rem', height: 18 }} />
                          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>{logItem.sentiment}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {logItem.ticketCreated ? (
                          <Chip size="small" label="TICKET OPENED" color="error" variant="outlined" sx={{ fontSize: '0.6rem', fontWeight: 600 }} />
                        ) : (
                          <Chip size="small" label="AUTO RESOLVED" color="success" sx={{ fontSize: '0.6rem', fontWeight: 600 }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No AI logs available.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  )
}
