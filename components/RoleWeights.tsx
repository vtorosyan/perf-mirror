'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Save, X, CheckCircle, RotateCcw } from 'lucide-react'

interface RoleWeights {
  id: string
  name: string
  inputWeight: number
  outputWeight: number
  outcomeWeight: number
  impactWeight: number
  isActive: boolean
  createdAt: string
}

export default function RoleWeights() {
  const [weights, setWeights] = useState<RoleWeights[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    inputWeight: '0.25',
    outputWeight: '0.35',
    outcomeWeight: '0.25',
    impactWeight: '0.15',
    isActive: false
  })

  useEffect(() => {
    fetchWeights()
    initializeDefaultWeights()
  }, [])

  const initializeDefaultWeights = async () => {
    try {
      await fetch('/api/role-weights/init', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error initializing default weights:', error)
    }
  }

  const fetchWeights = async () => {
    try {
      const response = await fetch('/api/role-weights')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setWeights(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching role weights:', error)
      setWeights([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      alert('Role name is required')
      return
    }

    // Validate weights sum to 1.0
    const total = parseFloat(formData.inputWeight) + parseFloat(formData.outputWeight) + 
                  parseFloat(formData.outcomeWeight) + parseFloat(formData.impactWeight)
    
    if (Math.abs(total - 1.0) > 0.001) {
      alert('Weights must sum to 1.0')
      return
    }

    try {
      const url = editingId ? `/api/role-weights/${editingId}` : '/api/role-weights'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchWeights()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save role weights')
      }
    } catch (error) {
      console.error('Error saving role weights:', error)
      alert('Failed to save role weights')
    }
  }

  const handleEdit = (roleWeights: RoleWeights) => {
    setEditingId(roleWeights.id)
    setFormData({
      name: roleWeights.name,
      inputWeight: roleWeights.inputWeight.toString(),
      outputWeight: roleWeights.outputWeight.toString(),
      outcomeWeight: roleWeights.outcomeWeight.toString(),
      impactWeight: roleWeights.impactWeight.toString(),
      isActive: roleWeights.isActive
    })
    setShowAddForm(true)
  }

  const handleActivate = async (id: string) => {
    try {
      const response = await fetch(`/api/role-weights/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true })
      })

      if (response.ok) {
        await fetchWeights()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to activate role weights')
      }
    } catch (error) {
      console.error('Error activating role weights:', error)
      alert('Failed to activate role weights')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      inputWeight: '0.25',
      outputWeight: '0.35',
      outcomeWeight: '0.25',
      impactWeight: '0.15',
      isActive: false
    })
    setEditingId(null)
    setShowAddForm(false)
  }

  const normalizeWeights = () => {
    const total = parseFloat(formData.inputWeight) + parseFloat(formData.outputWeight) + 
                  parseFloat(formData.outcomeWeight) + parseFloat(formData.impactWeight)
    
    if (total > 0) {
      setFormData({
        ...formData,
        inputWeight: (parseFloat(formData.inputWeight) / total).toFixed(3),
        outputWeight: (parseFloat(formData.outputWeight) / total).toFixed(3),
        outcomeWeight: (parseFloat(formData.outcomeWeight) / total).toFixed(3),
        impactWeight: (parseFloat(formData.impactWeight) / total).toFixed(3)
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const activeWeights = weights && weights.length > 0 ? weights.find(weight => weight.isActive) : null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Weights</h2>
          <p className="text-gray-600">Configure dimension weights based on role and responsibilities</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Role
        </button>
      </div>

      {/* Active Weights Summary */}
      {activeWeights && (
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">Active Role: {activeWeights.name}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{(activeWeights.inputWeight * 100).toFixed(0)}%</div>
              <div className="text-purple-100">Input</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(activeWeights.outputWeight * 100).toFixed(0)}%</div>
              <div className="text-purple-100">Output</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(activeWeights.outcomeWeight * 100).toFixed(0)}%</div>
              <div className="text-purple-100">Outcome</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(activeWeights.impactWeight * 100).toFixed(0)}%</div>
              <div className="text-purple-100">Impact</div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit Role Weights' : 'Add New Role Weights'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Custom Manager Role"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Dimension Weights * (must sum to 1.0)
                </label>
                <button
                  type="button"
                  onClick={normalizeWeights}
                  className="flex items-center px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Normalize
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Input</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={formData.inputWeight}
                    onChange={(e) => setFormData({ ...formData, inputWeight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Output</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={formData.outputWeight}
                    onChange={(e) => setFormData({ ...formData, outputWeight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Outcome</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={formData.outcomeWeight}
                    onChange={(e) => setFormData({ ...formData, outcomeWeight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Impact</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={formData.impactWeight}
                    onChange={(e) => setFormData({ ...formData, impactWeight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                Current total: {(
                  parseFloat(formData.inputWeight || '0') + 
                  parseFloat(formData.outputWeight || '0') + 
                  parseFloat(formData.outcomeWeight || '0') + 
                  parseFloat(formData.impactWeight || '0')
                ).toFixed(3)}
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
                Set as active role weights (will deactivate others)
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
                {editingId ? 'Update' : 'Create'} Role
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Role Weights List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {weights.map((roleWeights) => (
            <div key={roleWeights.id} className={`p-6 ${roleWeights.isActive ? 'bg-purple-50 border-l-4 border-purple-500' : 'hover:bg-gray-50'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{roleWeights.name}</h3>
                    {roleWeights.isActive && (
                      <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{(roleWeights.inputWeight * 100).toFixed(0)}%</div>
                      <div className="text-sm text-blue-700">Input</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{(roleWeights.outputWeight * 100).toFixed(0)}%</div>
                      <div className="text-sm text-green-700">Output</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{(roleWeights.outcomeWeight * 100).toFixed(0)}%</div>
                      <div className="text-sm text-purple-700">Outcome</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">{(roleWeights.impactWeight * 100).toFixed(0)}%</div>
                      <div className="text-sm text-orange-700">Impact</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {!roleWeights.isActive && (
                    <button
                      onClick={() => handleActivate(roleWeights.id)}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      Activate
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(roleWeights)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 