import Sidebar from './Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 min-w-0 p-6 lg:p-10 lg:pt-10 pt-24">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
