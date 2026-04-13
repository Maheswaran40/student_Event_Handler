// pages/ActivityPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { 
  CalendarIcon, 
  UserIcon, 
  TrophyIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  MapPinIcon,
  DocumentTextIcon,
  PlusIcon,
  // FilterIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [filterEvent, setFilterEvent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedActivityForReassign, setSelectedActivityForReassign] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    approved: 0,
    cancelled: 0,
    totalPoints: 0
  });

  const API_BASE_URL = 'http://localhost:5000/api';
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Get current user from auth context
  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setCurrentUser(response.data.data);
          return response.data.data;
        }
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    // Fallback demo user - replace with your actual auth
    const demoUser = { id: 'admin1', name: 'Admin User', role: 'admin' };
    setCurrentUser(demoUser);
    return demoUser;
  };

  // Fetch existing users (volunteers) and events
  const fetchUsersAndEvents = async () => {
    try {
      const [usersRes, eventsRes] = await Promise.all([
        api.get('/users?role=volunteer'),
        api.get('/events')
      ]);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (eventsRes.data.success) setEvents(eventsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Demo fallback data
      setUsers([
        { id: 'vol1', name: 'Emma Watson', role: 'volunteer', email: 'emma@example.com', points: 240 },
        { id: 'vol2', name: 'Liam Chen', role: 'volunteer', email: 'liam@example.com', points: 185 },
        { id: 'vol3', name: 'Sofia Ramirez', role: 'volunteer', email: 'sofia@example.com', points: 312 }
      ]);
      setEvents([
        { id: 'evt1', name: 'Annual Tech Symposium', date: '2025-05-10', venue: 'Main Auditorium' },
        { id: 'evt2', name: 'Beach Cleanup Drive', date: '2025-05-18', venue: 'Sunset Beach' },
        { id: 'evt3', name: 'Charity Gala Night', date: '2025-06-05', venue: 'Grand Ballroom' }
      ]);
    }
  };

  // Fetch activities based on user role
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/activities');
      if (response.data.success) {
        setActivities(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (activitiesData) => {
    const completed = activitiesData.filter(a => a.status === 'completed');
    const pending = activitiesData.filter(a => a.status === 'pending');
    const approved = activitiesData.filter(a => a.status === 'approved');
    const cancelled = activitiesData.filter(a => a.status === 'cancelled');
    const totalPoints = activitiesData.reduce((sum, a) => sum + (a.points || 0), 0);
    
    setStats({
      total: activitiesData.length,
      completed: completed.length,
      pending: pending.length,
      approved: approved.length,
      cancelled: cancelled.length,
      totalPoints: totalPoints
    });
  };

  // Create new activity (Admin only)
  const createActivity = async (activityData) => {
    try {
      const response = await api.post('/activities', activityData);
      if (response.data.success) {
        toast.success('Activity created and assigned successfully');
        setShowCreateModal(false);
        fetchActivities();
        return true;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to create activity';
      toast.error(errorMsg);
      return false;
    }
  };

  // Update activity (status, reassign, points)
  const updateActivity = async (id, updates) => {
    try {
      const response = await api.put(`/activities/${id}`, updates);
      if (response.data.success) {
        toast.success('Activity updated successfully');
        fetchActivities();
        if (selectedActivity?._id === id) {
          setSelectedActivity(response.data.data);
        }
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update activity');
      return false;
    }
  };

  // Volunteer marks activity as completed with proof
  const markAsCompleted = async (id, proofUrl) => {
    try {
      const response = await api.patch(`/activities/${id}/complete`, { proof: proofUrl });
      if (response.data.success) {
        toast.success('Activity marked as completed! Waiting for admin approval.');
        fetchActivities();
        return true;
      }
    } catch (error) {
      toast.error('Failed to mark as completed');
      return false;
    }
  };

  // Delete activity (Admin only)
  const deleteActivity = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        const response = await api.delete(`/activities/${id}`);
        if (response.data.success) {
          toast.success('Activity deleted successfully');
          fetchActivities();
          if (selectedActivity?._id === id) {
            setSelectedActivity(null);
          }
        }
      } catch (error) {
        toast.error('Failed to delete activity');
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      await getCurrentUser();
      await fetchUsersAndEvents();
      await fetchActivities();
    };
    init();
  }, []);

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    if (filterEvent && activity.eventId?._id !== filterEvent && activity.eventId !== filterEvent) return false;
    if (filterStatus && activity.status !== filterStatus) return false;
    if (searchTitle && !activity.title?.toLowerCase().includes(searchTitle.toLowerCase())) return false;
    return true;
  });

  const isAdmin = currentUser?.role === 'admin';

  // Status badge component
  const StatusBadge = ({ status }) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      approved: 'bg-green-100 text-green-800 border border-green-200',
      completed: 'bg-blue-100 text-blue-800 border border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200'
    };
    const icons = {
      pending: <ClockIcon className="w-3 h-3 mr-1" />,
      approved: <CheckCircleIcon className="w-3 h-3 mr-1" />,
      completed: <TrophyIcon className="w-3 h-3 mr-1" />,
      cancelled: <XCircleIcon className="w-3 h-3 mr-1" />
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {icons[status]}
        {status.toUpperCase()}
      </span>
    );
  };

  const PriorityBadge = ({ priority }) => {
    const styles = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${styles[priority] || styles.Medium}`}>
        <FlagIcon className="w-3 h-3 mr-1" />
        {priority || 'Medium'}
      </span>
    );
  };

  return (
    <>
      <div className="lg:flex hidden">
        <Sidebar />
      </div>
   
      <div className="min-h-screen lg:ml-64 p-2 bg-gradient-to-br from-gray-50 to-gray-100">
        <Toaster position="top-right" />
        
        {/* Header */}
        <div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Activity Management
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {isAdmin ? 'Manage and assign activities to volunteers' : 'View and manage your assigned activities'}
                </p>
              </div>
              <div className="flex gap-3">
                {isAdmin && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Create Activity
                  </button>
                )}
                <button
                  onClick={fetchActivities}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <p className="text-xs text-gray-500">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <p className="text-xs text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
              <p className="text-xs text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <p className="text-xs text-gray-500">Total Points</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalPoints}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-8 bg-white rounded-xl shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by activity title..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Events</option>
                {events.map(event => (
                  <option key={event._id || event.id} value={event._id || event.id}>
                    {event.name || event.title}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="approved">Approved</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Activities Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredActivities.map((activity) => (
                      <tr key={activity._id || activity.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                          {activity.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">{activity.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{activity.eventId?.name || activity.eventId?.title || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{activity.assignedTo?.name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={activity.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PriorityBadge priority={activity.priority} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {activity.deadline ? new Date(activity.deadline).toLocaleDateString() : 'No deadline'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <TrophyIcon className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-sm font-semibold text-gray-900">{activity.points || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setSelectedActivity(activity)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="View Details"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            
                            {isAdmin ? (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedActivityForReassign(activity);
                                    setShowReassignModal(true);
                                  }}
                                  className="p-1 text-purple-600 hover:bg-purple-50 rounded transition"
                                  title="Reassign Volunteer"
                                >
                                  <UserIcon className="w-5 h-5" />
                                </button>
                                {activity.status === 'completed' && (
                                  <>
                                    <button
                                      onClick={() => updateActivity(activity._id || activity.id, { status: 'approved' })}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                                      title="Approve"
                                    >
                                      <CheckCircleIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={() => updateActivity(activity._id || activity.id, { status: 'cancelled', remarks: 'Rejected by admin' })}
                                      className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                                      title="Reject"
                                    >
                                      <XCircleIcon className="w-5 h-5" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => deleteActivity(activity._id || activity.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                                  title="Delete"
                                >
                                  <XCircleIcon className="w-5 h-5" />
                                </button>
                              </>
                            ) : (
                              activity.status === 'pending' && activity.assignedTo?._id === currentUser?.id && (
                                <button
                                  onClick={() => {
                                    const proofUrl = prompt('Enter proof URL (image link):');
                                    if (proofUrl) markAsCompleted(activity._id || activity.id, proofUrl);
                                  }}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                  title="Mark as Completed"
                                >
                                  <CheckCircleIcon className="w-5 h-5" />
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredActivities.length === 0 && (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No activities found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Create Activity Modal */}
        {showCreateModal && (
          <CreateActivityModal
            events={events}
            users={users.filter(u => u.role === 'volunteer')}
            onClose={() => setShowCreateModal(false)}
            onSubmit={createActivity}
          />
        )}

        {/* Reassign Modal */}
        {showReassignModal && selectedActivityForReassign && (
          <ReassignModal
            activity={selectedActivityForReassign}
            users={users.filter(u => u.role === 'volunteer')}
            onClose={() => {
              setShowReassignModal(false);
              setSelectedActivityForReassign(null);
            }}
            onReassign={async (activityId, newVolunteerId) => {
                  await updateActivity(activityId, { assignedTo: newVolunteerId });
                  setShowReassignModal(false);
                  setSelectedActivityForReassign(null);
                }}
          />
        )}

        {/* Activity Details Modal */}
        {selectedActivity && (
          <ActivityDetailsModal
            activity={selectedActivity}
            currentUser={currentUser}
            users={users}
            onClose={() => setSelectedActivity(null)}
            onUpdate={updateActivity}
            onMarkComplete={markAsCompleted}
          />
        )}
      </div>
    </>
  );
};

// Create Activity Modal Component
const CreateActivityModal = ({ events, users, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventId: '',
    assignedTo: '',
    priority: 'Medium',
    deadline: '',
    points: 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.eventId || !formData.assignedTo) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Activity
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter activity title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe the activity..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event *</label>
            <select
              required
              value={formData.eventId}
              onChange={(e) => setFormData({...formData, eventId: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Event</option>
              {events.map(event => (
                <option key={event._id || event.id} value={event._id || event.id}>
                  {event.name || event.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Volunteer *</label>
            <select
              required
              value={formData.assignedTo}
              onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Volunteer</option>
              {users.map(user => (
                <option key={user._id || user.id} value={user._id || user.id}>
                  {user.name} - {user.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
            <input
              type="number"
              value={formData.points}
              onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 0})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Points to award"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium"
            >
              {loading ? 'Creating...' : 'Create Activity'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reassign Modal Component
const ReassignModal = ({ activity, users, onClose, onReassign }) => {
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVolunteer) {
      toast.error('Please select a volunteer');
      return;
    }
    setLoading(true);
    await onReassign(activity._id || activity.id, selectedVolunteer);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Reassign Activity</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity: <span className="font-semibold">{activity.title}</span>
            </label>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select New Volunteer *</label>
            <select
              required
              value={selectedVolunteer}
              onChange={(e) => setSelectedVolunteer(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Volunteer</option>
              {users.map(user => (
                <option key={user._id || user.id} value={user._id || user.id}>
                  {user.name} - Current Points: {user.points || 0}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Reassigning...' : 'Reassign Activity'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Activity Details Modal Component
const ActivityDetailsModal = ({ activity, currentUser, users, onClose, onUpdate, onMarkComplete }) => {
  const [points, setPoints] = useState(activity.points || 0);
  const [remarks, setRemarks] = useState(activity.remarks || '');
  const [proof, setProof] = useState(activity.proof || '');
  const isAdmin = currentUser?.role === 'admin';
  const isAssignedToMe = activity.assignedTo?._id === currentUser?.id || activity.assignedTo === currentUser?.id;

  const handleUpdatePoints = async () => {
    if (points !== activity.points) {
      await onUpdate(activity._id || activity.id, { points });
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    await onUpdate(activity._id || activity.id, { status: newStatus, remarks });
  };

  const handleCompleteWithProof = async () => {
    const proofUrl = prompt('Enter proof URL (image link):', proof);
    if (proofUrl) {
      await onMarkComplete(activity._id || activity.id, proofUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Activity Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
            {activity.description && (
              <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500">Event</label>
              <p className="mt-1 text-sm font-medium text-gray-900">{activity.eventId?.name || activity.eventId?.title}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Assigned To</label>
              <p className="mt-1 text-sm font-medium text-gray-900">{activity.assignedTo?.name || 'Unassigned'}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Priority</label>
              <p className="mt-1 text-sm font-medium text-gray-900">{activity.priority || 'Medium'}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Deadline</label>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {activity.deadline ? new Date(activity.deadline).toLocaleDateString() : 'No deadline'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Points</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                disabled={!isAdmin}
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
              {isAdmin && (
                <button
                  onClick={handleUpdatePoints}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
              )}
            </div>
          </div>

          {activity.proof && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Proof</label>
              <a href={activity.proof} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                View Uploaded Proof
              </a>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows="3"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add remarks..."
              disabled={!isAdmin && !isAssignedToMe}
            />
          </div>

          {!isAdmin && isAssignedToMe && activity.status === 'pending' && (
            <button
              onClick={handleCompleteWithProof}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              Mark as Completed & Upload Proof
            </button>
          )}

          {isAdmin && activity.status === 'completed' && (
            <div className="flex gap-3">
              <button
                onClick={() => handleStatusUpdate('approved')}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"
              >
                Approve Activity
              </button>
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium"
              >
                Reject Activity
              </button>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-400">
              Created: {new Date(activity.createdAt).toLocaleString()}
              {activity.updatedAt && activity.updatedAt !== activity.createdAt && (
                <span className="ml-4">Last updated: {new Date(activity.updatedAt).toLocaleString()}</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;