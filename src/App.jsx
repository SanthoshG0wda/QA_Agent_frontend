import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layout/DashboardLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/UploadPage'
import ResultsPage from './pages/ResultsPage'
import Calls from './pages/Calls'
import Evaluations from './pages/Evaluations'
import Analytics from './pages/Analytics'
import Users from './pages/Users'
import Profile from './pages/Profile'
import Agents from './pages/Agents'
import AddAgent from './pages/AddAgent'
import AgentDetails from './pages/AgentDetails'
import AgentUpload from './pages/AgentUpload'

function ProtectedLayout({ children, roles }) {
  return (
    <ProtectedRoute roles={roles}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  const location = useLocation()
  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/upload" element={<ProtectedLayout><UploadPage /></ProtectedLayout>} />
          <Route path="/results/:id" element={<ProtectedLayout><ResultsPage /></ProtectedLayout>} />
          <Route path="/calls" element={<ProtectedLayout><Calls /></ProtectedLayout>} />
          <Route path="/evaluations" element={<ProtectedLayout><Evaluations /></ProtectedLayout>} />
          <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
          <Route path="/agents" element={<ProtectedLayout><Agents /></ProtectedLayout>} />
          <Route path="/agents/new" element={<ProtectedLayout><AddAgent /></ProtectedLayout>} />
          <Route path="/agents/:id" element={<ProtectedLayout><AgentDetails /></ProtectedLayout>} />
          <Route path="/agents/:id/upload" element={<ProtectedLayout><AgentUpload /></ProtectedLayout>} />
          <Route path="/users" element={<ProtectedLayout roles={['admin']}><Users /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  )
}
