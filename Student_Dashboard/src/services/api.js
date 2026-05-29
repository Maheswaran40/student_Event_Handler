import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user')
    if (user) {
      const token = JSON.parse(user).token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const EventUrl=import.meta.env.VITE_EVENT_API_URL
const ActivityUrl = import.meta.env.VITE_ACTIVITY_API_URL
// Mock data for demonstration
export const eventsService = {
 getAllEvents: async () => {
    try {
      const res = await axios.get(EventUrl);
      return res.data.data; //  important
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  },

  
  getEventById: async (id) => {
    try {
      const res = await axios.get(`EventUrl${id}`);
      return res.data.data;
    } catch (error) {
      console.error("Error fetching event:", error);
      return null;
    }
  },


  createEvent: async (eventData) => {
    try {
      let dataToSend;

      // 🔥 GET TOKEN
      const token = localStorage.getItem("token");

      // 🔥 check if file exists
      if (eventData.imageFile) {
        dataToSend = new FormData();

        dataToSend.append("title", eventData.title);
        dataToSend.append("description", eventData.description);
        dataToSend.append("date", eventData.date);
        dataToSend.append("venue", eventData.venue);
        dataToSend.append("incharge", eventData.incharge);
        dataToSend.append("maxParticipants", eventData.maxParticipants);
        dataToSend.append("status", eventData.status);
        dataToSend.append("gradientColor", eventData.gradientColor);
        dataToSend.append("tagline", eventData.tagline || "");
        dataToSend.append("image", eventData.imageFile);
      } else {
        dataToSend = eventData;
      }

      const res = await axios.post(EventUrl, dataToSend, {
        headers: {
          ...(eventData.imageFile && {
            "Content-Type": "multipart/form-data",
          }),
          
          // 🔥 ADD THIS LINE (MOST IMPORTANT)
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data.data;

    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },
  
    // UPDATE existing event
updateEvent: async (id, eventData) => {
  try {
    const token = localStorage.getItem("token");  

    const res = await axios.put(`${EventUrl}/${id}`, eventData, {
      headers: {
        Authorization: `Bearer ${token}`,  
      },
    });

    return res.data.data;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
},

  // DELETE event
  deleteEvent: async (id) => {
    try {
      const res = await axios.delete(`${EventUrl}/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },
   // Add this for checking registered students
  getEventStudents: async (eventId) => {
    try {
      const res = await axios.get(`${BaseUrl}/events/${eventId}/students`);
      return res.data;
    } catch (error) {
      console.error("Error fetching event students:", error);
      return { count: 0, students: [] };
    }
  },
  
   // GET event participants
  getEventParticipants: async (id) => {
    try {
      const res = await axios.get(`${EventUrl}/${id}/participants`);
      return res.data.data;
    } catch (error) {
      console.error("Error fetching participants:", error);
      return [];
    }
  },
  // GET events by status
  getEventsByStatus: async (status) => {
    try {
      const res = await axios.get(`${EventUrl}/status/${status}`);
      return res.data.data;
    } catch (error) {
      console.error(`Error fetching ${status} events:`, error);
      return [];
    }
  }
}



export const userService = {
  // Fixed version - no mock data
  getProfile: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/`)
      return response // Returns array of students
      
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error // Re-throw to handle in component
    }
  },
    getVolunteers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users?role=volunteer`)
      return response.data
    } catch (error) {
      console.error('Error fetching volunteers:', error)
      // Return empty array if endpoint doesn't exist yet
      return { data: [] }
    }
  },
  
 getUserProfile: async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found");
        return { success: false, user: null, error: "No token found" };
      }
      
      const response = await axios.get(`${API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("getUserProfile response:", response.data);
      
      return { 
        success: true, 
        user: response.data,
        data: response.data 
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return { 
        success: false, 
        user: null, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Get all users (for admin)
  getAllUsers: async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        return { success: false, users: [] };
      }
      
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("getAllUsers response:", response.data);
      
      // Handle different response structures
      const users = response.data.users || response.data || [];
      return { success: true, users: users };
    } catch (error) {
      console.error("Error fetching all users:", error);
      return { success: false, users: [], error: error.message };
    }
  },

  // Update user (for admin)
  updateUser: async (userId, userData) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // Delete user (for admin)
  deleteUser: async (userId) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.delete(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  getStudentById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching student:', error)
      throw error
    }
  },
  
  updateProfile: async (profileData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/students/${profileData.id}`, profileData)
      return response.data
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    }
  }
}
// services/api.js - Update your interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);



// scorecollection 
export const scoresService = {
  addOrUpdateScore: async (scoreData) => {
    const token = localStorage.getItem("token");

    const payload = {
      studentId: scoreData.studentId,
      eventId: scoreData.eventId,
      score: scoreData.score,
      remarks: scoreData.remarks || "",
    };

    const response = await axios.post(
      import.meta.env.VITE_ADDSCORE_API_URL,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  },
  // Get all scores for a specific event
  getScoresByEvent: async (eventId) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${API_BASE_URL}/score/event/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  },
   // Get single score by ID
  getScoreById: async (scoreId) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${API_BASE_URL}/score/${scoreId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  },
   updateScore: async (scoreId, scoreData) => {
    const token = localStorage.getItem("token");

    const payload = {
      score: scoreData.score,
      remarks: scoreData.remarks || "",
    };

    const response = await axios.put(
      `${API_BASE_URL}/score/update-score/${scoreId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  },
   // Delete score by ID
  deleteScore: async (scoreId) => {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
      `${API_BASE_URL}/score/delete-score/${scoreId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  },
  // Get scores by student
  getScoresByStudent: async (studentId) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${API_BASE_URL}/scores/student/${studentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  },
  // Get leaderboard for an event
  getLeaderboard: async (eventId, limit = 10) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${API_BASE_URL}/scores/leaderboard/${eventId}?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  },
   // Bulk add scores
  bulkAddScores: async (scoresArray) => {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_BASE_URL}/score/bulk-add-scores`,
      { scores: scoresArray },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  },
  // Get top scorers across all events
  getTopScorers: async (limit = 10) => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${API_BASE_URL}/scores/top-scorers?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  },
};


export default api