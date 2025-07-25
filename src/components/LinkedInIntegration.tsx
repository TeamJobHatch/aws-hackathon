'use client'

import { useState } from 'react'
import { Linkedin, User, Briefcase, ExternalLink } from 'lucide-react'
import { LinkedInProfile } from '@/types'
import toast from 'react-hot-toast'

export default function LinkedInIntegration() {
  const [profile, setProfile] = useState<LinkedInProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    publicProfileUrl: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Please provide at least your first and last name')
      return
    }

    const newProfile: LinkedInProfile = {
      id: Date.now().toString(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      headline: formData.headline.trim() || undefined,
      publicProfileUrl: formData.publicProfileUrl.trim() || undefined
    }

    setProfile(newProfile)
    setIsEditing(false)
    toast.success('LinkedIn profile information saved!')
  }

  const handleEdit = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        headline: profile.headline || '',
        publicProfileUrl: profile.publicProfileUrl || ''
      })
    }
    setIsEditing(true)
  }

  const handleDisconnect = () => {
    setProfile(null)
    setFormData({
      firstName: '',
      lastName: '',
      headline: '',
      publicProfileUrl: ''
    })
    setIsEditing(false)
    toast.success('LinkedIn profile information cleared')
  }

  if (!profile && !isEditing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">LinkedIn Integration</h2>
          <p className="text-gray-600">
            Add your LinkedIn profile information to enhance your job applications
          </p>
        </div>

        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <Linkedin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <p className="text-blue-800 font-medium mb-2">LinkedIn API Integration</p>
            <p className="text-blue-700 text-sm">
              Due to LinkedIn API restrictions, please manually enter your profile information below.
              This will be used to enhance your job application materials.
            </p>
          </div>
          
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary"
          >
            <User className="w-4 h-4 mr-2" />
            Add LinkedIn Information
          </button>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">LinkedIn Profile Information</h2>
          <p className="text-gray-600">
            Enter your LinkedIn profile details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">
              Professional Headline
            </label>
            <input
              id="headline"
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="e.g., Full Stack Developer | React | Node.js"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="profileUrl" className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn Profile URL
            </label>
            <input
              id="profileUrl"
              type="url"
              value={formData.publicProfileUrl}
              onChange={(e) => setFormData({ ...formData, publicProfileUrl: e.target.value })}
              placeholder="https://linkedin.com/in/yourprofile"
              className="input-field"
            />
          </div>

          <div className="flex space-x-3">
            <button type="submit" className="flex-1 btn-primary">
              Save Profile Information
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false)
                if (!profile) {
                  setFormData({
                    firstName: '',
                    lastName: '',
                    headline: '',
                    publicProfileUrl: ''
                  })
                }
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">LinkedIn Profile</h2>
        <p className="text-gray-600">
          Your LinkedIn information for job applications
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h3>
              {profile.headline && (
                <p className="text-gray-600">{profile.headline}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {profile.publicProfileUrl && (
              <a
                href={profile.publicProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button onClick={handleEdit} className="btn-secondary">
              Edit
            </button>
            <button onClick={handleDisconnect} className="btn-secondary">
              Clear
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Name:</span>
            <span className="ml-2 text-gray-900">{profile.firstName} {profile.lastName}</span>
          </div>
          {profile.headline && (
            <div>
              <span className="font-medium text-gray-700">Headline:</span>
              <span className="ml-2 text-gray-900">{profile.headline}</span>
            </div>
          )}
          {profile.publicProfileUrl && (
            <div className="md:col-span-2">
              <span className="font-medium text-gray-700">Profile URL:</span>
              <a
                href={profile.publicProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary-600 hover:text-primary-700"
              >
                {profile.publicProfileUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 