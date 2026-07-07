import { useState } from 'react'
import { feedbackAPI } from '../api/services'
import toast from 'react-hot-toast'
import { 
  Box, Card, CardContent, Typography, TextField, Button, 
  Rating, Grid
} from '@mui/material'
import { Star, Send, Sparkles } from 'lucide-react'

export default function FeedbackPage() {
  const [aiRating, setAiRating] = useState(5)
  const [staffRating, setStaffRating] = useState(5)
  const [overallRating, setOverallRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const data = {
        aiRating,
        staffRating,
        overallRating,
        comment: comment.trim()
      }
      await feedbackAPI.submit(data)
      toast.success('Thank you! Your feedback has been submitted successfully.')
      setComment('')
      setAiRating(5)
      setStaffRating(5)
      setOverallRating(5)
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ p: 4, maxWidth: 650, mx: 'auto' }} className="animate-fade-in">
      <Card sx={{ mt: 2 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: 3, backgroundColor: 'primary.light', color: 'primary.contrastText', mb: 2 }}>
              <Sparkles size={28} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Submit Portal Feedback</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Help us improve. Rate the AI assistant performance, student support staff response time, and your overall academic portal experience.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* AI Rating */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Rate CampusBot AI Assistant
                  </Typography>
                  <Rating
                    name="ai-rating"
                    value={aiRating}
                    onChange={(event, newValue) => setAiRating(newValue)}
                    emptyIcon={<Star style={{ opacity: 0.4 }} size={24} />}
                    size="large"
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    Accuracy of automated academic/administrative help.
                  </Typography>
                </Box>
              </Grid>

              {/* Staff Rating */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Rate Support Staff Responses
                  </Typography>
                  <Rating
                    name="staff-rating"
                    value={staffRating}
                    onChange={(event, newValue) => setStaffRating(newValue)}
                    emptyIcon={<Star style={{ opacity: 0.4 }} size={24} />}
                    size="large"
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    Helpfulness of support staff on manual tickets.
                  </Typography>
                </Box>
              </Grid>

              {/* Overall Rating */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Rate Overall Experience
                  </Typography>
                  <Rating
                    name="overall-rating"
                    value={overallRating}
                    onChange={(event, newValue) => setOverallRating(newValue)}
                    emptyIcon={<Star style={{ opacity: 0.4 }} size={24} />}
                    size="large"
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    Speed, usability, and design of QueryQuest.
                  </Typography>
                </Box>
              </Grid>

              {/* Comment */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Detailed Comments"
                  placeholder="Share details about what worked well or what we can improve..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Grid>

              {/* Submit */}
              <Grid item xs={12}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={submitting}
                  startIcon={<Send size={18} />}
                  sx={{ py: 1.5 }}
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
