import { useAuth } from '../lib/AuthContext'

interface TopNavProps {
  currentApp: 'speedbuilder' | 'fretmaster'
  onSwitchApp: (app: 'speedbuilder' | 'fretmaster') => void
}

export function TopNav({ currentApp, onSwitchApp }: TopNavProps) {
  const { user, signOut } = useAuth()

  return (
    <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* App Tabs */}
          <div className="flex gap-1">
            <button
              onClick={() => onSwitchApp('speedbuilder')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentApp === 'speedbuilder'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Speed Builder
            </button>
            <button
              onClick={() => onSwitchApp('fretmaster')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentApp === 'fretmaster'
                  ? 'bg-green-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              FretMaster
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:block">{user?.username}</span>
            <button
              onClick={signOut}
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
