'use client'

import { useState } from 'react'
import { Globe, Plus, ExternalLink, X, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

interface PortfolioItem {
  id: string
  title: string
  url: string
  description: string
  category: 'website' | 'project' | 'blog' | 'other'
}

export default function PortfolioManager() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'website' as PortfolioItem['category']
  })

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      description: '',
      category: 'website'
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error('Please provide both title and URL')
      return
    }

    // Simple URL validation
    try {
      new URL(formData.url)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    if (editingId) {
      // Update existing item
      setPortfolioItems(items =>
        items.map(item =>
          item.id === editingId
            ? {
                ...item,
                title: formData.title.trim(),
                url: formData.url.trim(),
                description: formData.description.trim(),
                category: formData.category
              }
            : item
        )
      )
      setEditingId(null)
      toast.success('Portfolio item updated!')
    } else {
      // Add new item
      const newItem: PortfolioItem = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        url: formData.url.trim(),
        description: formData.description.trim(),
        category: formData.category
      }
      setPortfolioItems([...portfolioItems, newItem])
      toast.success('Portfolio item added!')
    }

    resetForm()
    setIsAdding(false)
  }

  const handleEdit = (item: PortfolioItem) => {
    setFormData({
      title: item.title,
      url: item.url,
      description: item.description,
      category: item.category
    })
    setEditingId(item.id)
    setIsAdding(true)
  }

  const handleDelete = (id: string) => {
    setPortfolioItems(items => items.filter(item => item.id !== id))
    toast.success('Portfolio item removed!')
  }

  const handleCancel = () => {
    resetForm()
    setIsAdding(false)
    setEditingId(null)
  }

  const getCategoryIcon = (category: PortfolioItem['category']) => {
    switch (category) {
      case 'website':
        return '🌐'
      case 'project':
        return '💻'
      case 'blog':
        return '📝'
      default:
        return '🔗'
    }
  }

  const getCategoryColor = (category: PortfolioItem['category']) => {
    switch (category) {
      case 'website':
        return 'bg-blue-100 text-blue-800'
      case 'project':
        return 'bg-green-100 text-green-800'
      case 'blog':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Management</h2>
        <p className="text-gray-600">
          Add your portfolio websites, projects, and other professional links
        </p>
      </div>

      {/* Add Button */}
      {!isAdding && (
        <div className="text-center">
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Portfolio Item
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingId ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Personal Website, React Todo App"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                URL *
              </label>
              <input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as PortfolioItem['category'] })}
                className="input-field"
              >
                <option value="website">Website</option>
                <option value="project">Project</option>
                <option value="blog">Blog</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this portfolio item..."
                rows={3}
                className="input-field"
              />
            </div>

            <div className="flex space-x-3">
              <button type="submit" className="flex-1 btn-primary">
                {editingId ? 'Update Item' : 'Add Item'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Portfolio Items */}
      {portfolioItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Your Portfolio Items</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {portfolioItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(item.category)}</span>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-primary-600 p-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}`}>
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </span>
                  {item.description && (
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  )}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm break-all"
                  >
                    {item.url}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {portfolioItems.length === 0 && !isAdding && (
        <div className="text-center py-8">
          <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No portfolio items added yet</p>
          <p className="text-gray-500 text-sm">Add your websites, projects, and professional links</p>
        </div>
      )}
    </div>
  )
} 