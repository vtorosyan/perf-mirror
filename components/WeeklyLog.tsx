'use client'

import { useState, useEffect } from 'react'
import { Calendar, Save, Clock, Edit3 } from 'lucide-react'
import { 
  getCurrentWeekString, 
  formatWeekString, 
  getPreviousWeeks,
  getDimensionLabel,
  getDimensionColor,
  calculateDimensionScores,
  calculateWeightedScore,
  type DimensionScore,
  type RoleWeights
} from '@/lib/utils'

interface Category {
  id: string
  name: string
  scorePerOccurrence: number
  dimension: string
  description?: string
}

// Helper function to safely extract values and prevent React error #31
const safeValue = (value: any): string | number => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object' && value && 'value' in value) {
    return value.value
  }
  if (typeof value === 'object' && value && 'type' in value) {
    return value.value || ''
  }
  return value
}

interface WeeklyLog {
  id: string
  categoryId: string
  week: string
  count: number
  overrideScore?: number
  reference?: string
  category: Category
}

interface LogEntry {
  categoryId: string
  count: number
  overrideScore?: number
  reference?: string
}

interface WeeklyLogProps {
  onDataChange?: () => void
}

export default function WeeklyLog({ onDataChange }: WeeklyLogProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [weeklyLogs, setWeeklyLogs] = useState<WeeklyLog[]>([])
  const [roleWeights, setRoleWeights] = useState<RoleWeights | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<string>(getCurrentWeekString())
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingWeeklyLogs, setLoadingWeeklyLogs] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingScores, setEditingScores] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Only fetch weekly logs if we have categories loaded
    if (categories.length > 0) {
      fetchWeeklyLogs()
    }
  }, [selectedWeek, categories.length])

  const fetchData = async () => {
    try {
      const [categoriesResponse, weightsResponse] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/role-weights')
      ])
      
      const rawCategoriesData = await categoriesResponse.json()
      const weightsData = await weightsResponse.json()
      
      // Transform categories data to prevent React error #31
      const transformedCategories = Array.isArray(rawCategoriesData) 
        ? rawCategoriesData.map((cat: any) => ({
            id: safeValue(cat.id) as string,
            name: safeValue(cat.name) as string,
            scorePerOccurrence: Number(safeValue(cat.scorePerOccurrence)) || 0,
            dimension: safeValue(cat.dimension) as string,
            description: cat.description ? safeValue(cat.description) as string : undefined
          }))
        : []
      
      setCategories(transformedCategories)
      
      // Find active role weights
      const activeWeights = weightsData.find((weight: any) => weight.isActive)
      if (activeWeights) {
        // Validate weight values
        const validatedWeights = {
          ...activeWeights,
          inputWeight: typeof activeWeights.inputWeight === 'number' ? activeWeights.inputWeight : 0,
          outputWeight: typeof activeWeights.outputWeight === 'number' ? activeWeights.outputWeight : 0,
          outcomeWeight: typeof activeWeights.outcomeWeight === 'number' ? activeWeights.outcomeWeight : 0,
          impactWeight: typeof activeWeights.impactWeight === 'number' ? activeWeights.impactWeight : 0,
        }
        setRoleWeights(validatedWeights)
      } else {
        setRoleWeights(null)
      }
      
      // Initialize log entries
      const initialEntries = transformedCategories.map((category: Category) => ({
        categoryId: category.id,
        count: 0,
        overrideScore: undefined,
        reference: ''
      }))
      setLogEntries(initialEntries)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeeklyLogs = async (retryCount = 0) => {
    setLoadingWeeklyLogs(true)
    try {
      const response = await fetch(`/api/weekly-logs?weeks=${selectedWeek}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const logs = await response.json()
      
      console.log('🔍 Fetched logs:', logs)
      
      // Check if we got an error response
      if (logs.error) {
        throw new Error(logs.error)
      }
      
      // Ensure logs is an array
      if (!Array.isArray(logs)) {
        console.warn('⚠️ Expected array but got:', typeof logs, logs)
        setWeeklyLogs([])
        return
      }
      
      // Filter out logs with missing categories
      const validLogs = logs.filter((log: WeeklyLog) => log.category)
      setWeeklyLogs(validLogs)
      
      console.log('🔍 Valid logs:', validLogs)
      
      // If we have no valid logs but categories exist, this might be a fresh week
      if (validLogs.length === 0 && categories.length > 0) {
        console.log('📝 No existing logs for this week, initializing fresh entries')
        // Reset to initial state for this week
        const initialEntries = categories.map((category: Category) => ({
          categoryId: category.id,
          count: 0,
          overrideScore: undefined,
          reference: ''
        }))
        setLogEntries(initialEntries)
        return
      }
      
      // Update log entries with existing data
      setLogEntries(prevEntries => {
        const updatedEntries = prevEntries.map(entry => {
          const existingLog = validLogs.find((log: WeeklyLog) => log.categoryId === entry.categoryId)
          
          const hasOverride = existingLog && existingLog.overrideScore !== null && existingLog.overrideScore !== undefined
          
          const updatedEntry = {
            ...entry,
            count: existingLog ? Number(existingLog.count) || 0 : 0,
            overrideScore: hasOverride ? Number(existingLog.overrideScore) : undefined,
            reference: existingLog?.reference || ''
          }
          
          console.log(`🔍 Mapping ${entry.categoryId}:`, {
            existing: existingLog,
            updated: updatedEntry
          })
          
          return updatedEntry
        })
        
        console.log('🔍 Final updated entries:', updatedEntries)
        return updatedEntries
      })
    } catch (error) {
      console.error('Error fetching weekly logs:', error)
      
      // Retry once if this was the first attempt and we have categories
      if (retryCount === 0 && categories.length > 0) {
        console.log('🔄 Retrying weekly logs fetch...')
        setTimeout(() => fetchWeeklyLogs(1), 1000)
        return
      }
      
      // If retry failed or we don't have categories, set empty state
      setWeeklyLogs([])
      if (categories.length > 0) {
        const initialEntries = categories.map((category: Category) => ({
          categoryId: category.id,
          count: 0,
          overrideScore: undefined,
          reference: ''
        }))
        setLogEntries(initialEntries)
      }
    } finally {
      setLoadingWeeklyLogs(false)
    }
  }

  const handleCountChange = (categoryId: string, count: number) => {
    setLogEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.categoryId === categoryId
          ? { ...entry, count: Math.max(0, count) }
          : entry
      )
    )
  }

  const handleScoreOverride = (categoryId: string, overrideScore: number | undefined) => {
    setLogEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.categoryId === categoryId
          ? { ...entry, overrideScore }
          : entry
      )
    )
  }

  const handleReferenceChange = (categoryId: string, reference: string) => {
    setLogEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.categoryId === categoryId
          ? { ...entry, reference: reference }
          : entry
      )
    )
  }

  const toggleScoreEdit = (categoryId: string) => {
    setEditingScores(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      const savePromises = logEntries.map(entry => 
        fetch('/api/weekly-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryId: entry.categoryId,
            week: selectedWeek,
            count: entry.count,
            overrideScore: entry.overrideScore,
            reference: entry.reference && entry.reference.trim() ? entry.reference.trim() : null
          })
        })
      )

      const responses = await Promise.all(savePromises)
      
      // Check if all saves were successful
      const allSuccessful = responses.every(response => response.ok)
      
      if (allSuccessful) {
        console.log('✅ All saves successful, refreshing data...')
        await fetchWeeklyLogs()
        console.log('✅ Data refreshed')
        alert('Weekly log saved successfully!')
        
        // Note: onDataChange callback removed to prevent parent component interference
        // This ensures the UI state remains stable after saving
      } else {
        throw new Error('Some saves failed')
      }
    } catch (error) {
      console.error('Error saving weekly log:', error)
      alert('Failed to save weekly log')
    } finally {
      setSaving(false)
    }
  }

  const calculateTotalScore = (): number => {
    return logEntries.reduce((total, entry) => {
      const category = categories.find(cat => cat.id === entry.categoryId)
      if (!category) return total
      
      const safeCount = Number(safeValue(entry.count)) || 0
      const safeScorePerOccurrence = Number(safeValue(category.scorePerOccurrence)) || 0
      const safeOverrideScore = entry.overrideScore !== undefined ? Number(safeValue(entry.overrideScore)) : undefined
      
      const score = safeOverrideScore ?? (safeCount * safeScorePerOccurrence)
      return total + (Number(score) || 0)
    }, 0)
  }

  const getDimensionScores = (): DimensionScore => {
    const tempLogs = logEntries.map(entry => {
      const category = categories.find(cat => cat.id === entry.categoryId)
      if (!category) return null
      
      // Ensure all category properties are safe values
      return {
        ...entry,
        category: {
          ...category,
          scorePerOccurrence: Number(safeValue(category.scorePerOccurrence)) || 0,
          dimension: safeValue(category.dimension) as string,
          name: safeValue(category.name) as string,
          id: safeValue(category.id) as string
        },
        overrideScore: entry.overrideScore,
        count: Number(safeValue(entry.count)) || 0
      }
    }).filter(log => log !== null)
    
    return calculateDimensionScores(tempLogs)
  }

  const getWeightedScore = (): number => {
    if (!roleWeights) return calculateTotalScore()
    
    const dimensionScores = getDimensionScores()
    return Math.round(calculateWeightedScore(dimensionScores, roleWeights))
  }

  const getAvailableWeeks = (): string[] => {
    const weeks = getPreviousWeeks(12)
    const currentWeek = getCurrentWeekString()
    
    // Remove duplicates by filtering out current week from previous weeks if it exists
    const uniqueWeeks = weeks.filter(week => week !== currentWeek)
    return [...uniqueWeeks, currentWeek]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Available</h3>
        <p className="text-gray-600 mb-4">
          You need to create some work categories before you can log your weekly activities.
        </p>
        <p className="text-sm text-gray-500">
          Go to the Categories tab to create your first category.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Log Weekly Work</h2>
          <p className="text-gray-600">Track your activities for the selected week</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              disabled={loadingWeeklyLogs}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {getAvailableWeeks().map(week => (
                <option key={week} value={week}>
                  {formatWeekString(week)} {week === getCurrentWeekString() && '(Current)'}
                </option>
              ))}
            </select>
            {loadingWeeklyLogs && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {saving ? (
              <Clock className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Log'}
          </button>
        </div>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Raw Total for {formatWeekString(selectedWeek)}</h3>
              <p className="text-blue-100">Sum of all dimension scores</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{calculateTotalScore()}</div>
              <div className="text-blue-100">points</div>
            </div>
          </div>
        </div>

        {roleWeights && (
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Weighted Score ({roleWeights.name})</h3>
                <p className="text-purple-100">Role-adjusted final score</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{getWeightedScore()}</div>
                <div className="text-purple-100">points</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* IOOI Breakdown */}
      {roleWeights && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">IOOI Dimension Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(getDimensionScores()).map(([dimension, score]) => (
              <div key={dimension} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold mb-1 ${
                  dimension === 'input' ? 'text-blue-600' :
                  dimension === 'output' ? 'text-green-600' :
                  dimension === 'outcome' ? 'text-purple-600' : 'text-orange-600'
                }`}>
                  {Number(safeValue(score)) || 0}
                </div>
                <div className="text-sm text-gray-600">{getDimensionLabel(dimension)}</div>
                <div className="text-xs text-gray-500">
                  {(((roleWeights[`${dimension}Weight` as keyof RoleWeights] as number ?? 0) * 100) || 0).toFixed(0)}% weight
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Entries */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
          <p className="text-sm text-gray-600">Enter the number of times you completed each activity</p>
        </div>
        
        <div className="space-y-6">
          {['input', 'output', 'outcome', 'impact'].map((dimension) => {
            const dimensionCategories = categories.filter(cat => cat.dimension === dimension)
            if (dimensionCategories.length === 0) return null

            return (
              <div key={dimension} className="bg-white rounded-lg border">
                <div className={`px-6 py-3 border-b ${getDimensionColor(dimension)} rounded-t-lg`}>
                  <h3 className="text-lg font-semibold">{getDimensionLabel(dimension)} Activities</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {dimensionCategories.map((category) => {
                    const entry = logEntries.find(e => e.categoryId === category.id)
                    const safeCount = Number(safeValue(entry?.count)) || 0
                    const safeScorePerOccurrence = Number(safeValue(category.scorePerOccurrence)) || 0
                    const calculatedScore = safeCount * safeScorePerOccurrence
                    const finalScore = entry?.overrideScore !== undefined ? Number(safeValue(entry.overrideScore)) : calculatedScore
                    
                    return (
                      <div key={category.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="text-lg font-medium text-gray-900">{safeValue(category.name)}</h4>
                              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                {safeValue(category.scorePerOccurrence)} pts each
                              </span>
                            </div>
                            {category.description && (
                              <p className="text-gray-600 mt-1 text-sm">{safeValue(category.description)}</p>
                            )}
                            
                            {/* Reference input field */}
                            <div className="mt-3">
                              <input
                                type="text"
                                value={entry?.reference || ''}
                                onChange={(e) => handleReferenceChange(category.id, e.target.value)}
                                placeholder="Optional reference (URL, ticket #, etc.)"
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 placeholder-gray-400"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 ml-6">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleCountChange(category.id, (entry?.count || 0) - 1)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                              >
                                -
                              </button>
                              
                              <input
                                type="number"
                                value={Number(safeValue(entry?.count)) || 0}
                                onChange={(e) => handleCountChange(category.id, parseInt(e.target.value) || 0)}
                                className="w-20 px-3 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="0"
                              />
                              
                              <button
                                onClick={() => handleCountChange(category.id, (entry?.count || 0) + 1)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                              >
                                +
                              </button>
                            </div>
                            
                            <div className="text-right min-w-[120px]">
                              <div className="flex items-center justify-end space-x-2">
                                <div className="text-right">
                                  <div className={`text-lg font-semibold ${entry?.overrideScore !== undefined ? 'text-orange-600' : 'text-green-600'}`}>
                                    {finalScore > 0 ? `+${Number(safeValue(finalScore)) || 0}` : '0'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {entry?.overrideScore !== undefined ? 'override' : 'calculated'}
                                  </div>
                                </div>
                                <button
                                  onClick={() => toggleScoreEdit(category.id)}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Override score"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                              </div>
                              
                              {editingScores[category.id] && (
                                <div className="mt-2">
                                  <input
                                    type="number"
                                    value={entry?.overrideScore !== undefined ? Number(safeValue(entry.overrideScore)) : Number(safeValue(calculatedScore))}
                                    onChange={(e) => {
                                      const value = e.target.value
                                      handleScoreOverride(category.id, value ? parseInt(value) : undefined)
                                    }}
                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Override"
                                  />
                                  <div className="flex space-x-1 mt-1">
                                    <button
                                      onClick={() => {
                                        handleScoreOverride(category.id, undefined)
                                        toggleScoreEdit(category.id)
                                      }}
                                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                    >
                                      Reset
                                    </button>
                                    <button
                                      onClick={() => toggleScoreEdit(category.id)}
                                      className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">Week Total:</div>
              {roleWeights && (
                <div className="text-sm text-gray-600">Weighted with {roleWeights.name} role</div>
              )}
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600">
                {roleWeights ? getWeightedScore() : calculateTotalScore()} points
              </span>
              {roleWeights && (
                <div className="text-sm text-gray-600">
                  Raw: {calculateTotalScore()} pts
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 