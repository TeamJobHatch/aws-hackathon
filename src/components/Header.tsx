'use client'

import { useState } from 'react'
import { Menu, X, Users, Target } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">RecruitAI</span>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              HR Suite
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#job-description" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Job Positions
            </a>
            <a href="#resume-analysis" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Resume Analysis
            </a>
            <a href="#github" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Developer Screening
            </a>
            <a href="#analytics" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Analytics
            </a>
          </nav>

          {/* User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700">HR Manager</span>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">HR</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#job-description" className="block text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium">
                Job Positions
              </a>
              <a href="#resume-analysis" className="block text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium">
                Resume Analysis
              </a>
              <a href="#github" className="block text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium">
                Developer Screening
              </a>
              <a href="#analytics" className="block text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium">
                Analytics
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 