import React from 'react'
import { FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

const EventCard = ({ event, onRegister, onViewDetails }) => {
  const formattedDate = format(new Date(event.date), 'MMM dd, yyyy')
  console.log("EventCard",event);
  
  let navigate=useNavigate()
  return (
    <div className="card overflow-hidden hover:scale-[1.02] transition-transform duration-300">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'} 
          alt={event.title}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {event.category}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <FiCalendar className="mr-2" />
            <span className="text-sm">{formattedDate} at {event.time}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FiMapPin className="mr-2" />
            <span className="text-sm">{event.venue}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FiUsers className="mr-2" />
            <span className="text-sm">{event.attendees} attendees</span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/events/${event._id}`)}
            className="flex-1 btn-secondary"
          >
            View Details
          </button>
       
        </div>
      </div>
    </div>
  )
}

export default EventCard