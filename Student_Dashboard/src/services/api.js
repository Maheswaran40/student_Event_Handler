import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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

const EventUrl="http://localhost:5000/api/events"
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
  
  // createEvent: async (eventData) => {
  //   // Simulate API call
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve({ ...eventData, id: Date.now() })
  //     }, 500)
  //   })
  // },
  // createEvent: async (eventData) => {
  //   try {
  //     const res = await axios.post(EventUrl, eventData);
  //     console.log("event creted",res)
  //     return res.data.data; // Returns the created event
  //   } catch (error) {
  //     console.error("Error creating event:", error);
  //     throw error; // Throw error so component can handle it
  //   }
  // },
  createEvent: async (eventData) => {
    try {
      let dataToSend;

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

        //  file
        dataToSend.append("image", eventData.imageFile);
      } else {
        // normal JSON (no image case)
        dataToSend = eventData;
      }

      const res = await axios.post(EventUrl, dataToSend, {
        headers: eventData.imageFile
          ? { "Content-Type": "multipart/form-data" }
          : {},
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
      const res = await axios.put(`${EventUrl}/${id}`, eventData);
      return res.data.data; // Returns the updated event
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  // DELETE event
  deleteEvent: async (id) => {
    try {
      const res = await axios.delete(`${EventUrl}/${id}`);
      return res.data; // Returns success message or deleted event
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
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

// export const userService = {
//   getProfile: async () => {
//     const user = await axios.get("http://localhost:5000/api/students/")
//     return user.data;
//     if (user) {
//       return JSON.parse(user)
//     }
//     throw new Error('No user found')
//   },
  
//   updateProfile: async (profileData) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve(profileData)
//       }, 500)
//     })
//   }
// }

export const userService = {
  // Fixed version - no mock data
  getProfile: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/`)
      return response.data.data // Returns array of students
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error // Re-throw to handle in component
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

export default api