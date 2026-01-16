import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './lib/AuthContext'
import { LoginPage } from './components/LoginPage'
import { TopNav } from './components/TopNav'
import { FretMaster } from './components/FretMaster'
import { useAuth } from './lib/AuthContext'
import './index.css'

function Root() {
  const { user, loading } = useAuth()
  const [currentApp, setCurrentApp] = useState<'speedbuilder' | 'fretmaster'>('speedbuilder')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen">
      <TopNav currentApp={currentApp} onSwitchApp={setCurrentApp} />
      {currentApp === 'speedbuilder' ? <App /> : <FretMaster />}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>,
)
