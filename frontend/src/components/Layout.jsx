import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Upload,
  LogOut,
  Settings,
  Shield,
  Search,
  Bell,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload', icon: Upload, label: 'Documents' },
]

const pageTitles = {
  '/': 'Dashboard',
  '/upload': 'Documents',
  '/admin': 'Admin',
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : '??'

  const currentTitle = pageTitles[location.pathname] || 'IFRS Suite'

  return (
    <div className="flex h-screen bg-surface-50">
      {/* Sidebar */}
      <aside className="w-[220px] bg-surface-900 flex flex-col border-r border-surface-800">
        {/* Brand */}
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-surface-800">
          <div className="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">IFRS Suite</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          <p className="px-2 pb-2 text-[10px] font-medium text-surface-500 uppercase tracking-widest">
            Menu
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors duration-150 ${
                  isActive
                    ? 'bg-primary-600/15 text-primary-300 font-medium'
                    : 'text-surface-400 hover:bg-white/5 hover:text-surface-200'
                }`
              }
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <p className="px-2 pb-2 pt-4 text-[10px] font-medium text-surface-500 uppercase tracking-widest">
                Admin
              </p>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors duration-150 ${
                    isActive
                      ? 'bg-primary-600/15 text-primary-300 font-medium'
                      : 'text-surface-400 hover:bg-white/5 hover:text-surface-200'
                  }`
                }
              >
                <Settings size={16} strokeWidth={1.75} />
                <span>Settings</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* User section */}
        <div className="px-3 pb-3 mt-auto">
          <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-md bg-white/5">
            <div className="w-7 h-7 bg-surface-700 rounded-md flex items-center justify-center">
              <span className="text-[10px] font-semibold text-surface-300">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-surface-300 truncate">{user?.email}</p>
              <p className="text-[10px] text-surface-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-surface-500 hover:text-red-400 rounded-md transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-sm font-semibold text-surface-900">{currentTitle}</h2>
          <div className="flex items-center gap-3">
            <button className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-50 rounded-md transition-colors">
              <Search size={16} />
            </button>
            <button className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-50 rounded-md transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
            </button>
            <div className="w-px h-6 bg-surface-200 mx-1"></div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary-50 rounded-md flex items-center justify-center">
                <span className="text-[10px] font-semibold text-primary-600">{initials}</span>
              </div>
              <span className="text-[13px] text-surface-600 hidden sm:block">{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
