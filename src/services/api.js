import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export async function login(email, password) {
  const { data } = await API.post('/api/auth/login', { email, password })
  return data
}

export async function register(name, email, password, role = 'agent') {
  const { data } = await API.post('/api/auth/register', { name, email, password, role })
  return data
}

export async function getMe() {
  const { data } = await API.get('/api/auth/me')
  return data
}

export async function uploadAudio(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await API.post('/api/upload', form)
  return data
}

export async function evaluateCall(callId) {
  const { data } = await API.post(`/api/evaluate/${callId}`)
  return data
}

export async function getEvaluation(evaluationId) {
  const { data } = await API.get(`/api/evaluation/${evaluationId}`)
  return data
}

export async function listEvaluations() {
  const { data } = await API.get('/api/evaluations')
  return data
}

export async function getCalls() {
  const { data } = await API.get('/api/calls')
  return data
}

export async function getCall(callId) {
  const { data } = await API.get(`/api/calls/${callId}`)
  return data
}

export async function getCallEvaluation(callId) {
  const { data } = await API.get(`/api/calls/${callId}/evaluation`)
  return data
}

export async function deleteCall(callId) {
  const { data } = await API.delete(`/api/calls/${callId}`)
  return data
}

export async function getAnalyticsSummary() {
  const { data } = await API.get('/api/analytics/summary')
  return data
}

export async function getAnalyticsTrends() {
  const { data } = await API.get('/api/analytics/trends')
  return data
}

export async function getAnalyticsCategories() {
  const { data } = await API.get('/api/analytics/categories')
  return data
}

export async function listUsers() {
  const { data } = await API.get('/api/users/')
  return data
}

export async function createUser(name, email, password, role) {
  const { data } = await API.post('/api/users/', { name, email, password, role })
  return data
}

export async function deleteUser(userId) {
  const { data } = await API.delete(`/api/users/${userId}`)
  return data
}

export async function listAgents() {
  const { data } = await API.get('/api/agents')
  return data
}

export async function getAgent(agentId) {
  const { data } = await API.get(`/api/agents/${agentId}`)
  return data
}

export async function createAgent(name, email, department) {
  const { data } = await API.post('/api/agents', { name, email, department })
  return data
}

export async function deleteAgent(agentId) {
  const { data } = await API.delete(`/api/agents/${agentId}`)
  return data
}

export async function uploadAgentAudio(agentId, file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await API.post(`/api/agents/${agentId}/upload`, form)
  return data
}

export async function getAgentEvaluations(agentId) {
  const { data } = await API.get(`/api/agents/${agentId}/evaluations`)
  return data
}
