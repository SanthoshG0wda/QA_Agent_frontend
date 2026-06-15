import Sidebar from './Sidebar'
import NotificationBell from '../components/NotificationBell'
import NotificationToastProvider from '../components/NotificationToast'

export default function DashboardLayout({ children }) {
  return (
    <NotificationToastProvider>
      <div className="flex min-h-screen bg-surface">
        <Sidebar />
        <main className="flex-1 min-w-0 p-6 lg:p-10 lg:pt-10 pt-24">
          <div className="fixed top-4 right-4 z-50">
            <NotificationBell />
          </div>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </NotificationToastProvider>
  )
}
