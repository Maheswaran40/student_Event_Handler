import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { eventsService } from "../services/api";
import { userService } from "../services/api";
import {
  FiUsers,
  FiCalendar,
  FiTrendingUp,
  FiStar,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiSearch,
  FiFilter,
  FiDownload,
  FiMail,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiBarChart2,
  FiUserPlus,
  FiSettings,
  FiEye,
  FiSave,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";
import toast from "react-hot-toast";

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    incharge: "",
    maxParticipants: "",
    image: "",
  });

  // Mock users data
  // const mockUsers = [
  //   {
  //     id: 1,
  //     name: "John Doe",
  //     email: "john@example.com",
  //     role: "user",
  //     eventsAttended: 12,
  //     joinDate: "2024-01-15",
  //     status: "active",
  //   },
  //   {
  //     id: 2,
  //     name: "Jane Smith",
  //     email: "jane@example.com",
  //     role: "user",
  //     eventsAttended: 8,
  //     joinDate: "2024-02-01",
  //     status: "active",
  //   },
  //   {
  //     id: 3,
  //     name: "Mike Johnson",
  //     email: "mike@example.com",
  //     role: "admin",
  //     eventsAttended: 25,
  //     joinDate: "2023-11-10",
  //     status: "active",
  //   },
  //   {
  //     id: 4,
  //     name: "Sarah Wilson",
  //     email: "sarah@example.com",
  //     role: "user",
  //     eventsAttended: 5,
  //     joinDate: "2024-02-20",
  //     status: "inactive",
  //   },
  //   {
  //     id: 5,
  //     name: "David Brown",
  //     email: "david@example.com",
  //     role: "user",
  //     eventsAttended: 15,
  //     joinDate: "2024-01-05",
  //     status: "active",
  //   },
  // ];

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      return;
    }
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const eventsData = await eventsService.getAllEvents();
      setEvents(eventsData);
      const studentsData = await userService.getProfile();
      // console.log("Raw API response:", studentsData);

      // Transform student data to match your UI expectations
      const transformedUsers = studentsData.map((student) => ({
        id: student._id || student.id,
        name: student.name || student.fullName,
        email: student.email,
        phone:
          student.phoneNo || student.mobile || student.phoneNumber || "N/A", //  Add this
        role: student.rollNo || "user",
        eventsAttended: student.eventsAttended?.length || 0,
        joinDate: student.createdAt?.split("T")[0],
        status: student.isActive ? "active" : "inactive",
      }));
      setUsers(transformedUsers);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = async () => {
    // Validate required fields
    if (
      !formData.title ||
      !formData.date ||
      !formData.venue ||
      !formData.incharge
    ) {
      toast.error(
        "Please fill in all required fields (title, date, venue, incharge)",
      );
      return;
    }

    try {
      // Combine date and time into a single Date object
      let eventDateTime;
      if (formData.time) {
        // Combine date and time
        eventDateTime = new Date(`${formData.date}T${formData.time}`);
      } else {
        eventDateTime = new Date(formData.date);
      }

      // Format data to match backend schema EXACTLY
      const eventDataToSend = {
        title: formData.title,
        description: formData.description,
        date: eventDateTime, // Date with time included
        venue: formData.venue, // ✅ Correct field name
        incharge: formData.incharge, // ✅ Correct field name
        maxParticipants: parseInt(formData.maxParticipants) || 10, // Convert to number
        status: "upcoming", // Optional, default is 'upcoming'
      };

      console.log("Sending to backend:", eventDataToSend);

      // Send to API
      const newEvent = await eventsService.createEvent(eventDataToSend);

      // Update local state with the actual response from backend
      setEvents((prev) => [...prev, newEvent]);
      toast.success("Event created successfully!");
      setShowEventModal(false);
      resetForm();
      console.log("Event created:", newEvent);
    } catch (error) {
      console.error("Create event error:", error);
      console.error("Error response:", error.response?.data);

      // Show detailed error message
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors from mongoose
        const errors = error.response.data.errors;
        Object.values(errors).forEach((err) => toast.error(err.message || err));
      } else {
        toast.error("Failed to create event. Please check all fields.");
      }
    }
  };

  const handleUpdateEvent = async () => {
    try {
      await eventsService.updateEvent(editingEvent.id, formData);
      const updatedEvents = events.map((event) =>
        event.id === editingEvent.id ? { ...event, ...formData } : event,
      );
      setEvents(updatedEvents);
      toast.success("Event updated successfully!");
      setShowEventModal(false);
      setEditingEvent(null);
      resetForm();
    } catch (error) {
      toast.error("Failed to update event");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
       console.log("Deleting event with ID:", eventId);
      try {
        await eventsService.deleteEvent(eventId);
        setEvents(events.filter((event) => event.id !== eventId));
        toast.success("Event deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete event");
      }
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      venue: event.venue,
       incharge:event. incharge,
      maxParticipants: event.maxParticipants || "",
      image: event.image || "",
    });
    setShowEventModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      incharge: "",
      maxParticipants: "",
      image: "",
    });
    setEditingEvent(null);
  };

  const handleUserAction = (userId, action) => {
    if (action === "block") {
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: "blocked" } : user,
        ),
      );
      toast.success("User blocked successfully");
    } else if (action === "activate") {
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: "active" } : user,
        ),
      );
      toast.success("User activated successfully");
    } else if (action === "makeAdmin") {
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: "admin" } : user,
        ),
      );
      toast.success("User promoted to admin");
    }
  };

  const getStats = () => {
    const totalEvents = events.length;
    const upcomingEvents = events.filter(
      (e) => new Date(e.date) > new Date(),
    ).length;
    const totalAttendees = events.reduce((sum, e) => sum + e.attendees, 0);
    const activeUsers = users.filter((u) => u.status === "active").length;
    const totalRevenue = events.reduce((sum, e) => sum + e.attendees * 50, 0); // Mock revenue calculation

    return {
      totalEvents,
      upcomingEvents,
      totalAttendees,
      activeUsers,
      totalRevenue,
    };
  };

  const stats = getStats();
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "all" || event.category === selectedCategory),
  );

  const categories = ["all", ...new Set(events.map((e) => e.category))];

  if (!isAdmin) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <FiAlertCircle className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              Access Denied
            </h2>
            <p className="text-red-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600">
              Manage events, users, and monitor platform activity
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <div className="flex space-x-8">
              {[
                { id: "overview", label: "Overview", icon: FiBarChart2 },
                { id: "events", label: "Events", icon: FiCalendar },
                { id: "users", label: "Users", icon: FiUsers },
                { id: "settings", label: "Settings", icon: FiSettings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 px-1 flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-primary-600 text-primary-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Total Events</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {stats.totalEvents}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FiCalendar className="text-blue-600 text-xl" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Upcoming Events</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {stats.upcomingEvents}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <FiTrendingUp className="text-green-600 text-xl" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Total Attendees</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {stats.totalAttendees}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <FiUsers className="text-purple-600 text-xl" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Active Users</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {stats.activeUsers}
                      </p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <FiUserCheck className="text-yellow-600 text-xl" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        ${stats.totalRevenue}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <FiStar className="text-green-600 text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Recent Events
                </h2>
                <div className="space-y-4">
                  {events.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <FiCalendar className="text-primary-600 text-xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {event.date} • {event.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {event.attendees} attendees
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Events Management Tab */}
          {activeTab === "events" && (
            <div className="space-y-6 animate-fade-in">
              {/* Actions Bar */}
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex-1 max-w-md relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setEditingEvent(null);
                      resetForm();
                      setShowEventModal(true);
                    }}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FiPlus />
                    <span>Create Event</span>
                  </button>
                </div>
              </div>

              {/* Events Table */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendees
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredEvents.map((event) => (
                        <tr
                          key={event.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {event.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {event.category}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {event.date}
                            </div>
                            <div className="text-sm text-gray-500">
                              {event.time}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {event.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {event.attendees}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                new Date(event.date) > new Date()
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {new Date(event.date) > new Date()
                                ? "Upcoming"
                                : "Past"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditEvent(event)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event._id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <FiTrash2 />
                              </button>
                              <button
                                onClick={() =>
                                  toast(`Viewing ${event.title} details`)
                                }
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                              >
                                <FiEye />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredEvents.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No events found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Management Tab */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div className="flex-1 max-w-md relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button className="btn-primary flex items-center space-x-2">
                  <FiUserPlus />
                  <span>Add User</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {user.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            PH : {user.phone}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {user.role}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {user.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUserAction(user.id, "makeAdmin")}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Make Admin"
                        >
                          <FiStar />
                        </button>
                        {user.status === "active" ? (
                          <button
                            onClick={() => handleUserAction(user.id, "block")}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Block User"
                          >
                            <FiUserX />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleUserAction(user.id, "activate")
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Activate User"
                          >
                            <FiUserCheck />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            toast(`Sending email to ${user.email}`)
                          }
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Send Email"
                        >
                          <FiMail />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Events Attended:</span>
                        <span className="ml-2 font-semibold text-gray-800">
                          {user.eventsAttended}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Joined:</span>
                        <span className="ml-2 text-gray-600">
                          {user.joinDate}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  General Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      defaultValue="EventHub"
                      className="input-field max-w-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      defaultValue="admin@eventhub.com"
                      className="input-field max-w-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Event Capacity
                    </label>
                    <input
                      type="number"
                      defaultValue="100"
                      className="input-field max-w-md"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Notification Settings
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-gray-700">
                      Send email notifications for new event registrations
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-gray-700">
                      Send weekly digest emails to users
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-gray-700">
                      Send promotional emails
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="btn-primary flex items-center space-x-2">
                  <FiSave />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* Event Modal */}
          {showEventModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingEvent ? "Edit Event" : "Create New Event"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowEventModal(false);
                      setEditingEvent(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter event title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="input-field"
                      placeholder="Enter event description"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Event location"
                    />
                  </div>
                  {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="">Select category</option>
                        <option value="Technology">Technology</option>
                        <option value="Music">Music</option>
                        <option value="Business">Business</option>
                        <option value="Art">Art</option>
                        <option value="Sports">Sports</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Maximum attendees"
                      />
                    </div>
                  </div> */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Incharge *
                      </label>
                      <input
                        type="text"
                        name="incharge"
                        value={formData.incharge}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Incharge name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity
                      </label>
                      <input
                        type="number"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxParticipants: e.target.value,
                          })
                        }
                        placeholder="Max Participants"
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowEventModal(false);
                      setEditingEvent(null);
                      resetForm();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={
                      editingEvent ? handleUpdateEvent : handleCreateEvent
                    }
                    className="btn-primary"
                  >
                    {editingEvent ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
