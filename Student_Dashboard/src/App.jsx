import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Events from './pages/Event'
import Profile from './pages/Profie'
import AdminPanel from './pages/Adminpannel'
import HeroPage from './pages/HeroPage'
import "./style.css"
import RegistrationForm from './pages/RegistrationForm'
import EventDetails from './components/EventDetails'
import ActivityPage from './pages/ActivityPage'
import CreateVolunteerForm from './pages/CreateVolunteerForm'
import Inchargers from './pages/Inchargers'
function App() {
const location=useLocation()
const hideLayout=location.pathname==="/"
  return (
      <AuthProvider>
       {!hideLayout && <Navbar/>}
        <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/Activity" element={<ActivityPage />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/" element={<HeroPage/>} />
              <Route path="/incharges" element={<Inchargers/>} />
              <Route path="/volunteerForm" element={<CreateVolunteerForm/>} />
              <Route path="/register" element={<RegistrationForm/>} />
              <Route path="/events/:eventId" element={<EventDetails/>} />
            </Routes>
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
  )
}

export default App