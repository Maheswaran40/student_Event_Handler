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
      return res.data.data; // 👈 important
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
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...eventData, id: Date.now() })
      }, 500)
    })
  },
  
  updateEvent: async (id, eventData) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...eventData, id })
      }, 500)
    })
  },
  
  deleteEvent: async (id) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  }
}

export const userService = {
  getProfile: async () => {
    const user = localStorage.getItem('user')
    if (user) {
      return JSON.parse(user)
    }
    throw new Error('No user found')
  },
  
  updateProfile: async (profileData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(profileData)
      }, 500)
    })
  }
}

export default api