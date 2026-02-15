import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './lib/AuthContext'
import { ThemeProvider } from './lib/ThemeContext'
import { LoginPage } from './components/LoginPage'
import { TopNav } from './components/TopNav'
import { FretMaster } from './components/FretMaster'
import { useAuth } from './lib/AuthContext'
import './index.css'

function Root() {
  const { user, loading } = useAuth()
  const getInitialApp = (): 'speedbuilder' | 'fretmaster' => {
    const hash = window.location.hash.replace('#', '')
    if (hash === 'fretmaster') return 'fretmaster'
    if (hash === 'speedbuilder') return 'speedbuilder'
    return 'speedbuilder'
  }
  const [currentApp, setCurrentApp] = useState<'speedbuilder' | 'fretmaster'>(getInitialApp)

  const handleSwitchApp = (app: 'speedbuilder' | 'fretmaster') => {
    setCurrentApp(app)
    window.history.replaceState(null, '', `#${app}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-content-secondary">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen">
      <TopNav currentApp={currentApp} onSwitchApp={handleSwitchApp} />
      <div style={{ display: currentApp === 'speedbuilder' ? 'block' : 'none' }}>
        <App />
      </div>
      <div style={{ display: currentApp === 'fretmaster' ? 'block' : 'none' }}>
        <FretMaster />
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)
