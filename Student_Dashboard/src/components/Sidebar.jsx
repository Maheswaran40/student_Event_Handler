import React from 'react'
import { NavLink } from 'react-router-dom'
import { FaPersonChalkboard } from "react-icons/fa6";
import { 
  FiHome, 
  FiCalendar, 
  FiUser, 
  FiSettings, 
  FiShield,
  FiTrendingUp,
  FiBell
} from 'react-icons/fi'
import { LuActivity } from "react-icons/lu";
import { FaWpforms } from "react-icons/fa6";
import { useAuth } from '../context/AuthContext'

const Sidebar = ({close}) => {
  const { isAdmin } = useAuth()
  
  const navItems = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/events', icon: FiCalendar, label: 'Events' },
    { to: '/activity', icon: LuActivity, label: 'Activity' },
    { to: '/profile', icon: FiUser, label: 'Profile' },
    { to: '/settings', icon: FiSettings, label: 'Settings' },
    { to: '/analytics', icon: FiTrendingUp, label: 'Analytics' },
    { to: '/notifications', icon: FiBell, label: 'Notifications' },
    { to: '/volunteerForm', icon: FaWpforms, label: 'create volunteer' },
    { to: '/incharges', icon: FaPersonChalkboard , label: 'Event Inchargers' },
  ]
  
  // if (isAdmin) {
  //   navItems.push({ to: '/admin', icon: FiShield, label: 'Admin Panel' })
  // }
  
  return (
    <aside className="w-64 bg-white shadow-lg lg:min-h-screen overflow-scroll fixed left-0 top-16 ">
      <nav className="p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                }`
              }
            >
              <item.icon className="text-xl" />
              <span className="font-medium" onClick={()=>close(false)}>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar