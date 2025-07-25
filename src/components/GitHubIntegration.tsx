'use client'

import { useState } from 'react'
import { Github, Star, GitFork, ExternalLink } from 'lucide-react'
import { GitHubProfile, Repository } from '@/types'
import { useMutation, useQuery } from 'react-query'
import toast from 'react-hot-toast'

export default function GitHubIntegration() {
  const [username, setUsername] = useState('')
  const [connectedProfile, setConnectedProfile] = useState<GitHubProfile | null>(null)

  const fetchProfileMutation = useMutation(
    async (username: string) => {
      const response = await fetch(`/api/github/${username}`)
      if (!response.ok) throw new Error('Failed to fetch GitHub profile')
      return response.json()
    },
    {
      onSuccess: (data) => {
        setConnectedProfile(data)
        toast.success('GitHub profile connected successfully!')
      },
      onError: () => {
        toast.error('Failed to fetch GitHub profile. Please check the username.')
      }
    }
  )

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    fetchProfileMutation.mutate(username.trim())
  }

  const disconnect = () => {
    setConnectedProfile(null)
    setUsername('')
    toast.success('GitHub profile disconnected')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">GitHub Integration</h2>
        <p className="text-gray-600">
          Connect your GitHub profile to showcase your projects and contributions
        </p>
      </div>

      {!connectedProfile ? (
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label htmlFor="github-username" className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Username
            </label>
            <input
              id="github-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your GitHub username"
              className="input-field"
              disabled={fetchProfileMutation.isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!username.trim() || fetchProfileMutation.isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fetchProfileMutation.isLoading ? (
              <div className="flex items-center justify-center">
                <div className="spinner mr-2"></div>
                Connecting...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Github className="w-4 h-4 mr-2" />
                Connect GitHub
              </div>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <img
              src={connectedProfile.avatar_url}
              alt={connectedProfile.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{connectedProfile.name}</h3>
              <p className="text-gray-600">@{connectedProfile.login}</p>
              {connectedProfile.bio && (
                <p className="text-gray-700 mt-1">{connectedProfile.bio}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span>{connectedProfile.public_repos} repositories</span>
                <span>{connectedProfile.followers} followers</span>
                <span>{connectedProfile.following} following</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <a
                href={connectedProfile.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button onClick={disconnect} className="btn-secondary">
                Disconnect
              </button>
            </div>
          </div>

          {/* Repositories */}
          {connectedProfile.repositories && connectedProfile.repositories.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Top Repositories</h4>
              <div className="grid gap-4 md:grid-cols-2">
                {connectedProfile.repositories.slice(0, 6).map((repo) => (
                  <div key={repo.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {repo.name}
                      </a>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                    {repo.description && (
                      <p className="text-gray-600 text-sm mb-3">{repo.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        {repo.language && (
                          <span className="flex items-center">
                            <span className="w-3 h-3 bg-primary-500 rounded-full mr-1"></span>
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          {repo.stargazers_count}
                        </span>
                        <span className="flex items-center">
                          <GitFork className="w-3 h-3 mr-1" />
                          {repo.forks_count}
                        </span>
                      </div>
                      <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 