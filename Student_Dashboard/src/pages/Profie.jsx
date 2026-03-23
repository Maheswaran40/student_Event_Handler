import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiEdit2, 
  FiSave, 
  FiX, 
  FiCalendar,
  FiGlobe,
  FiBriefcase,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiCamera,
  FiClock,
  FiAward,
  FiHeart
} from 'react-icons/fi'
import { userService } from '../services/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    occupation: '',
    website: '',
    github: '',
    twitter: '',
    linkedin: '',
    avatar: '',
    joinDate: '',
    eventsAttended: 0,
    interests: []
  })

  const [formErrors, setFormErrors] = useState({})
  const [activeTab, setActiveTab] = useState('personal')

  useEffect(() => {
    if (user) {
      // Load saved profile data from localStorage or use defaults
      const savedProfile = localStorage.getItem('userProfile')
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      } else {
        setProfile({
          ...profile,
          name: user.name || '',
          email: user.email || '',
          joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          eventsAttended: 5,
          interests: ['Technology', 'Networking', 'Workshops']
        })
      }
    }
  }, [user])

  const validateForm = () => {
    const errors = {}
    if (!profile.name.trim()) errors.name = 'Name is required'
    if (!profile.email.trim()) errors.email = 'Email is required'
    if (profile.email && !/\S+@\S+\.\S+/.test(profile.email)) errors.email = 'Email is invalid'
    if (profile.phone && !/^\+?[\d\s-]{10,}$/.test(profile.phone)) errors.phone = 'Phone number is invalid'
    if (profile.website && !/^https?:\/\/.+\..+/.test(profile.website)) errors.website = 'Website URL is invalid'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleInterestChange = (interest) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      setUploadingPhoto(true)
      try {
        // Convert to base64 for demo (in real app, upload to server)
        const reader = new FileReader()
        reader.onloadend = () => {
          setProfile(prev => ({
            ...prev,
            avatar: reader.result
          }))
          toast.success('Profile photo updated successfully!')
        }
        reader.readAsDataURL(file)
      } catch (error) {
        toast.error('Failed to upload photo')
      } finally {
        setUploadingPhoto(false)
      }
    }
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)
    try {
      // Save to localStorage
      localStorage.setItem('userProfile', JSON.stringify(profile))
      
      // Update user in AuthContext
      const updatedUser = { ...user, ...profile }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Simulate API call
      await userService.updateProfile(profile)
      
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    } else {
      setProfile({
        ...profile,
        name: user?.name || '',
        email: user?.email || '',
      })
    }
    setFormErrors({})
    setIsEditing(false)
  }

  const availableInterests = [
    'Technology', 'Music', 'Art', 'Sports', 'Business', 'Networking',
    'Workshops', 'Conferences', 'Social Events', 'Charity', 'Education',
    'Entertainment', 'Food & Drink', 'Travel', 'Photography'
  ]

  const stats = [
    { icon: FiCalendar, label: 'Member Since', value: profile.joinDate },
    { icon: FiClock, label: 'Events Attended', value: profile.eventsAttended },
    { icon: FiAward, label: 'Badges Earned', value: '3' },
    { icon: FiHeart, label: 'Interests', value: profile.interests.length }
  ]

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: FiUser },
    { id: 'social', label: 'Social Links', icon: FiGlobe },
    { id: 'interests', label: 'Interests', icon: FiHeart }
  ]

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your account settings and preferences</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary flex items-center space-x-2 px-6 py-2.5"
              >
                <FiEdit2 />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="btn-secondary flex items-center space-x-2 px-6 py-2.5"
                >
                  <FiX />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2 px-6 py-2.5"
                >
                  <FiSave />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Profile Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  </div>
                  <div className="bg-primary-100 p-3 rounded-full">
                    <stat.icon className="text-primary-600 text-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Profile Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Cover Photo */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-32 relative">
              {isEditing && (
                <button className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                  Change Cover
                </button>
              )}
            </div>
            
            {/* Profile Photo and Info */}
            <div className="px-8 pb-8 relative">
              <div className="flex justify-between items-end -mt-16 mb-6 flex-wrap gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                    {profile.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <FiUser className="text-4xl text-primary-600" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                      <FiCamera className="text-sm" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                      />
                    </label>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                
                {!isEditing && (
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
                    <p className="text-gray-600">{profile.occupation || 'Event Enthusiast'}</p>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-8">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-3 px-1 flex items-center space-x-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-b-2 border-primary-600 text-primary-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="animate-fade-in">
                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`input-field pl-10 ${!isEditing && 'bg-gray-50'} ${formErrors.name && 'border-red-500 focus:ring-red-500'}`}
                          />
                        </div>
                        {formErrors.name && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`input-field pl-10 ${!isEditing && 'bg-gray-50'} ${formErrors.email && 'border-red-500 focus:ring-red-500'}`}
                          />
                        </div>
                        {formErrors.email && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`input-field pl-10 ${!isEditing && 'bg-gray-50'} ${formErrors.phone && 'border-red-500 focus:ring-red-500'}`}
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                        {formErrors.phone && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <div className="relative">
                          <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="location"
                            value={profile.location}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`input-field pl-10 ${!isEditing && 'bg-gray-50'}`}
                            placeholder="City, Country"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Occupation
                        </label>
                        <div className="relative">
                          <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="occupation"
                            value={profile.occupation}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`input-field pl-10 ${!isEditing && 'bg-gray-50'}`}
                            placeholder="Software Developer, Designer, etc."
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={profile.bio}
                          onChange={handleChange}
                          disabled={!isEditing}
                          rows="4"
                          className={`input-field ${!isEditing && 'bg-gray-50'}`}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'social' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <div className="relative">
                          <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="url"
                            name="website"
                            value={profile.website}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`input-field pl-10 ${!isEditing && 'bg-gray-50'} ${formErrors.website && 'border-red-500'}`}
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                        {formErrors.website && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.website}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GitHub
                        </label>
                        <div className="relative">
                          <FiGithub className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="github"
                            value={profile.github}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`input-field pl-10 ${!isEditing && 'bg-gray-50'}`}
                            placeholder="username"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Twitter
                        </label>
                        <div className="relative">
                          <FiTwitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="twitter"
                            value={profile.twitter}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`input-field pl-10 ${!isEditing && 'bg-gray-50'}`}
                            placeholder="@username"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LinkedIn
                        </label>
                        <div className="relative">
                          <FiLinkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="linkedin"
                            value={profile.linkedin}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`input-field pl-10 ${!isEditing && 'bg-gray-50'}`}
                            placeholder="profile-url"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'interests' && (
                  <div className="space-y-6">
                    {isEditing ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Select your interests
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {availableInterests.map(interest => (
                            <button
                              key={interest}
                              onClick={() => handleInterestChange(interest)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                profile.interests.includes(interest)
                                  ? 'bg-primary-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {interest}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Interests</h3>
                        {profile.interests.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {profile.interests.map(interest => (
                              <span
                                key={interest}
                                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No interests selected yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          {!isEditing && (
            <div className="mt-8 bg-red-50 rounded-xl border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
              <p className="text-red-600 text-sm mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    toast.error('Account deletion is not implemented in demo')
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile