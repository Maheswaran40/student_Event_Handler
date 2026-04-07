import React, { useContext, useEffect, useState } from "react";
import axios from "axios";

const RegistrationForm = ({ eventName, bgGradient, onSuccess }) => {
  let url = "http://localhost:5000/api/students/";
  let eventUrl = "http://localhost:5000/api/events/upcoming";
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [gradientColor,setGradientColor]=useState("")
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    event: "", // Added event field
    year: "",
    rollNo: "",
    phoneNo: "",
  });


  
  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(eventUrl);
        console.log("res from dashboard",res)
        const eventsData = res.data.data || []; // Get data array or empty array
        setEvents(eventsData);
        setGradientColor(res.data.data[0].gradientColor)
        console.log()
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]); // Set empty array on error
      }
    };

    fetchEvents();
  }, []);






  const departmentOptions = [
    "Computer Science",
    "Information Technology",
    "Electronics",
    "Mechanical",
    "Civil",
    "Electrical",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.department.trim())
      newErrors.department = "Department is required";
    if (!formData.event) newErrors.event = "Please select an event";
    if (!formData.year.trim()) newErrors.year = "Year / Semester is required";
    if (!formData.rollNo.trim()) newErrors.rollNo = "Roll Number is required";
    if (!formData.phoneNo.trim())
      newErrors.phoneNo = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phoneNo.trim()))
      newErrors.phoneNo = "Enter valid 10-digit mobile number";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(url, formData);
      alert(res.data.message || "Registration successful!");
      fetchEvents()
      onSuccess?.(res.data.data);
      
      // Reset form
      setFormData({
        name: "",
        department: "",
        event: "",
        year: "",
        rollNo: "",
        phoneNo: "",
      });
    } catch (error) {
      alert(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8 border border-gray-100">
      <div className="text-center mb-5">
        {/* <div className="inline-block bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-semibold mb-2">
          <i className="fas fa-check-circle mr-1"></i> FREE REGISTRATION
        </div> */}
        <h3 className="text-2xl font-bold text-gray-800">Register Now</h3>
        <p className="text-gray-500 text-sm mt-1">
          Secure your spot for {eventName}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-[100%] pl-9 pr-3 py-2.5 border ${
                errors.name ? "border-red-400 ring-1 ring-red-200" : "border-gray-300"
              } rounded-xl focus:ring-2 focus:ring-indigo-300 transition`}
              placeholder="John Doe"
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <i className="fas fa-exclamation-circle"></i> {errors.name}
            </p>
          )}
        </div>

        {/* Department Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <i className="fas fa-building left-3 absolute top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-[100%] pl-9 pr-3 py-2.5 border ${
                errors.department ? "border-red-400" : "border-gray-300"
              } rounded-xl focus:ring-2 focus:ring-indigo-300 bg-white appearance-none`}
            >
              <option value="" disabled>
                Select Department
              </option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <i className="fas fa-chevron-down right-3 absolute top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
          </div>
          {errors.department && (
            <p className="text-red-500 text-xs mt-1">{errors.department}</p>
          )}
        </div>

        {/* Events Field - CORRECTED */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Event <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <i className="fas fa-calendar-alt left-3 absolute top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <select
              name="event"
              value={formData.event}
              onChange={handleChange}
              className={`w-[100%] pl-9 pr-3 py-2.5 border ${
                errors.event ? "border-red-400" : "border-gray-300"
              } rounded-xl focus:ring-2 focus:ring-indigo-300 bg-white appearance-none`}
            >
              <option value="" disabled>
                {events.length === 0 ? "Loading events..." : "Select Event"}
              </option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title} 
                </option>
              ))}
            </select>
            <i className="fas fa-chevron-down right-3 absolute top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
          </div>
          {errors.event && (
            <p className="text-red-500 text-xs mt-1">{errors.event}</p>
          )}
          {events.length === 0 && !errors.event && (
            <p className="text-yellow-500 text-xs mt-1 flex items-center gap-1">
              <i className="fas fa-spinner fa-spin"></i> Loading events...
            </p>
          )}
        </div>

        {/* Year and Roll No Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className={`w-[100%] px-3 py-2.5 border ${
                errors.year ? "border-red-400" : "border-gray-300"
              } rounded-xl focus:ring-2 focus:ring-indigo-300`}
              placeholder="2nd Year / 4th Sem"
            />
            {errors.year && (
              <p className="text-red-500 text-xs mt-1">{errors.year}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleChange}
              className={`w-[100%] px-3 py-2.5 border ${
                errors.rollNo ? "border-red-400" : "border-gray-300"
              } rounded-xl focus:ring-2 focus:ring-indigo-300`}
              placeholder="2024CS101"
            />
            {errors.rollNo && (
              <p className="text-red-500 text-xs mt-1">{errors.rollNo}</p>
            )}
          </div>
        </div>

        {/* Phone Number Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <i className="fas fa-phone-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="tel"
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              className={`w-[100%] pl-9 pr-3 py-2.5 border ${
                errors.phoneNo ? "border-red-400" : "border-gray-300"
              } rounded-xl focus:ring-2 focus:ring-indigo-300`}
              placeholder="9876543210"
            />
          </div>
          {errors.phoneNo && (
            <p className="text-red-500 text-xs mt-1">{errors.phoneNo}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-4 bg-gradient-to-r ${gradientColor} text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
            loading ? "opacity-80 cursor-wait" : ""
          }`}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Registering...
            </>
          ) : (
            <>
              <i className="fas fa-check-circle"></i> Confirm Registration
            </>
          )}
        </button>
        <p className="text-center text-xs text-gray-400 pt-2">
          <i className="fas fa-lock"></i> Your details are secure
        </p>
      </form>
    </div>
  );
};

export default RegistrationForm;