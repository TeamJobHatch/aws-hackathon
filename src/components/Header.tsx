'use client'

import { useState } from 'react'
import { Menu, X, Briefcase } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">JobHatch AI</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
              Dashboard
            </a>
            <a href="#chat" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
              AI Assistant
            </a>
            <a href="#portfolio" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
              Portfolio
            </a>
            <a href="#applications" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
              Applications
            </a>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#dashboard" className="block text-gray-700 hover:text-primary-600 px-3 py-2 text-base font-medium">
                Dashboard
              </a>
              <a href="#chat" className="block text-gray-700 hover:text-primary-600 px-3 py-2 text-base font-medium">
                AI Assistant
              </a>
              <a href="#portfolio" className="block text-gray-700 hover:text-primary-600 px-3 py-2 text-base font-medium">
                Portfolio
              </a>
              <a href="#applications" className="block text-gray-700 hover:text-primary-600 px-3 py-2 text-base font-medium">
                Applications
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 