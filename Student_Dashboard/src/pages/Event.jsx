import React, { useState, useEffect } from 'react'
import { eventsService } from '../services/api'
import EventCard from '../components/EventCard'
import Sidebar from '../components/Sidebar'
import { FiSearch, FiFilter } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Events = () => {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState([])
  const navigate=useNavigate()
  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [searchTerm, selectedCategory, events])

  const fetchEvents = async () => {
    try {
      const data = await eventsService.getAllEvents()
      setEvents(data)
      setFilteredEvents(data)
      const uniqueCategories = [...new Set(data.map(event => event.category))]
      setCategories(['all', ...uniqueCategories])
    } catch (error) {
      toast.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredEvents(filtered)
  }

  const handleRegister = (eventId) => {
    toast.success('Successfully registered for the event!',eventId)
  }

  const handleViewDetails = (eventId) => {
    toast(`Viewing event ${eventId} details`)
  }

  return (
    <div className="flex">
       <div className="lg:flex hidden" >
            <Sidebar />
            </div>
      <div className="flex-1 lg:ml-64 lg:mx-2  p-6 sm:w-[420px] overflow-scroll">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">All Events</h1>
          <p className="text-gray-600">Discover and join amazing events happening near you</p>
        </div>
        
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sm:w-full w-22  pl-10 pr-4 py-2 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="relative">
              {/* <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select> */}
                 <button
            onClick={() => navigate("/register")}
            className="flex-1 btn-primary"
          >
            Register
          </button>
            </div>
          </div>
        </div>
        
        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500 text-lg">No events found</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="mt-4 btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
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
  )
}

export default Events