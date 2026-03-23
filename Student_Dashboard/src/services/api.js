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

// Mock data for demonstration
export const eventsService = {
  getAllEvents: async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            title: 'Tech Conference 2024',
            date: '2024-03-15',
            time: '10:00 AM',
            location: 'Convention Center, NYC',
            description: 'Annual technology conference featuring top industry speakers',
            attendees: 150,
            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
            category: 'Technology'
          },
          {
            id: 2,
            title: 'Music Festival',
            date: '2024-04-20',
            time: '2:00 PM',
            location: 'Central Park, NYC',
            description: 'Outdoor music festival with multiple artists',
            attendees: 500,
            image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
            category: 'Music'
          },
          {
            id: 3,
            title: 'Business Networking',
            date: '2024-03-25',
            time: '6:00 PM',
            location: 'Downtown Hotel, NYC',
            description: 'Network with business professionals',
            attendees: 80,
            image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72',
            category: 'Business'
          }
        ])
      }, 500)
    })
  },
  
  getEventById: async (id) => {
    const events = await eventsService.getAllEvents()
    return events.find(event => event.id === parseInt(id))
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