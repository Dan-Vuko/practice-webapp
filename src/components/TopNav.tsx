import { useState } from 'react'
import { Palette, ChevronDown } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useTheme } from '../lib/ThemeContext'

interface TopNavProps {
  currentApp: 'speedbuilder' | 'fretmaster'
  onSwitchApp: (app: 'speedbuilder' | 'fretmaster') => void
}

export function TopNav({ currentApp, onSwitchApp }: TopNavProps) {
  const { user, signOut } = useAuth()
  const { theme, themeId, setThemeId, availableThemes } = useTheme()
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  return (
    <nav className="bg-theme-surface border-b border-border sticky top-0 z-50">
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-12">
          {/* App Tabs */}
          <div className="flex gap-1">
            <button
              onClick={() => onSwitchApp('speedbuilder')}
              className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
                currentApp === 'speedbuilder'
                  ? 'bg-accent text-content-primary'
                  : 'text-content-secondary hover:text-content-primary hover:bg-theme-hover'
              }`}
            >
              Speed Builder
            </button>
            <button
              onClick={() => onSwitchApp('fretmaster')}
              className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
                currentApp === 'fretmaster'
                  ? 'bg-accent2 text-content-primary'
                  : 'text-content-secondary hover:text-content-primary hover:bg-theme-hover'
              }`}
            >
              FretMaster
            </button>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Theme Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-content-secondary hover:text-content-primary hover:bg-theme-hover transition-all"
                title="Change theme"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">{theme.name}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showThemeMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Theme dropdown */}
              {showThemeMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowThemeMenu(false)}
                  />
                  <div
                    className="absolute right-0 mt-2 w-60 rounded-lg shadow-2xl z-50 overflow-hidden border border-border"
                    style={{ backgroundColor: theme.colors.bg.elevated }}
                  >
                    <div className="px-3 py-2 border-b border-border">
                      <span className="text-xs text-content-tertiary uppercase tracking-wider font-semibold">Color Scheme</span>
                    </div>
                    <div className="p-1.5">
                      {availableThemes.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setThemeId(t.id)
                            setShowThemeMenu(false)
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                            themeId === t.id
                              ? 'ring-2 ring-accent'
                              : 'hover:bg-theme-hover'
                          }`}
                          style={themeId === t.id ? { backgroundColor: t.colors.primary.darkest + '40' } : {}}
                        >
                          {/* Color preview dots */}
                          <div className="flex gap-1">
                            <div
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: t.colors.primary.default }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: t.colors.secondary.default }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-content-primary">{t.name}</div>
                            <div className="text-xs text-content-tertiary truncate">{t.description}</div>
                          </div>
                          {themeId === t.id && (
                            <span className="text-accent font-bold">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Info */}
            <span className="text-sm text-content-secondary hidden sm:block">{user?.username}</span>
            <button
              onClick={signOut}
              className="text-sm text-content-tertiary hover:text-content-primary transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
