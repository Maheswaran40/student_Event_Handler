import React, { useContext } from 'react';
import EventCard from './EventCard';
import { Mycontext } from '../Context/Mycontext';
// import { eventsData } from '../json/Event';
const EventDashboard = () => {
  const{eventsData}=useContext(Mycontext)
  console.log("dashboard data",eventsData);
  
  return (
    <div className="min-h-screen px-5 py-8 md:py-12 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-10 md:mb-14">
        <div className="inline-flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-full px-5 py-2 shadow-sm mb-4">
          <i className="fas fa-calendar-alt text-indigo-600 mr-2"></i>
          <span className="text-sm font-medium text-gray-700">Spring Fest 2025</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
          Student Event Hub
        </h1>
        <p className="text-gray-900 mt-3 max-w-lg mx-auto text-lg">
          Discover amazing events, read rules & regulations, and register in seconds.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 md:gap-9">
        {eventsData.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Decorative footer note */}
      <div className="mt-16 text-center text-gray-400 text-sm border-t border-gray-200 pt-8">
        <i className="fas fa-shield-alt mr-1"></i> Secure registration • All fields mandatory • Certificates provided
      </div>
    </div>
  );
};

export default EventDashboard;