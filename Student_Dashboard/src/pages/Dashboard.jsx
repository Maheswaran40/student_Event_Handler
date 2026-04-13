import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { eventsService,userService } from '../services/api'
import EventCard from '../components/EventCard'
import Sidebar from '../components/Sidebar'
import { FiTrendingUp, FiUsers, FiCalendar, FiStar } from 'react-icons/fi'
import toast from 'react-hot-toast'
const Dashboard = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalregistered: 0,
    eventsAttended: 0
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const data = await eventsService.getAllEvents()
      const studentsData = await userService.getProfile();
       console.log("Dashboard",studentsData);
      setEvents(data)
      setStats({
        totalEvents: data.length,
        upcomingEvents: data.filter(e => new Date(e.date) > new Date()).length,
        totalregistered: studentsData.data.count || 0,
        eventsAttended: 0 // Mock data
      })

    } catch (error) {
      toast.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = (eventId) => {
    toast.success('Successfully registered for the event!')
  }

  const handleViewDetails = (eventId) => {
    toast(`Viewing event ${eventId} details`)
  }

  const statCards = [
    { icon: FiCalendar, label: 'Total Events', value: stats.totalEvents, color: 'bg-blue-500' },
    { icon: FiTrendingUp, label: 'Upcoming', value: stats.upcomingEvents, color: 'bg-green-500' },
    { icon: FiUsers, label: 'Total Registered', value: stats.totalregistered, color: 'bg-purple-500' },
    { icon: FiStar, label: 'Events Attended', value: stats.eventsAttended, color: 'bg-yellow-500' }
  ]

  return (
    <div className="flex">
       <div className="lg:flex hidden" >
            <Sidebar />
            </div>
      <div className="flex-1 lg:ml-64 p-6 lg:mx-2 sm:w-[420px] overflow-scroll">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your events today.</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="text-white text-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Upcoming Events */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Events</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.slice(0, 3).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegister={handleRegister}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard