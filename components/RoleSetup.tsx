'use client'

import { useState, useEffect } from 'react'
import { User, Target, CheckCircle, AlertCircle, Plus, Settings, Edit3, Save, X, Trash2 } from 'lucide-react'

interface UserProfile {
  id: string
  role: string
  level: number
  isActive: boolean
}

interface LevelExpectation {
  id: string
  role: string
  level: number
  expectations: string
}

interface CategoryTemplate {
  id: string
  role: string
  level: number
  categoryName: string
  dimension: string
  scorePerOccurrence: number
  expectedWeeklyCount: number
  description?: string
}

interface RoleSetupProps {
  onDataChange?: () => void
  onRoleSetup?: (profile: UserProfile) => void
}

export default function RoleSetup({ onDataChange, onRoleSetup }: RoleSetupProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<number>(1)
  const [levelExpectations, setLevelExpectations] = useState<string[]>([])
  const [categoryTemplates, setCategoryTemplates] = useState<CategoryTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPrefillConfirm, setShowPrefillConfirm] = useState(false)
  
  // New state for editing expectations
  const [editingExpectations, setEditingExpectations] = useState(false)
  const [editableExpectations, setEditableExpectations] = useState<string[]>([])
  const [newExpectation, setNewExpectation] = useState('')
  const [savingExpectations, setSavingExpectations] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  useEffect(() => {
    if (selectedRole && selectedLevel) {
      fetchLevelData()
    }
  }, [selectedRole, selectedLevel])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user-profile')
      const profile = await response.json()
      
      if (profile && profile.id) {
        setUserProfile(profile)
        setSelectedRole(profile.role)
        setSelectedLevel(profile.level)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLevelData = async () => {
    try {
      const [expectationsResponse, templatesResponse] = await Promise.all([
        fetch(`/api/level-expectations?role=${selectedRole}&level=${selectedLevel}`),
        fetch(`/api/category-templates?role=${selectedRole}&level=${selectedLevel}`)
      ])

      const expectationsData = await expectationsResponse.json()
      const templatesData = await templatesResponse.json()

      if (expectationsData && expectationsData.expectations) {
        setLevelExpectations(JSON.parse(expectationsData.expectations))
      } else {
        setLevelExpectations([])
      }

      setCategoryTemplates(Array.isArray(templatesData) ? templatesData : [])
    } catch (error) {
      console.error('Error fetching level data:', error)
      setLevelExpectations([])
      setCategoryTemplates([])
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          level: selectedLevel
        })
      })

      if (response.ok) {
        const newProfile = await response.json()
        setUserProfile(newProfile)
        if (onRoleSetup) {
          onRoleSetup(newProfile)
        }
        
        // Check if there are templates to prefill
        if (categoryTemplates.length > 0) {
          setShowPrefillConfirm(true)
        }
      } else {
        const error = await response.json()
        alert(`Failed to save profile: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving user profile:', error)
      alert('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePrefillCategories = async () => {
    try {
      // First, create categories from templates
      const categoryPromises = categoryTemplates.map(template =>
        fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: template.categoryName,
            scorePerOccurrence: template.scorePerOccurrence,
            dimension: template.dimension,
            description: template.description
          })
        })
      )

      await Promise.all(categoryPromises)
      
      if (onDataChange) {
        onDataChange()
      }
      
      setShowPrefillConfirm(false)
      alert('Categories have been prefilled based on your role and level!')
    } catch (error) {
      console.error('Error prefilling categories:', error)
      alert('Failed to prefill categories')
    }
  }

  const getLevelOptions = () => {
    if (selectedRole === 'IC') {
      return Array.from({ length: 8 }, (_, i) => i + 1)
    } else if (selectedRole === 'Manager') {
      return Array.from({ length: 5 }, (_, i) => i + 4) // L4-L8
    }
    return []
  }

  const getPerformanceBand = (actualScore: number, expectedScore: number): string => {
    if (actualScore === 0 && expectedScore === 0) return 'No Data'
    if (actualScore === 0) return 'No Activity'
    
    const percentage = (actualScore / expectedScore) * 100
    
    if (percentage < 70) return 'Underperforming'
    if (percentage < 85) return 'Partially Meeting Expectations'
    if (percentage < 115) return 'Meeting Expectations'
    if (percentage < 150) return 'Strong Performance'
    return 'Outstanding'
  }

  const getPerformanceBandColor = (band: string): string => {
    switch (band) {
      case 'Outstanding': return 'bg-green-100 text-green-800 border-green-300'
      case 'Strong Performance': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Meeting Expectations': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'Partially Meeting Expectations': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Underperforming': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-600 border-gray-300'
    }
  }

  // New functions for editing expectations
  const handleStartEditingExpectations = () => {
    setEditingExpectations(true)
    setEditableExpectations([...levelExpectations])
    setNewExpectation('')
  }

  const handleCancelEditingExpectations = () => {
    setEditingExpectations(false)
    setEditableExpectations([])
    setNewExpectation('')
  }

  const handleAddExpectation = () => {
    if (newExpectation.trim()) {
      setEditableExpectations([...editableExpectations, newExpectation.trim()])
      setNewExpectation('')
    }
  }

  const handleRemoveExpectation = (index: number) => {
    setEditableExpectations(editableExpectations.filter((_, i) => i !== index))
  }

  const handleSaveExpectations = async () => {
    if (!selectedRole || !selectedLevel) return
    
    setSavingExpectations(true)
    try {
      const response = await fetch('/api/level-expectations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          level: selectedLevel,
          expectations: editableExpectations
        })
      })

      if (response.ok) {
        setLevelExpectations([...editableExpectations])
        setEditingExpectations(false)
        setEditableExpectations([])
        alert('Level expectations saved successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to save expectations: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving level expectations:', error)
      alert('Failed to save expectations')
    } finally {
      setSavingExpectations(false)
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role & Level Setup</h2>
          <p className="text-gray-600">Configure your role and level to get personalized expectations and category templates</p>
        </div>
      </div>

      {/* Current Profile Status */}
      {userProfile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              Current Profile: {userProfile.role} Level {userProfile.level}
            </span>
          </div>
        </div>
      )}

      {/* Role and Level Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your Role and Level</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value)
                setSelectedLevel(e.target.value === 'Manager' ? 4 : 1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Role</option>
              <option value="IC">Individual Contributor (IC)</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
              disabled={!selectedRole}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              {getLevelOptions().map(level => (
                <option key={level} value={level}>Level {level}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSaveProfile}
            disabled={!selectedRole || !selectedLevel || saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            <User className="h-5 w-5 mr-2" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Level Expectations */}
      {selectedRole && selectedLevel && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Target className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Level Expectations: {selectedRole} L{selectedLevel}
              </h3>
            </div>
            
            {!editingExpectations && (
              <button
                onClick={handleStartEditingExpectations}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {levelExpectations.length > 0 ? 'Edit' : 'Add Expectations'}
              </button>
            )}
          </div>
          
          {!editingExpectations ? (
            // Display mode
            levelExpectations.length > 0 ? (
              <div className="space-y-3">
                {levelExpectations.map((expectation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{expectation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No expectations defined yet</p>
                <p className="text-sm">Click "Add Expectations" to define level expectations for {selectedRole} L{selectedLevel}</p>
              </div>
            )
          ) : (
            // Edit mode
            <div className="space-y-4">
              <div className="space-y-3">
                {editableExpectations.map((expectation, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <p className="text-gray-700 flex-1">{expectation}</p>
                    <button
                      onClick={() => handleRemoveExpectation(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newExpectation}
                    onChange={(e) => setNewExpectation(e.target.value)}
                    placeholder="Enter a new level expectation..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddExpectation()
                      }
                    }}
                  />
                  <button
                    onClick={handleAddExpectation}
                    disabled={!newExpectation.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={handleSaveExpectations}
                  disabled={savingExpectations}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {savingExpectations ? 'Saving...' : 'Save Expectations'}
                </button>
                <button
                  onClick={handleCancelEditingExpectations}
                  className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Templates Preview */}
      {categoryTemplates.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Settings className="h-6 w-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Recommended Categories ({categoryTemplates.length})
              </h3>
            </div>
            
            <button
              onClick={handlePrefillCategories}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Prefill Categories
            </button>
          </div>

          <div className="space-y-4">
            {['input', 'output', 'outcome', 'impact'].map((dimension) => {
              const dimensionTemplates = categoryTemplates.filter(t => t.dimension === dimension)
              if (dimensionTemplates.length === 0) return null

              return (
                <div key={dimension} className="border rounded-lg overflow-hidden">
                  <div className={`px-4 py-2 font-medium capitalize ${
                    dimension === 'input' ? 'bg-blue-50 text-blue-800' :
                    dimension === 'output' ? 'bg-green-50 text-green-800' :
                    dimension === 'outcome' ? 'bg-purple-50 text-purple-800' :
                    'bg-orange-50 text-orange-800'
                  }`}>
                    {dimension} Activities ({dimensionTemplates.length})
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {dimensionTemplates.map((template) => (
                      <div key={template.id} className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{template.categoryName}</h4>
                            {template.description && (
                              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                            )}
                          </div>
                          
                          <div className="ml-4 text-right text-sm">
                            <div className="text-gray-900 font-medium">
                              {template.scorePerOccurrence} pts each
                            </div>
                            <div className="text-gray-500">
                              Expected: {template.expectedWeeklyCount}/week
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">About Category Templates</p>
                <p className="mt-1">
                  These categories are pre-configured for your role and level with expected weekly counts. 
                  You can prefill them to get started quickly, then customize scores and expectations as needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Band Guide */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Evaluation Bands</h3>
        <div className="space-y-2">
          {[
            { band: 'Outstanding', description: 'Significantly exceeding all expectations (>150%)' },
            { band: 'Strong Performance', description: 'Exceeding expectations in most areas (115-150%)' },
            { band: 'Meeting Expectations', description: 'Meeting all baseline expectations (85-115%)' },
            { band: 'Partially Meeting Expectations', description: 'Meeting some but not all expectations (70-85%)' },
            { band: 'Underperforming', description: 'Below expected performance levels (<70%)' }
          ].map(({ band, description }) => (
            <div key={band} className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPerformanceBandColor(band)}`}>
                {band}
              </span>
              <span className="text-gray-600 text-sm">{description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Prefill Confirmation Modal */}
      {showPrefillConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prefill Categories?</h3>
            <p className="text-gray-600 mb-6">
              Would you like to prefill your categories with the {categoryTemplates.length} recommended templates for {selectedRole} L{selectedLevel}?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handlePrefillCategories}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Yes, Prefill
              </button>
              <button
                onClick={() => setShowPrefillConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 