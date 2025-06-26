'use client'

import { useState, useEffect } from 'react'
import { Target, Plus, Pencil, Trash2, Save, X, CheckCircle } from 'lucide-react'

interface PerformanceTarget {
  id: string
  name: string
  role?: string
  level?: number
  outstandingThreshold: number
  strongThreshold: number
  meetingThreshold: number
  partialThreshold: number
  underperformingThreshold: number
  timePeriodWeeks: number
  isActive: boolean
  createdAt: string
}

interface PerformanceTargetsProps {
  onDataChange?: () => void
}

export default function PerformanceTargets({ onDataChange }: PerformanceTargetsProps) {
  const [targets, setTargets] = useState<PerformanceTarget[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    level: '',
    outstandingThreshold: '300',
    strongThreshold: '230',
    meetingThreshold: '170',
    partialThreshold: '140', 
    underperformingThreshold: '120',
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
    
    if (!formData.name || !formData.role || !formData.outstandingThreshold || !formData.strongThreshold || 
        !formData.meetingThreshold || !formData.partialThreshold || !formData.underperformingThreshold) {
      alert('Name, role, and all threshold fields are required')
      return
    }

    // Validate thresholds are in correct order
    const outstanding = parseInt(formData.outstandingThreshold)
    const strong = parseInt(formData.strongThreshold)
    const meeting = parseInt(formData.meetingThreshold)
    const partial = parseInt(formData.partialThreshold)
    const underperforming = parseInt(formData.underperformingThreshold)

    if (outstanding <= strong || strong <= meeting || meeting <= partial || partial <= underperforming) {
      alert('Thresholds must be in descending order: Outstanding > Strong > Meeting > Partial > Underperforming')
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
        
        // Notify parent component that data has changed
        if (onDataChange) {
          onDataChange()
        }
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
      role: target.role || '',
      level: target.level ? target.level.toString() : '',
      outstandingThreshold: target.outstandingThreshold.toString(),
      strongThreshold: target.strongThreshold.toString(),
      meetingThreshold: target.meetingThreshold.toString(),
      partialThreshold: target.partialThreshold.toString(),
      underperformingThreshold: target.underperformingThreshold.toString(),
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
        
        // Notify parent component that data has changed
        if (onDataChange) {
          onDataChange()
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to activate target')
      }
    } catch (error) {
      console.error('Error activating target:', error)
      alert('Failed to activate target')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this target? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/targets/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTargets()
        
        // Notify parent component that data has changed
        if (onDataChange) {
          onDataChange()
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete target')
      }
    } catch (error) {
      console.error('Error deleting target:', error)
      alert('Failed to delete target')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      level: '',
      outstandingThreshold: '300',
      strongThreshold: '230',
      meetingThreshold: '170',
      partialThreshold: '140',
      underperformingThreshold: '120',
      timePeriodWeeks: '12',
      isActive: false
    })
    setEditingId(null)
    setShowAddForm(false)
  }

  const getPerformanceLevel = (score: number, target: PerformanceTarget): string => {
    if (score >= target.outstandingThreshold) return 'Outstanding'
    if (score >= target.strongThreshold) return 'Strong Performance'
    if (score >= target.meetingThreshold) return 'Meeting Expectations'
    if (score >= target.partialThreshold) return 'Partially Meeting Expectations'
    return 'Underperforming'
  }

  const getPerformanceColor = (level: string): string => {
    switch (level) {
      case 'Outstanding': return 'bg-green-100 text-green-800 border-green-300'
      case 'Strong Performance': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Meeting Expectations': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'Partially Meeting Expectations': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Underperforming': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
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
          <p className="text-gray-600">Set score thresholds for all 5 performance evaluation bands</p>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">{activeTarget.outstandingThreshold}+</div>
              <div className="text-green-100">Outstanding</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{activeTarget.strongThreshold}+</div>
              <div className="text-green-100">Strong Performance</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{activeTarget.meetingThreshold}+</div>
              <div className="text-green-100">Meeting Expectations</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{activeTarget.partialThreshold}+</div>
              <div className="text-green-100">Partially Meeting</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">&lt;{activeTarget.partialThreshold}</div>
              <div className="text-green-100">Underperforming</div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, level: e.target.value === 'Manager' ? '4' : '1' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Role</option>
                  <option value="IC">Individual Contributor (IC)</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level (Optional)
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  disabled={!formData.role}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">All Levels</option>
                  {formData.role === 'IC' && Array.from({ length: 8 }, (_, i) => i + 1).map(level => (
                    <option key={level} value={level}>Level {level}</option>
                  ))}
                  {formData.role === 'Manager' && Array.from({ length: 5 }, (_, i) => i + 4).map(level => (
                    <option key={level} value={level}>Level {level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outstanding Threshold *
                </label>
                <input
                  type="number"
                  value={formData.outstandingThreshold}
                  onChange={(e) => setFormData({ ...formData, outstandingThreshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strong Performance *
                </label>
                <input
                  type="number"
                  value={formData.strongThreshold}
                  onChange={(e) => setFormData({ ...formData, strongThreshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Expectations *
                </label>
                <input
                  type="number"
                  value={formData.meetingThreshold}
                  onChange={(e) => setFormData({ ...formData, meetingThreshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partially Meeting *
                </label>
                <input
                  type="number"
                  value={formData.partialThreshold}
                  onChange={(e) => setFormData({ ...formData, partialThreshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Underperforming *
                </label>
                <input
                  type="number"
                  value={formData.underperformingThreshold}
                  onChange={(e) => setFormData({ ...formData, underperformingThreshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Thresholds must be in descending order. Scores below the Underperforming threshold will be classified as "Underperforming".
              </p>
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
              Create performance targets with all 5 evaluation bands to track your progress.
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-3">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-sm font-bold text-green-600">{target.outstandingThreshold}+</div>
                        <div className="text-xs text-green-700">Outstanding</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-bold text-blue-600">{target.strongThreshold}+</div>
                        <div className="text-xs text-blue-700">Strong Performance</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-bold text-gray-600">{target.meetingThreshold}+</div>
                        <div className="text-xs text-gray-700">Meeting Expectations</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-sm font-bold text-yellow-600">{target.partialThreshold}+</div>
                        <div className="text-xs text-yellow-700">Partially Meeting</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-sm font-bold text-red-600">&lt;{target.partialThreshold}</div>
                        <div className="text-xs text-red-700">Underperforming</div>
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
                    {!target.isActive && (
                      <button
                        onClick={() => handleDelete(target.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Band Guide */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Evaluation Bands</h3>
        <div className="space-y-2">
          {[
            { band: 'Outstanding', description: 'Significantly exceeding all expectations (>150% baseline)' },
            { band: 'Strong Performance', description: 'Exceeding expectations in most areas (115-150% baseline)' },
            { band: 'Meeting Expectations', description: 'Meeting all baseline expectations (85-115% baseline)' },
            { band: 'Partially Meeting Expectations', description: 'Meeting some but not all expectations (70-85% baseline)' },
            { band: 'Underperforming', description: 'Below expected performance levels (<70% baseline)' }
          ].map(({ band, description }) => (
            <div key={band} className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPerformanceColor(band)}`}>
                {band}
              </span>
              <span className="text-gray-600 text-sm">{description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 