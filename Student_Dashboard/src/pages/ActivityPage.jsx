// pages/StudentScoreBoard.jsx
import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { 
  CalendarIcon, 
  UserIcon, 
  TrophyIcon, 
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  MapPinIcon,
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const ActivityPage = () => {
  // Demo data states
  // const [students] = useState([
  //   { id: 'stu1', name: 'Alice Johnson', rollNumber: '2024001', class: '10A', email: 'alice@example.com' },
  //   { id: 'stu2', name: 'Bob Smith', rollNumber: '2024002', class: '10A', email: 'bob@example.com' },
  //   { id: 'stu3', name: 'Charlie Brown', rollNumber: '2024003', class: '10B', email: 'charlie@example.com' },
  //   { id: 'stu4', name: 'Diana Prince', rollNumber: '2024004', class: '10B', email: 'diana@example.com' },
  //   { id: 'stu5', name: 'Ethan Hunt', rollNumber: '2024005', class: '10C', email: 'ethan@example.com' },
  // ]);

  // const [events] = useState([
  //   { id: 'evt1', title: 'Mathematics Quiz', description: 'Test math skills', date: '2025-05-10', venue: 'Room 101', maxScore: 100, status: 'upcoming' },
  //   { id: 'evt2', title: 'Science Exhibition', description: 'Showcase science projects', date: '2025-05-18', venue: 'Science Hall', maxScore: 100, status: 'ongoing' },
  //   { id: 'evt3', title: 'Sports Day', description: 'Annual sports competition', date: '2025-06-05', venue: 'Sports Ground', maxScore: 50, status: 'upcoming' },
  //   { id: 'evt4', title: 'Art Competition', description: 'Creative arts showcase', date: '2025-05-25', venue: 'Art Gallery', maxScore: 75, status: 'ongoing' },
  // ]);

  const [scores] = useState([
    { id: 'scr1', studentId: 'stu1', eventId: 'evt1', score: 85, status: 'approved', volunteerId: 'vol1', remarks: 'Good performance' },
    { id: 'scr2', studentId: 'stu2', eventId: 'evt1', score: 78, status: 'approved', volunteerId: 'vol1', remarks: 'Needs improvement' },
    { id: 'scr3', studentId: 'stu3', eventId: 'evt1', score: 92, status: 'pending', volunteerId: 'vol1', remarks: 'Excellent' },
    { id: 'scr4', studentId: 'stu1', eventId: 'evt2', score: 88, status: 'approved', volunteerId: 'vol2', remarks: 'Very creative' },
    { id: 'scr5', studentId: 'stu2', eventId: 'evt2', score: 76, status: 'pending', volunteerId: 'vol2', remarks: 'Good effort' },
  ]);

  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentUser,setCurrentUser] = useState(null);
  const [events,setEvents]=useState(null)
  const [students,setStudents]=useState([])
  const [filterClass, setFilterClass] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [viewMode, setViewMode] = useState('events');
  const [eventScores, setEventScores] = useState([]);
  const [registrationData, setRegistrationData] = useState({});

  const isAdmin = currentUser === 'admin';
  const isVolunteer = currentUser === 'volunteer';
  console.log("events",events)
  console.log("students",students)
  
  const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get("http://localhost:5000/api/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("checking admin or not",response.data.data);
    

    if (response.data) {
      setCurrentUser(response.data.data.role);
      console.log(response.data.data)
      setEvents(response.data.data.events)
      setStudents(response.data.data.students)
       //  real user
    }
  } catch (error) {
    console.error(error);
  }
};
useEffect(() => {
  getCurrentUser();
}, []);


// const fetchStudentsByEvent = async (eventId) => {
//   try {
//     const token = localStorage.getItem("token");

//     const res = await axios.get(
//       `http://localhost:5000/api/event/${eventId}/students`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       }
//     );

//     console.log("students:", res);

//     if (res.data.success) {
//       setStudents(res.data.data); // ✅ correct
//     }

//   } catch (error) {
//     console.error("Fetch error:", error.response?.data || error.message);
//   }
// };
// useEffect(() => {
//   if (events && events.length > 0) {
//     const eventId = events[0]._id; // ✅ first event
//     fetchStudentsByEvent(eventId);
//   }
// }, [events]);

  // Filter students
  // const filteredStudents = students.filter(student => {
  //   if (filterClass && student.class !== filterClass) return false;
  //   if (searchStudent && !student.name.toLowerCase().includes(searchStudent.toLowerCase())) return false;
  //   return true;
  // });

  // Get unique classes
  const uniqueClasses = [...new Set(students.map(s => s.class))];

  // Get student's total score
  const getStudentTotalScore = (studentId) => {
    return scores
      .filter(s => s.studentId === studentId && s.status === 'approved')
      .reduce((sum, s) => sum + (s.score || 0), 0);
  };

  // Get student's score for a specific event
  const getStudentEventScore = (studentId, eventId) => {
    return scores.find(s => s.studentId === studentId && s.eventId === eventId);
  };

  // Sort students by total score
  // const sortedStudents = [...filteredStudents].sort((a, b) => {
  //   const scoreA = getStudentTotalScore(a.id);
  //   const scoreB = getStudentTotalScore(b.id);
  //   return scoreB - scoreA;
  // });

  // Load event scores
  const loadEventScores = (event) => {
    setSelectedEvent(event);
    const eventSpecificScores = scores.filter(s => s.eventId === event.id);
    
    const scoresWithDetails = eventSpecificScores.map((score) => {
      const student = students.find(s => s.id === score.studentId);
      return {
        ...score,
        studentName: student?.name || 'Unknown',
        rollNumber: student?.rollNumber || 'N/A',
        class: student?.class || 'N/A'
      };
    });
    
    setEventScores(scoresWithDetails);
    setViewMode('scoreboard');
  };

  // Toggle registration
  const toggleRegistration = (studentId, eventId, isRegistered) => {
    setRegistrationData(prev => ({
      ...prev,
      [studentId]: !isRegistered
    }));
    toast.success(`Student ${!isRegistered ? 'registered' : 'unregistered'} successfully`);
  };

  // Handle score submission
  const handleSubmitScore = (scoreData) => {
    toast.success('Score submitted successfully! Waiting for admin approval.',scoreData);
    setShowScoreModal(false);
  };

  // Handle approve score
  const handleApproveScore = (scoreId) => {
    toast.success('Score approved successfully',scoreId);
  };

  // Handle create event
  const handleCreateEvent = (eventData) => {
    toast.success('Event created successfully');
    setShowEventModal(false);
  };

  // Status badge component
  const EventStatusBadge = ({ status }) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.upcoming}`}>
        {status?.toUpperCase() || 'UPCOMING'}
      </span>
    );
  };

  // Admin View: Events Grid
  const AdminEventsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map(event => (
        <div
          key={event.id}
          onClick={() => loadEventScores(event)}
          className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
            <EventStatusBadge status={event.status} />
          </div>
          <div className="p-4">
            <p className="text-gray-600 text-sm mb-3">{event.description}</p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {new Date(event.date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPinIcon className="w-4 h-4 mr-2" />
                {event.venue}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <TrophyIcon className="w-4 h-4 mr-2" />
                Max Score: {event.maxScore}
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-gray-400">
                Scores: {scores.filter(s => s.eventId === event.id).length}
              </span>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Scoreboard →
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Admin View: Event Scoreboard
  const AdminScoreboardView = () => (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button
            onClick={() => {
              setViewMode('events');
              setSelectedEvent(null);
              setEventScores([]);
            }}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Events
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">{selectedEvent?.title} - Scoreboard</h2>
          <p className="text-gray-600">{selectedEvent?.venue} | {selectedEvent?.date && new Date(selectedEvent.date).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <EventStatusBadge status={selectedEvent?.status} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {eventScores.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No scores submitted yet for this event
                  </td>
                </tr>
              ) : (
                [...eventScores].sort((a, b) => b.score - a.score).map((score, index) => (
                  <tr key={score.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold">#{index + 1}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{score.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{score.rollNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{score.class}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-gray-900">{score.score}</span>
                      <span className="text-sm text-gray-500">/{selectedEvent?.maxScore}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        score.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {score.status === 'approved' ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{score.remarks || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {score.status === 'pending' && (
                        <button
                          onClick={() => handleApproveScore(score.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Volunteer View: Event Registration & Score Entry
  const VolunteerEventView = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Events</h2>
        <p className="text-gray-600">Manage student registrations and submit scores</p>
      </div>

      {events.map(event => (
        <div key={event.id} className="mb-8 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{event.title}</h3>
                <p className="text-blue-100 text-sm mt-1">{event.description}</p>
              </div>
              <EventStatusBadge status={event.status} />
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b">
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {new Date(event.date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4 mr-2" />
                {event.venue}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <TrophyIcon className="w-4 h-4 mr-2" />
                Max Score: {event.maxScore}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Registration</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map(student => {
                    const existingScore = getStudentEventScore(student.id, event.id);
                    const isRegistered = registrationData[student.id] || false;
                    
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.email}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{student.rollNumber}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{student.class}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleRegistration(student.id, event.id, isRegistered)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                              isRegistered 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {isRegistered ? (
                              <span className="flex items-center gap-1">
                                <CheckCircleIcon className="w-4 h-4" />
                                Registered
                              </span>
                            ) : (
                              'Mark Register'
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {existingScore ? (
                            <span className={`text-sm font-semibold ${
                              existingScore.status === 'approved' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {existingScore.score}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {existingScore && (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              existingScore.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {existingScore.status === 'approved' ? 'Approved' : 'Pending'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setSelectedEvent(event);
                              setShowScoreModal(true);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            disabled={!isRegistered}
                          >
                            {existingScore ? 'Update Score' : 'Add Score'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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
                  {isAdmin ? 'Event Scoreboard Management' : 'Volunteer Dashboard'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {isAdmin 
                    ? 'Click on any event to view and manage scores' 
                    : 'Mark student registrations and submit scores for admin approval'}
                </p>
              </div>
              <div className="flex gap-3">
                {isVolunteer && (
                  <button
                    onClick={() => setShowEventModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Create Event
                  </button>
                )}
                <button
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      toast.success('Data refreshed');
                    }, 1000);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters - Only show for volunteer view or when not in scoreboard */}
        {(!isAdmin || (isAdmin && viewMode === 'events')) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by student name..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {isAdmin && viewMode === 'events' && <AdminEventsView />}
              {isAdmin && viewMode === 'scoreboard' && <AdminScoreboardView />}
              {isVolunteer && <VolunteerEventView />}
            </>
          )}
        </div>

        {/* Score Assignment Modal */}
        {showScoreModal && selectedStudent && selectedEvent && (
          <ScoreModal
            student={selectedStudent}
            event={selectedEvent}
            existingScore={scores.find(s => 
              s.studentId === selectedStudent.id && 
              s.eventId === selectedEvent.id
            )}
            onClose={() => {
              setShowScoreModal(false);
              setSelectedStudent(null);
              setSelectedEvent(null);
            }}
            onSubmit={handleSubmitScore}
          />
        )}

        {/* Create Event Modal */}
        {showEventModal && (
          <EventModal
            onClose={() => setShowEventModal(false)}
            onSubmit={handleCreateEvent}
          />
        )}
      </div>
    </>
  );
};

// Score Modal Component
const ScoreModal = ({ student, event, existingScore, onClose, onSubmit }) => {
  const [score, setScore] = useState(existingScore?.score || '');
  const [remarks, setRemarks] = useState(existingScore?.remarks || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!score || score < 0 || score > event.maxScore) {
      toast.error(`Please enter a valid score between 0 and ${event.maxScore}`);
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      onSubmit({
        studentId: student.id,
        eventId: event.id,
        score: parseInt(score),
        remarks: remarks
      });
      setLoading(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {existingScore ? 'Update Score' : 'Add Score'} - {event.title}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Student:</strong> {student.name} ({student.rollNumber})
            </p>
            <p className="text-sm text-blue-600 mt-1">
              <strong>Class:</strong> {student.class}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Score (0-{event.maxScore}) *
            </label>
            <input
              type="number"
              min="0"
              max={event.maxScore}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add any comments about the student's performance..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Submitting...' : (existingScore ? 'Update Score' : 'Submit Score')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
          </div>
          
          {existingScore && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Current status: {existingScore.status === 'approved' ? 'Approved' : 'Pending Approval'}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

// Event Modal Component
const EventModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    maxScore: 100
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.venue) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      onSubmit(formData);
      setLoading(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Create New Event</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Mathematics Quiz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe the event..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
            <input
              type="text"
              required
              value={formData.venue}
              onChange={(e) => setFormData({...formData, venue: e.target.value})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Room 101, Main Hall"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Score</label>
            <input
              type="number"
              value={formData.maxScore}
              onChange={(e) => setFormData({...formData, maxScore: parseInt(e.target.value) || 100})}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1"
              max="1000"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Creating...' : 'Create Event'}
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

export default ActivityPage;


