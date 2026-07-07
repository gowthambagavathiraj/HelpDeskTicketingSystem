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

// ─── Admin User Management ─────────────────────────────────────────────────────
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: () => api.get('/admin/users'),
  getSupportStaff: () => api.get('/admin/users/support-staff'),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, null, { params: { role } }),
  toggleUserActive: (id) => api.patch(`/admin/users/${id}/toggle-active`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
}

// ─── FAQs ──────────────────────────────────────────────────────────────────────
export const faqAPI = {
  list: (params) => api.get('/faqs', { params }),
  getCategories: () => api.get('/faqs/categories'),
  create: (data) => api.post('/faqs', data),
  update: (id, data) => api.put(`/faqs/${id}`, data),
  delete: (id) => api.delete(`/faqs/${id}`),
}

// ─── Announcements ─────────────────────────────────────────────────────────────
export const announcementAPI = {
  list: (category) => api.get('/announcements', { params: { category } }),
  create: (data) => api.post('/announcements', data),
}

// ─── Feedback ──────────────────────────────────────────────────────────────────
export const feedbackAPI = {
  submit: (data) => api.post('/feedbacks', data),
  list: () => api.get('/feedbacks'),
  getRatings: () => api.get('/feedbacks/ratings'),
}

// ─── Notifications ─────────────────────────────────────────────────────────────
export const notificationAPI = {
  list: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
}

// ─── Profile ───────────────────────────────────────────────────────────────────
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
}

// ─── AI Assistant ──────────────────────────────────────────────────────────────
export const aiAPI = {
  ask: (data, sessionId) => api.post('/ai/ask', data, {
    headers: sessionId ? { 'X-Session-ID': sessionId } : {}
  }),
  getSuggestions: (context) => api.get('/ai/suggestions', { params: { context } }),
  clearHistory: (sessionId) => api.delete(`/ai/history/${sessionId}`),
  getHistory: () => api.get('/ai/history'),
  getLogs: () => api.get('/ai/logs'),
  healthCheck: () => api.get('/ai/health'),
}
