'use client'

import { useState, useEffect } from 'react'
import { Target, Plus, Pencil, Trash2, Save, X, CheckCircle } from 'lucide-react'

interface PerformanceTarget {
  id: string
  name: string
  excellentThreshold: number
  goodThreshold: number
  needsImprovementThreshold: number
  timePeriodWeeks: number
  isActive: boolean
  createdAt: string
}

export default function PerformanceTargets() {
  const [targets, setTargets] = useState<PerformanceTarget[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    excellentThreshold: '225',
    goodThreshold: '170',
    needsImprovementThreshold: '120',
    timePeriodWeeks: '12',
    isActive: false
  })

  useEffect(() => {
    fetchTargets()
  }, [])

  const fetchTargets = async () => {
    try {
      const response = await fetch('/api/targets')
      const data = await response.json()
      setTargets(data)
    } catch (error) {
      console.error('Error fetching targets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.excellentThreshold || !formData.goodThreshold || !formData.needsImprovementThreshold) {
      alert('All threshold fields are required')
      return
    }

    // Validate thresholds are in correct order
    const excellent = parseInt(formData.excellentThreshold)
    const good = parseInt(formData.goodThreshold)
    const needsImprovement = parseInt(formData.needsImprovementThreshold)

    if (excellent <= good || good <= needsImprovement) {
      alert('Thresholds must be in descending order: Excellent > Good > Needs Improvement')
      return
    }

    try {
      const url = editingId ? `/api/targets/${editingId}` : '/api/targets'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchTargets()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save target')
      }
    } catch (error) {
      console.error('Error saving target:', error)
      alert('Failed to save target')
    }
  }

  const handleEdit = (target: PerformanceTarget) => {
    setEditingId(target.id)
    setFormData({
      name: target.name,
      excellentThreshold: target.excellentThreshold.toString(),
      goodThreshold: target.goodThreshold.toString(),
      needsImprovementThreshold: target.needsImprovementThreshold.toString(),
      timePeriodWeeks: target.timePeriodWeeks.toString(),
      isActive: target.isActive
    })
    setShowAddForm(true)
  }

  const handleActivate = async (id: string) => {
    try {
      const response = await fetch(`/api/targets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true })
      })

      if (response.ok) {
        await fetchTargets()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to activate target')
      }
    } catch (error) {
      console.error('Error activating target:', error)
      alert('Failed to activate target')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      excellentThreshold: '225',
      goodThreshold: '170',
      needsImprovementThreshold: '120',
      timePeriodWeeks: '12',
      isActive: false
    })
    setEditingId(null)
    setShowAddForm(false)
  }

  const getPerformanceLevel = (score: number, target: PerformanceTarget): string => {
    if (score >= target.excellentThreshold) return 'Excellent'
    if (score >= target.goodThreshold) return 'Good'
    if (score >= target.needsImprovementThreshold) return 'Needs Improvement'
    return 'Unsatisfactory'
  }

  const getPerformanceColor = (level: string): string => {
    switch (level) {
      case 'Excellent': return 'bg-green-100 text-green-800'
      case 'Good': return 'bg-blue-100 text-blue-800'
      case 'Needs Improvement': return 'bg-yellow-100 text-yellow-800'
      case 'Unsatisfactory': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const activeTarget = targets.find(target => target.isActive)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Targets</h2>
          <p className="text-gray-600">Set score thresholds for different performance levels</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Target
        </button>
      </div>

      {/* Active Target Summary */}
      {activeTarget && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">Active Target: {activeTarget.name}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{activeTarget.excellentThreshold}+</div>
              <div className="text-green-100">Excellent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{activeTarget.goodThreshold}+</div>
              <div className="text-green-100">Good</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{activeTarget.needsImprovementThreshold}+</div>
              <div className="text-green-100">Needs Improvement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">&lt;{activeTarget.needsImprovementThreshold}</div>
              <div className="text-green-100">Unsatisfactory</div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit Target' : 'Add New Target'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Q1 2024 Target"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Period (Weeks) *
                </label>
                <input
                  type="number"
                  value={formData.timePeriodWeeks}
                  onChange={(e) => setFormData({ ...formData, timePeriodWeeks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="52"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excellent Threshold *
                </label>
                <input
                  type="number"
                  value={formData.excellentThreshold}
                  onChange={(e) => setFormData({ ...formData, excellentThreshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Good Threshold *
                </label>
                <input
                  type="number"
                  value={formData.goodThreshold}
                  onChange={(e) => setFormData({ ...formData, goodThreshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Needs Improvement Threshold *
                </label>
                <input
                  type="number"
                  value={formData.needsImprovementThreshold}
                  onChange={(e) => setFormData({ ...formData, needsImprovementThreshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Set as active target (will deactivate other targets)
              </label>
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
                {editingId ? 'Update' : 'Create'} Target
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Targets List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {targets.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Target className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Targets Set</h3>
            <p className="text-gray-600 mb-4">
              Create performance targets to get insights and track your progress.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Target
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {targets.map((target) => (
              <div key={target.id} className={`p-6 ${target.isActive ? 'bg-green-50 border-l-4 border-green-500' : 'hover:bg-gray-50'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{target.name}</h3>
                      {target.isActive && (
                        <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{target.excellentThreshold}+</div>
                        <div className="text-sm text-green-700">Excellent</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{target.goodThreshold}+</div>
                        <div className="text-sm text-blue-700">Good</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-lg font-bold text-yellow-600">{target.needsImprovementThreshold}+</div>
                        <div className="text-sm text-yellow-700">Needs Improvement</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-lg font-bold text-red-600">&lt;{target.needsImprovementThreshold}</div>
                        <div className="text-sm text-red-700">Unsatisfactory</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-2">
                      Time Period: {target.timePeriodWeeks} weeks
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {!target.isActive && (
                      <button
                        onClick={() => handleActivate(target.id)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(target)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
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