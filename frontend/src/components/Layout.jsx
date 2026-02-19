import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Upload,
  LogOut,
  Settings,
  Shield,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', description: 'Overview & analytics' },
  { to: '/upload', icon: Upload, label: 'Documents', description: 'Upload & manage' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : '??'

  return (
    <div className="flex h-screen bg-surface-50">
      {/* Sidebar */}
      <aside className="w-72 bg-surface-900 flex flex-col animate-slide-in">
        {/* Brand */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">IFRS Suite</h1>
              <p className="text-[11px] text-surface-400 font-medium">AI Sustainability Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          <p className="px-3 pb-2 pt-3 text-[10px] font-semibold text-surface-500 uppercase tracking-widest">
            Main Menu
          </p>
          {navItems.map(({ to, icon: Icon, label, description }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-300'
                    : 'text-surface-400 hover:bg-white/5 hover:text-surface-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive ? 'bg-primary-500/20' : 'bg-white/5 group-hover:bg-white/10'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{label}</p>
                    <p className={`text-[11px] ${isActive ? 'text-primary-400/70' : 'text-surface-500'}`}>
                      {description}
                    </p>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-primary-400" />}
                </>
              )}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <p className="px-3 pb-2 pt-5 text-[10px] font-semibold text-surface-500 uppercase tracking-widest">
                Administration
              </p>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600/20 text-primary-300'
                      : 'text-surface-400 hover:bg-white/5 hover:text-surface-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isActive ? 'bg-primary-500/20' : 'bg-white/5 group-hover:bg-white/10'
                      }`}
                    >
                      <Settings size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">Admin</p>
                      <p className={`text-[11px] ${isActive ? 'text-primary-400/70' : 'text-surface-500'}`}>
                        Users & companies
                      </p>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-primary-400" />}
                  </>
                )}
              </NavLink>
            </>
          )}
        </nav>

        {/* User section */}
        <div className="p-3 mt-auto">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-primary-300">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-200 truncate">{user?.email}</p>
                <p className="text-[11px] text-surface-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-surface-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
