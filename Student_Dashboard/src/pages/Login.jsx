import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await login(email, password)
    setLoading(false)
  }

  // In your login component
const handleLogin = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    
    if (response.data.success) {
      const { token, ...userData } = response.data.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    toast.error(error.response?.data?.error || 'Login failed');
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <FiLogIn className="text-primary-600 text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="admin@example.com or user@example.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Demo credentials:
            <br />
            Admin: admin@example.com / admin123
            <br />
            User: user@example.com / user123
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login