'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import { getDimensionLabel, getDimensionColor } from '@/lib/utils'

interface Category {
  id: string
  name: string
  scorePerOccurrence: number
  dimension: string
  description?: string
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    scorePerOccurrence: '',
    dimension: 'input',
    description: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.scorePerOccurrence || !formData.dimension) {
      alert('Name, score, and dimension are required')
      return
    }

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchCategories()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Failed to save category')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      scorePerOccurrence: category.scorePerOccurrence.toString(),
      dimension: category.dimension,
      description: category.description || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all associated logs.')) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCategories()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', scorePerOccurrence: '', dimension: 'input', description: '' })
    setEditingId(null)
    setShowAddForm(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Categories</h2>
          <p className="text-gray-600">Define categories of work and their point values</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit Category' : 'Add New Category'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Code Reviews"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points per Occurrence *
                </label>
                <input
                  type="number"
                  value={formData.scorePerOccurrence}
                  onChange={(e) => setFormData({ ...formData, scorePerOccurrence: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 5"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimension *
                </label>
                <select
                  value={formData.dimension}
                  onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="input">Input</option>
                  <option value="output">Output</option>
                  <option value="outcome">Outcome</option>
                  <option value="impact">Impact</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe what this category includes..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Update' : 'Create'} Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first work category to start tracking your performance.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Category
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {categories.map((category) => (
              <div key={category.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <span className={`ml-3 px-2 py-1 text-sm font-medium rounded-full ${getDimensionColor(category.dimension)}`}>
                        {getDimensionLabel(category.dimension)}
                      </span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {category.scorePerOccurrence} pts
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-gray-600 mt-1">{category.description}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 