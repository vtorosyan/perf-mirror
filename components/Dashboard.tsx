'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, Target, AlertTriangle, Brain, Scale } from 'lucide-react'
import { 
  getCurrentWeekString, 
  getPreviousWeeks, 
  formatWeekString,
  calculateDimensionScores,
  calculateWeightedScore,
  generateInsights,
  getDimensionLabel,
  type DimensionScore,
  type RoleWeights
} from '@/lib/utils'

interface WeeklyLog {
  id: string
  categoryId: string
  week: string
  count: number
  overrideScore?: number
  category: {
    name: string
    scorePerOccurrence: number
    dimension: string
  }
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

// Helper function to safely transform weekly log data
const transformWeeklyLog = (rawLog: any): WeeklyLog | null => {
  if (!rawLog || !rawLog.category) return null
  
  return {
    id: safeValue(rawLog.id) as string,
    categoryId: safeValue(rawLog.categoryId) as string,
    week: safeValue(rawLog.week) as string,
    count: Number(safeValue(rawLog.count)) || 0,
    overrideScore: rawLog.overrideScore !== undefined ? Number(safeValue(rawLog.overrideScore)) : undefined,
    category: {
      name: safeValue(rawLog.category.name) as string,
      scorePerOccurrence: Number(safeValue(rawLog.category.scorePerOccurrence)) || 0,
      dimension: safeValue(rawLog.category.dimension) as string,
    }
  }
}

interface PerformanceTarget {
  id: string
  name: string
  excellentThreshold: number
  goodThreshold: number
  needsImprovementThreshold: number
  timePeriodWeeks: number
  isActive: boolean
}

interface WeeklyScore {
  week: string
  score: number
  formattedWeek: string
}

export default function Dashboard() {
  const [weeklyLogs, setWeeklyLogs] = useState<WeeklyLog[]>([])
  const [targets, setTargets] = useState<PerformanceTarget[]>([])
  const [roleWeights, setRoleWeights] = useState<RoleWeights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const weeks = getPreviousWeeks(12)
      const [logsResponse, targetsResponse, weightsResponse] = await Promise.all([
        fetch(`/api/weekly-logs?weeks=${weeks.join(',')}`),
        fetch('/api/targets'),
        fetch('/api/role-weights')
      ])

      const rawLogs = await logsResponse.json()
      const targetsData = await targetsResponse.json()
      const weightsData = await weightsResponse.json()

      // Transform logs to prevent React error #31
      const transformedLogs = Array.isArray(rawLogs) 
        ? rawLogs.map(transformWeeklyLog).filter(log => log !== null)
        : []
      
      setWeeklyLogs(transformedLogs)
      setTargets(targetsData)
      
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
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateWeeklyScores = (): WeeklyScore[] => {
    const weeks = getPreviousWeeks(12)
    
    return weeks.map(week => {
      const weekLogs = weeklyLogs.filter(log => log.week === week)
      
      let score: number
      if (roleWeights) {
        const dimensionScores = calculateDimensionScores(weekLogs)
        score = Math.round(calculateWeightedScore(dimensionScores, roleWeights))
      } else {
        score = weekLogs.reduce((total, log) => {
          const safeCount = Number(safeValue(log.count)) || 0
          const safeScorePerOccurrence = Number(safeValue(log.category?.scorePerOccurrence)) || 0
          const safeOverrideScore = log.overrideScore !== undefined ? Number(safeValue(log.overrideScore)) : undefined
          return total + (safeOverrideScore ?? (safeCount * safeScorePerOccurrence))
        }, 0)
      }
      
      return {
        week,
        score,
        formattedWeek: formatWeekString(week)
      }
    })
  }

  const getActiveTarget = (): PerformanceTarget | null => {
    return targets.find(target => target.isActive) || null
  }

  const getPerformanceLevel = (score: number, target: PerformanceTarget): string => {
    if (score >= target.excellentThreshold) return 'Excellent'
    if (score >= target.goodThreshold) return 'Good'
    if (score >= target.needsImprovementThreshold) return 'Needs Improvement'
    return 'Unsatisfactory'
  }

  const getPerformanceColor = (level: string): string => {
    switch (level) {
      case 'Excellent': return 'text-green-600 bg-green-50'
      case 'Good': return 'text-blue-600 bg-blue-50'
      case 'Needs Improvement': return 'text-yellow-600 bg-yellow-50'
      case 'Unsatisfactory': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCurrentWeekScore = (): number => {
    const currentWeek = getCurrentWeekString()
    const currentWeekLogs = weeklyLogs.filter(log => log.week === currentWeek)
    
    if (roleWeights) {
      const dimensionScores = calculateDimensionScores(currentWeekLogs)
      return Math.round(calculateWeightedScore(dimensionScores, roleWeights))
    } else {
      return currentWeekLogs.reduce((total, log) => {
        const safeCount = Number(safeValue(log.count)) || 0
        const safeScorePerOccurrence = Number(safeValue(log.category?.scorePerOccurrence)) || 0
        const safeOverrideScore = log.overrideScore !== undefined ? Number(safeValue(log.overrideScore)) : undefined
        return total + (safeOverrideScore ?? (safeCount * safeScorePerOccurrence))
      }, 0)
    }
  }

  const getCurrentDimensionScores = (): DimensionScore => {
    const currentWeek = getCurrentWeekString()
    const currentWeekLogs = weeklyLogs.filter(log => log.week === currentWeek)
    return calculateDimensionScores(currentWeekLogs)
  }

  const getInsight = (): string => {
    const target = getActiveTarget()
    if (!target) return 'Set up performance targets to get insights'

    const currentScore = getCurrentWeekScore()
    const level = getPerformanceLevel(currentScore, target)

    if (level === 'Excellent') {
      return `Great work! You're exceeding expectations with ${currentScore} points this week.`
    } else if (level === 'Good') {
      const pointsToExcellent = target.excellentThreshold - currentScore
      return `You're on track for good performance. ${pointsToExcellent} more points to reach Excellent level.`
    } else if (level === 'Needs Improvement') {
      const pointsToGood = target.goodThreshold - currentScore
      return `You need ${pointsToGood} more points this week to reach Good performance level.`
    } else {
      const pointsNeeded = target.needsImprovementThreshold - currentScore
      return `Focus up! You need ${pointsNeeded} more points to reach minimum expectations.`
    }
  }

  const getSmartInsights = (): string[] => {
    if (!roleWeights) return []
    
    const dimensionScores = getCurrentDimensionScores()
    return generateInsights(dimensionScores, roleWeights)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const weeklyScores = calculateWeeklyScores()
  const activeTarget = getActiveTarget()
  const currentScore = getCurrentWeekScore()
  const currentLevel = activeTarget ? getPerformanceLevel(currentScore, activeTarget) : 'No Target Set'
  const insight = getInsight()

  return (
    <div className="space-y-6">
      {/* Current Week Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week's Score</p>
              <p className="text-2xl font-bold text-gray-900">{currentScore}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Performance Level</p>
              <p className={`text-sm font-semibold px-2 py-1 rounded-full ${getPerformanceColor(currentLevel)}`}>
                {currentLevel}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Target</p>
              <p className="text-sm text-gray-900">
                {activeTarget ? `${activeTarget.goodThreshold}+ for Good` : 'Not Set'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* IOOI Breakdown */}
      {roleWeights && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Scale className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">IOOI Dimension Breakdown</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(getCurrentDimensionScores()).map(([dimension, score]) => (
              <div key={dimension} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-3xl font-bold mb-2 ${
                  dimension === 'input' ? 'text-blue-600' :
                  dimension === 'output' ? 'text-green-600' :
                  dimension === 'outcome' ? 'text-purple-600' : 'text-orange-600'
                }`}>
                  {Number(safeValue(score)) || 0}
                </div>
                <div className="text-sm font-medium text-gray-900">{getDimensionLabel(dimension)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {(((roleWeights[`${dimension}Weight` as keyof RoleWeights] as number ?? 0) * 100) || 0).toFixed(0)}% weight
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-800">Weighted Final Score:</span>
              <span className="text-lg font-bold text-purple-600">{getCurrentWeekScore()} points</span>
            </div>
            <div className="text-xs text-purple-600 mt-1">
              Using {roleWeights.name} role weights
            </div>
          </div>
        </div>
      )}

      {/* Insight */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 font-medium">{insight}</p>
      </div>

      {/* Smart Insights */}
      {roleWeights && getSmartInsights().length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Brain className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Smart Insights</h3>
          </div>
          <div className="space-y-3">
            {getSmartInsights().map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Scores (Bar Chart)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyScores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedWeek" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#3b82f6" />
              {activeTarget && (
                <>
                  <Bar dataKey={() => activeTarget.excellentThreshold} fill="transparent" stroke="#22c55e" strokeWidth={2} />
                  <Bar dataKey={() => activeTarget.goodThreshold} fill="transparent" stroke="#3b82f6" strokeWidth={2} />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend (Line Chart)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyScores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedWeek" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {weeklyLogs
            .filter(log => log.count > 0)
            .slice(0, 10)
            .map((log) => (
              <div key={log.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <span className="font-medium">{safeValue(log.category?.name)}</span>
                  <span className="text-sm text-gray-500 ml-2">{formatWeekString(safeValue(log.week) as string)}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-600">{Number(safeValue(log.count)) || 0}x</span>
                  <span className={`text-sm ml-2 ${log.overrideScore !== undefined ? 'text-orange-600' : 'text-blue-600'}`}>
                    +{(() => {
                      const safeCount = Number(safeValue(log.count)) || 0
                      const safeScorePerOccurrence = Number(safeValue(log.category?.scorePerOccurrence)) || 0
                      const safeOverrideScore = log.overrideScore !== undefined ? Number(safeValue(log.overrideScore)) : undefined
                      return safeOverrideScore ?? (safeCount * safeScorePerOccurrence)
                    })()} pts
                    {log.overrideScore !== undefined && (
                      <span className="text-xs text-gray-500 ml-1">(override)</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
} 