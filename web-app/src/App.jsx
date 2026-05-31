import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Login from './components/Login'

function App() {
  // Para la demo del hackathon: acceso directo al Dashboard
  // En producción, cambiar a: useState(null)
  const [token, setToken] = useState(localStorage.getItem('access_token') || 'demo')

  const handleLogin = (accessToken) => {
    localStorage.setItem('access_token', accessToken)
    setToken(accessToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setToken(null)
  }

  if (!token) return <Login onLogin={handleLogin} />
  return <Dashboard token={token} onLogout={handleLogout} />
}

export default App
