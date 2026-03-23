import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiLogOut, FiUser, FiCalendar, FiHome, FiShield } from 'react-icons/fi'

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated) return null

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <FiCalendar className="text-primary-600 text-2xl" />
            <span className="font-bold text-xl text-gray-800">EventHub</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors">
              <FiHome />
              <span>Dashboard</span>
            </Link>
            <Link to="/events" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors">
              <FiCalendar />
              <span>Events</span>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors">
                <FiShield />
                <span>Admin</span>
              </Link>
            )}
            <Link to="/profile" className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors">
              <FiUser />
              <span>Profile</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, <span className="font-semibold">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar