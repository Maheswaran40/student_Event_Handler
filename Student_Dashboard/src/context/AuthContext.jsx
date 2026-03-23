import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    // Simulate API call
    setLoading(true)
    try {
      // Mock login - replace with actual API call
      if (email === 'admin@example.com' && password === 'admin123') {
        const userData = { id: 1, name: 'Admin User', email, role: 'admin' }
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        toast.success('Login successful!')
        navigate('/dashboard')
        return { success: true }
      } else if (email === 'user@example.com' && password === 'user123') {
        const userData = { id: 2, name: 'Regular User', email, role: 'user' }
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        toast.success('Login successful!')
        navigate('/dashboard')
        return { success: true }
      } else {
        toast.error('Invalid credentials')
        return { success: false, error: 'Invalid credentials' }
      }
    } catch (error) {
      toast.error('Login failed')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}