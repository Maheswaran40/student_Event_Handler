import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventsService } from "../services/api"; // Note: named import

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  console.log("eventId", eventId);
  
  const [event, setEvent] = useState(null);

  async function fetcheventData() {
    try {
      const events = await eventsService.getAllEvents(); // Direct array
      console.log("Events:", events);
      
      const foundEvent = events.find((ev) => ev._id == eventId);
      console.log("Found event:", foundEvent);
      
      setEvent(foundEvent);
    } catch (err) {
      console.log("Fetching error:", err);
    }
  }
  
  useEffect(() => {
    fetcheventData();
  }, [eventId]); // Add eventId as dependency

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }
  

  // const showSuccessToast = (message) => {
  //   const toast = document.createElement("div");
  //   toast.innerText = message;
  //   toast.className =
  //     "fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-xl text-base font-medium z-50 transition-all duration-300";
  //   document.body.appendChild(toast);
  //   setTimeout(() => {
  //     toast.style.opacity = "0";
  //     setTimeout(() => {
  //       document.body.removeChild(toast);
  //     }, 300);
  //   }, 2000);
  // };

  // const handleRegistrationSuccess = (formData) => {
  //   showSuccessToast(
  //     `🎉 Registration successful for ${event.name}! Thank you ${formData.studentName}.`,
  //   );
  //   // You can also make an API call here to save registration data
  //   console.log("Registration data:", { eventId: event.id, ...formData });
  // };

   const gradientColor = [
    "from-indigo-500 to-purple-600",
    "from-amber-500 to-red-600",
    "from-emerald-500 to-teal-600",
    "from-pink-500 to-rose-600",
    "from-slate-700 to-gray-900"
  ];
  // Create a consistent hash from event ID
  const getGradientFromId = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0;
    }
    return gradientColor[Math.abs(hash) % gradientColor.length];
  };
  
 

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col p-5">
        <i className="fas fa-exclamation-triangle text-5xl text-amber-500 mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-800">Event not found</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl shadow transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

   const selectedGradient = getGradientFromId(event._id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-indigo-700 transition font-medium bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
        >
          <i className="fas fa-arrow-left"></i> Back to Events
        </button>

        {/* Event Header Card */}
        <div
          className={`bg-gradient-to-r ${selectedGradient} rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <i className={`${event.icon} text-3xl md:text-4xl`}></i>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold">
                  {event.title}
                </h1>
                <p className="text-white/80 text-lg mt-1">{event.description}</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-full px-4 py-2 text-sm font-mono">
              <i className="fas fa-ticket-alt mr-1"></i> Limited Slots
              <span className="text-black-400 ps-3">{event.registeredCount}/{event.maxParticipants}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">


          {/* Rules & Regulations Section */}
          <div className="lg:col-span-12 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-4">
                <i className="fas fa-gavel text-indigo-500 text-xl"></i>
                <h2 className="text-2xl font-bold text-gray-800">
                  Rules & Regulations
                </h2>
              </div>
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-3">
                    <i className="fas fa-list-ul text-indigo-400 text-sm"></i>{" "}
                    Event Rules
                  </h3>
                  <ul className="space-y-2 pl-2">
                    {/* {event.description.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <span className="text-indigo-500 font-bold mt-0.5">•</span>
                        <span>{rule}</span>
                      </li>
                    
                    ))} */}
                      <div  className="bg-white rounded-xl p-5 shadow">
                        <h2 className="text-2xl font-bold mb-4">
                          {event.title}
                        </h2>

                        <p className="text-gray-700 mb-2">
                          <strong>Description:</strong> {event.description}
                        </p>

                        <p className="text-gray-700 mb-2">
                          <strong>Date:</strong>{" "}
                          {new Date(event.date).toLocaleDateString()}
                        </p>

                        <p className="text-gray-700 mb-2">
                          <strong>Venue:</strong> {event.venue}
                        </p>
                      
                        <p className="text-gray-700 mb-2">
                          <strong>Incharge:</strong> {event.incharge}
                        </p>
                         <p className="text-gray-700 mb-2">
                          <strong>MaxParticipants:</strong> {event.maxParticipants}
                        </p>
                      </div>
                  </ul>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border-l-4 border-indigo-400">
                  <h3 className="font-semibold text-indigo-800 flex items-center gap-2 mb-2">
                    <i className="fas fa-scale-balanced"></i> General
                    Regulations
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {event.regulations}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/70 rounded-xl p-5 border border-gray-200 flex items-center gap-3 text-sm text-gray-600">
              <i className="fas fa-info-circle text-indigo-400 text-lg"></i>
              <span>
                All registered participants will receive e-certificates. For
                queries, contact student coordinators.
              </span>
            </div>
          </div>

      
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
