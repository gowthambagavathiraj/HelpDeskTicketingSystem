import { useState, useEffect } from 'react'
import { announcementAPI } from '../api/services'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { 
  Box, Card, CardContent, Typography, TextField, Button, Grid, 
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Chip 
} from '@mui/material'
import { Megaphone, Calendar, Briefcase, Award, Plus, Info } from 'lucide-react'

const categoryIcons = {
  NOTICE: Info,
  EXAM: Calendar,
  PLACEMENT: Briefcase,
  EVENT: Award,
  HOLIDAY: Calendar,
  WORKSHOP: Briefcase,
}

const categoryColors = {
  NOTICE: 'info',
  EXAM: 'error',
  PLACEMENT: 'success',
  EVENT: 'warning',
  HOLIDAY: 'default',
  WORKSHOP: 'secondary',
}

export default function AnnouncementsPage() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [openDialog, setOpenDialog] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category: 'NOTICE' })
  const [submitting, setSubmitting] = useState(false)

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    loadAnnouncements()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  const loadAnnouncements = async () => {
    try {
      const catParam = selectedCategory === 'All' ? null : selectedCategory
      const response = await announcementAPI.list(catParam)
      setAnnouncements(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load announcements')
    }
  }

  const handleOpenCreate = () => {
    setForm({ title: '', content: '', category: 'NOTICE' })
    setOpenDialog(true)
  }

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and Content are required')
      return
    }

    setSubmitting(true)
    try {
      await announcementAPI.create(form)
      toast.success('Announcement published successfully!')
      setOpenDialog(false)
      loadAnnouncements()
    } catch (error) {
      toast.error('Failed to publish announcement')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ p: 4 }} className="animate-fade-in">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Megaphone size={32} className="text-blue-500 animate-pulse" />
            Announcements & Notices
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Keep track of active placement drives, exam timetables, workshops, and holiday schedules.
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={handleOpenCreate}
            sx={{ px: 3, py: 1 }}
          >
            New Notice
          </Button>
        )}
      </Box>

      {/* Category selector chips */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 4, overflowX: 'auto', pb: 1 }}>
        {['All', 'NOTICE', 'EXAM', 'PLACEMENT', 'EVENT', 'HOLIDAY', 'WORKSHOP'].map((cat) => (
          <Chip
            key={cat}
            label={cat}
            onClick={() => setSelectedCategory(cat)}
            color={selectedCategory === cat ? 'primary' : 'default'}
            variant={selectedCategory === cat ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
          />
        ))}
      </Box>

      {/* List */}
      <Grid container spacing={3}>
        {announcements.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Megaphone size={48} className="mx-auto text-slate-500 mb-3" />
                <Typography variant="h6" color="textSecondary">No Announcements published yet</Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          announcements.map((item) => {
            const Icon = categoryIcons[item.category] || Info
            return (
              <Grid item xs={12} key={item.id}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: 'primary.light', color: 'primary.contrastText', display: 'flex', alignItems: 'center' }}>
                          <Icon size={18} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{item.title}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          size="small"
                          label={item.category}
                          color={categoryColors[item.category] || 'default'}
                          sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ pl: 5, whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {item.content}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, pt: 1.5, borderTop: '1px solid var(--border)' }}>
                      <Typography variant="caption" color="textSecondary">
                        Published by: <b>{item.createdBy}</b>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })
        )}
      </Grid>

      {/* Create Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Publish New Announcement</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              fullWidth
              label="Notice Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={5}
              label="Content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <TextField
              fullWidth
              select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <MenuItem value="NOTICE">College Notice</MenuItem>
              <MenuItem value="EXAM">Exam Update</MenuItem>
              <MenuItem value="PLACEMENT">Placement Drive</MenuItem>
              <MenuItem value="EVENT">Event Alert</MenuItem>
              <MenuItem value="HOLIDAY">Holiday Notice</MenuItem>
              <MenuItem value="WORKSHOP">Workshop Details</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleCreate} variant="contained" color="primary" disabled={submitting}>
            {submitting ? 'Publishing...' : 'Publish'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
