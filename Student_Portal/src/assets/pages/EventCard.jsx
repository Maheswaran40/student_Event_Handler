import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  return (
    <Link to={`/event/${event.id}`} className="group no-underline">
      <div className="event-card bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col border border-gray-100">
        {/* Gradient top accent */}
        <div className={`h-2 bg-gradient-to-r ${event.bgGradient}`}></div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${event.bgGradient} flex items-center justify-center text-white shadow-md`}>
              <i className={`${event.icon} text-xl`}></i>
            </div>
            <i className="fas fa-arrow-right text-gray-300 group-hover:text-indigo-500 transition-colors text-lg"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{event.name}</h2>
          <p className="text-sm text-indigo-500 font-medium mb-3">{event.tagline}</p>
          <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
            <i className="fas fa-clipboard-list text-gray-400 text-xs"></i>
            <span>Click to view rules & register</span>
          </p>
          <div className="mt-auto pt-3">
            <span className="inline-flex items-center text-indigo-600 text-sm font-semibold group-hover:gap-2 transition-all gap-1">
              Explore Event <i className="fas fa-chevron-right text-xs"></i>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;