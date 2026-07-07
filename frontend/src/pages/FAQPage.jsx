import { useState, useEffect } from 'react'
import { faqAPI } from '../api/services'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { 
  Box, Card, CardContent, Typography, TextField, Button, Grid, 
  Accordion, AccordionSummary, AccordionDetails, Tabs, Tab, 
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, MenuItem
} from '@mui/material'
import { 
  Plus, Edit2, Trash2, Search, HelpCircle, ChevronDown, BookOpen 
} from 'lucide-react'

export default function FAQPage() {
  const { user } = useAuth()
  const [faqs, setFaqs] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentId, setCurrentId] = useState(null)
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'Academic queries' })

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    loadCategories()
    loadFaqs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery])

  const loadCategories = async () => {
    try {
      const response = await faqAPI.getCategories()
      setCategories(['All', ...(response.data.data || [])])
    } catch (error) {
      console.error(error)
    }
  }

  const loadFaqs = async () => {
    try {
      const params = {}
      if (selectedCategory !== 'All') {
        params.category = selectedCategory
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      const response = await faqAPI.list(params)
      setFaqs(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load FAQs')
    }
  }

  const handleOpenCreate = () => {
    setIsEdit(false)
    setFaqForm({ question: '', answer: '', category: 'Academic queries' })
    setOpenDialog(true)
  }

  const handleOpenEdit = (faq) => {
    setIsEdit(true)
    setCurrentId(faq.id)
    setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category })
    setOpenDialog(true)
  }

  const handleSave = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      toast.error('Question and Answer are required')
      return
    }

    try {
      if (isEdit) {
        await faqAPI.update(currentId, faqForm)
        toast.success('FAQ updated successfully')
      } else {
        await faqAPI.create(faqForm)
        toast.success('FAQ created successfully')
      }
      setOpenDialog(false)
      loadFaqs()
      loadCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save FAQ')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await faqAPI.delete(id)
        toast.success('FAQ deleted successfully')
        loadFaqs()
        loadCategories()
      } catch (error) {
        toast.error('Failed to delete FAQ')
      }
    }
  }

  return (
    <Box sx={{ p: 4 }} className="animate-fade-in">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
            <HelpCircle size={32} className="text-blue-500" />
            Frequently Asked Questions
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Browse through common questions or query search tags below.
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
            Add FAQ
          </Button>
        )}
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by question keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={18} style={{ marginRight: 8, color: 'var(--text-faint)' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Tabs
                value={selectedCategory}
                onChange={(e, val) => setSelectedCategory(val)}
                variant="scrollable"
                scrollButtons="auto"
                textColor="primary"
                indicatorColor="primary"
              >
                {categories.map((cat) => (
                  <Tab key={cat} label={cat} value={cat} />
                ))}
              </Tabs>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Accordions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {faqs.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <BookOpen size={48} className="mx-auto text-slate-500 mb-3" />
              <Typography variant="h6" color="textSecondary">No FAQs found</Typography>
              <Typography variant="body2" color="textSecondary">Try search terms or check back later.</Typography>
            </CardContent>
          </Card>
        ) : (
          faqs.map((faq) => (
            <Accordion key={faq.id} sx={{ backgroundColor: 'var(--surface)' }}>
              <AccordionSummary
                expandIcon={<ChevronDown size={18} className="text-slate-400" />}
                sx={{ borderBottom: '1px solid var(--border)' }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{faq.question}</Typography>
                  <Typography variant="caption" sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1.5, backgroundColor: 'var(--surface-3)', color: 'var(--text-muted)', ml: 2 }}>
                    {faq.category}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 2, pb: 3 }}>
                <Typography variant="body2" color="textSecondary" className="whitespace-pre-line leading-relaxed">
                  {faq.answer}
                </Typography>
                {isAdmin && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2, borderTop: '1px solid var(--border)', pt: 1.5 }}>
                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(faq)}>
                      <Edit2 size={16} />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(faq.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>

      {/* Dialog for Create/Edit */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isEdit ? 'Edit FAQ' : 'Add FAQ'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              fullWidth
              label="Question"
              value={faqForm.question}
              onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Answer"
              value={faqForm.answer}
              onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
            />
            <TextField
              fullWidth
              select
              label="Category"
              value={faqForm.category}
              onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
            >
              <MenuItem value="Academic queries">Academic queries</MenuItem>
              <MenuItem value="Administrative queries">Administrative queries</MenuItem>
              <MenuItem value="Registration">Registration</MenuItem>
              <MenuItem value="Finance">Finance</MenuItem>
              <MenuItem value="Hostel">Hostel</MenuItem>
              <MenuItem value="Library">Library</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
