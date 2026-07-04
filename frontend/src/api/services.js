import api from './axios'

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyResetCode: (email, code) => api.post('/auth/verify-reset-code', { email, code }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
}

// ─── Tickets ───────────────────────────────────────────────────────────────────
export const ticketAPI = {
  create: (data) => api.post('/tickets', data),
  createWithFile: (formData) => api.post('/tickets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  list: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  updateStatus: (id, status) => api.patch(`/tickets/${id}/status`, { status }),
  assign: (id, assignedToId) => api.patch(`/tickets/${id}/assign`, { assignedToId }),
}

// ─── Messages ──────────────────────────────────────────────────────────────────
export const messageAPI = {
  send: (ticketId, message) => api.post(`/tickets/${ticketId}/messages`, { message }),
  list: (ticketId) => api.get(`/tickets/${ticketId}/messages`),
}

// ─── Departments ───────────────────────────────────────────────────────────────
export const departmentAPI = {
  list: () => api.get('/departments'),
  create: (departmentName) => api.post('/admin/departments', { departmentName }),
  delete: (id) => api.delete(`/admin/departments/${id}`),
}

// ─── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: () => api.get('/admin/users'),
  getSupportStaff: () => api.get('/admin/users/support-staff'),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, null, { params: { role } }),
  toggleUserActive: (id) => api.patch(`/admin/users/${id}/toggle-active`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
}

export const aiAPI = {
  ask: (data) => api.post('/ai/ask', data),
}
