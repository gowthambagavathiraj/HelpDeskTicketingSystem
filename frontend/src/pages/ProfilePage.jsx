import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { profileAPI, departmentAPI } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { useColorMode } from '../context/ThemeContext'
import { 
  Box, Card, CardContent, Typography, TextField, MenuItem, 
  Button, Grid, Divider, FormControlLabel, Switch 
} from '@mui/material'
import { User, Phone, Key, Shield, Moon, Sun, Building } from 'lucide-react'

export default function ProfilePage() {
  const { user, login } = useAuth()
  const { mode, toggleColorMode } = useColorMode()
  const [departments, setDepartments] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      phoneNumber: '',
      countryCode: '+91',
      departmentId: '',
      password: '',
      confirmPassword: ''
    }
  })

  useEffect(() => {
    loadDepartments()
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDepartments = async () => {
    try {
      const response = await departmentAPI.list()
      setDepartments(response.data.data || [])
    } catch (error) {
      toast.error('Failed to load departments')
    }
  }

  const loadProfile = async () => {
    try {
      const response = await profileAPI.get()
      const data = response.data.data
      if (data) {
        setValue('name', data.name || '')
        setValue('phoneNumber', data.phoneNumber || '')
        setValue('countryCode', data.countryCode || '+91')
        setValue('departmentId', data.department?.id || '')
      }
    } catch (error) {
      toast.error('Failed to load profile details')
    }
  }

  const onSubmit = async (formData) => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      const updateData = {
        name: formData.name,
        phoneNumber: formData.phoneNumber || null,
        countryCode: formData.countryCode,
        departmentId: formData.departmentId ? Number(formData.departmentId) : null
      }
      
      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await profileAPI.update(updateData)
      const updatedUser = response.data.data
      
      // Update local storage user details
      const token = localStorage.getItem('helpdesk_token')
      login(updatedUser, token)

      // Clear password fields
      setValue('password', '')
      setValue('confirmPassword', '')
      
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }} className="animate-fade-in">
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
        <User size={32} className="text-blue-500" />
        Profile & Settings
      </Typography>

      <Grid container spacing={4}>
        {/* Profile Edit Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Personal Details</Typography>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      placeholder="Enter your full name"
                      InputProps={{
                        startAdornment: <User size={18} style={{ marginRight: 8, color: 'var(--text-faint)' }} />
                      }}
                      {...register('name', { required: 'Name is required' })}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={user?.email || ''}
                      disabled
                      helperText="Email address cannot be changed."
                      InputProps={{
                        startAdornment: <Shield size={18} style={{ marginRight: 8, color: 'var(--text-faint)' }} />
                      }}
                    />
                  </Grid>

                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      select
                      label="Country Code"
                      {...register('countryCode')}
                    >
                      <MenuItem value="+91">+91 (IN)</MenuItem>
                      <MenuItem value="+1">+1 (US)</MenuItem>
                      <MenuItem value="+44">+44 (UK)</MenuItem>
                      <MenuItem value="+61">+61 (AU)</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      placeholder="Enter phone number"
                      InputProps={{
                        startAdornment: <Phone size={18} style={{ marginRight: 8, color: 'var(--text-faint)' }} />
                      }}
                      {...register('phoneNumber')}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Department"
                      InputProps={{
                        startAdornment: <Building size={18} style={{ marginRight: 8, color: 'var(--text-faint)' }} />
                      }}
                      {...register('departmentId')}
                    >
                      <MenuItem value="">Select Department</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.departmentName}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Change Password</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="password"
                      label="New Password"
                      placeholder="At least 6 characters"
                      InputProps={{
                        startAdornment: <Key size={18} style={{ marginRight: 8, color: 'var(--text-faint)' }} />
                      }}
                      {...register('password', {
                        minLength: formData => !formData || formData.length >= 6 || 'Password must be at least 6 characters'
                      })}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirm Password"
                      placeholder="Repeat new password"
                      InputProps={{
                        startAdornment: <Key size={18} style={{ marginRight: 8, color: 'var(--text-faint)' }} />
                      }}
                      {...register('confirmPassword')}
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={submitting}
                      sx={{ py: 1.5, px: 4 }}
                    >
                      {submitting ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar Preferences */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Preferences</Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {mode === 'dark' ? <Moon size={20} className="text-purple-500" /> : <Sun size={20} className="text-yellow-500" />}
                  <Typography variant="body1">Dark Theme Mode</Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === 'dark'}
                      onChange={toggleColorMode}
                      color="secondary"
                    />
                  }
                  label=""
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>Account Status</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1.5, bg: 'success.main', color: 'white', backgroundColor: 'success.main' }}>
                ACTIVE STUDENT
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
