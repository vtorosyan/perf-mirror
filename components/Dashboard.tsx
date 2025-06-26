'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, Target, AlertTriangle, Brain, Scale, Calendar } from 'lucide-react'
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
    overrideScore: rawLog.overrideScore !== null && rawLog.overrideScore !== undefined ? Number(safeValue(rawLog.overrideScore)) : undefined,
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
  role?: string
  level?: string
  outstandingThreshold: number
  strongThreshold: number
  meetingThreshold: number
  partialThreshold: number
  underperformingThreshold: number
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
      console.log(`📅 Dashboard fetching data for weeks: ${weeks.join(',')}`)
      
      const [logsResponse, targetsResponse, weightsResponse] = await Promise.all([
        fetch(`/api/weekly-logs?weeks=${weeks.join(',')}`),
        fetch('/api/targets'),
        fetch('/api/role-weights')
      ])

      const rawLogs = await logsResponse.json()
      const targetsData = await targetsResponse.json()
      const weightsData = await weightsResponse.json()

      console.log(`📊 Dashboard received ${rawLogs.length} raw logs:`, rawLogs)
      console.log(`🎯 Dashboard received ${targetsData.length} targets`)
      console.log(`⚖️ Dashboard received ${weightsData.length} role weights`)

      // Transform logs to prevent React error #31 and filter out logs with missing categories
      const transformedLogs = Array.isArray(rawLogs) 
        ? rawLogs
            .filter(log => log.category) // Filter out logs with missing categories
            .map(transformWeeklyLog)
            .filter(log => log !== null)
        : []
      
      console.log(`✅ Dashboard transformed ${transformedLogs.length} logs successfully`)
      
      setWeeklyLogs(transformedLogs)
      setTargets(targetsData)
      
      // Find active role weights
      const activeWeights = weightsData.find((weight: any) => weight.isActive)
      if (activeWeights) {
        console.log(`⚖️ Found active role weights: ${activeWeights.name}`)
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
        console.log('⚠️ No active role weights found')
        setRoleWeights(null)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActiveTarget = (): PerformanceTarget | null => {
    return targets.find(target => target.isActive) || null
  }

  // Get the evaluation period based on active target
  const getEvaluationPeriod = (): { weeks: string[], description: string } => {
    const activeTarget = getActiveTarget()
    
    if (activeTarget && activeTarget.timePeriodWeeks > 0) {
      const weeks = getPreviousWeeks(activeTarget.timePeriodWeeks)
      return {
        weeks,
        description: `Last ${activeTarget.timePeriodWeeks} weeks (${activeTarget.name})`
      }
    } else {
      // Fallback to current week if no target is set
      const currentWeek = getCurrentWeekString()
      return {
        weeks: [currentWeek],
        description: 'Current week only (no active target)'
      }
    }
  }

  const calculateWeeklyScores = (): WeeklyScore[] => {
    const weeks = getPreviousWeeks(12)

    
    return weeks.map(week => {
      const weekLogs = weeklyLogs.filter(log => log.week === week)
      console.log(`📅 Week ${week} has ${weekLogs.length} logs:`, weekLogs)
      
      let score: number
      if (roleWeights) {
        const dimensionScores = calculateDimensionScores(weekLogs)
        score = Math.round(calculateWeightedScore(dimensionScores, roleWeights))
        console.log(`⚖️ Week ${week} weighted score: ${score} (from dimensions:`, dimensionScores, `)`)
      } else {
        score = weekLogs.reduce((total, log) => {
          const safeCount = Number(safeValue(log.count)) || 0
          const safeScorePerOccurrence = Number(safeValue(log.category?.scorePerOccurrence)) || 0
          const safeOverrideScore = log.overrideScore !== undefined ? Number(safeValue(log.overrideScore)) : undefined
          return total + (safeOverrideScore ?? (safeCount * safeScorePerOccurrence))
        }, 0)
        console.log(`📊 Week ${week} raw score: ${score}`)
      }
      
      return {
        week,
        score,
        formattedWeek: formatWeekString(week)
      }
    })
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
      case 'Outstanding': return 'text-green-700 bg-green-100'
      case 'Strong Performance': return 'text-green-600 bg-green-50'
      case 'Meeting Expectations': return 'text-blue-600 bg-blue-50'
      case 'Partially Meeting Expectations': return 'text-yellow-600 bg-yellow-50'
      case 'Underperforming': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  // Calculate score for the evaluation period (based on active target)
  const getEvaluationPeriodScore = (): number => {
    const { weeks } = getEvaluationPeriod()
    const periodLogs = weeklyLogs.filter(log => weeks.includes(log.week))
    console.log(`📅 Evaluation period (${weeks.length} weeks) has ${periodLogs.length} logs:`, periodLogs)
    
    if (roleWeights) {
      const dimensionScores = calculateDimensionScores(periodLogs)
      const score = Math.round(calculateWeightedScore(dimensionScores, roleWeights))
      console.log(`⚖️ Evaluation period weighted score: ${score}`)
      return score
    } else {
      const score = periodLogs.reduce((total, log) => {
        const safeCount = Number(safeValue(log.count)) || 0
        const safeScorePerOccurrence = Number(safeValue(log.category?.scorePerOccurrence)) || 0
        const safeOverrideScore = log.overrideScore !== undefined ? Number(safeValue(log.overrideScore)) : undefined
        return total + (safeOverrideScore ?? (safeCount * safeScorePerOccurrence))
      }, 0)
      console.log(`📊 Evaluation period raw score: ${score}`)
      return score
    }
  }

  // Calculate dimension scores for the evaluation period
  const getEvaluationPeriodDimensionScores = (): DimensionScore => {
    const { weeks } = getEvaluationPeriod()
    const periodLogs = weeklyLogs.filter(log => weeks.includes(log.week))
    return calculateDimensionScores(periodLogs)
  }

  const getInsight = (): string => {
    const target = getActiveTarget()
    const { description } = getEvaluationPeriod()
    
    if (!target) {
      return `Set up performance targets to get insights. Currently showing data for: ${description.toLowerCase()}`
    }

    const currentScore = getEvaluationPeriodScore()
    const level = getPerformanceLevel(currentScore, target)

    if (level === 'Outstanding') {
      return `Exceptional work! You're performing at an outstanding level with ${currentScore} points over ${description.toLowerCase()}.`
    } else if (level === 'Strong Performance') {
      const pointsToOutstanding = target.outstandingThreshold - currentScore
      return `Great performance! You need ${pointsToOutstanding} more points over ${description.toLowerCase()} to reach Outstanding level.`
    } else if (level === 'Meeting Expectations') {
      const pointsToStrong = target.strongThreshold - currentScore
      return `You're meeting expectations over ${description.toLowerCase()}. ${pointsToStrong} more points to reach Strong Performance level.`
    } else if (level === 'Partially Meeting Expectations') {
      const pointsToMeeting = target.meetingThreshold - currentScore
      return `You need ${pointsToMeeting} more points over ${description.toLowerCase()} to fully meet expectations.`
    } else {
      const pointsNeeded = target.partialThreshold - currentScore
      return `Focus up! You need ${pointsNeeded} more points over ${description.toLowerCase()} to start meeting expectations.`
    }
  }

  const getSmartInsights = (): string[] => {
    if (!roleWeights) return []
    
    const dimensionScores = getEvaluationPeriodDimensionScores()
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
  const evaluationPeriod = getEvaluationPeriod()
  const currentScore = getEvaluationPeriodScore()
  const currentLevel = activeTarget ? getPerformanceLevel(currentScore, activeTarget) : 'No Target Set'
  const insight = getInsight()

  return (
    <div className="space-y-6">
      {/* Evaluation Period Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-blue-800 font-medium">
            Evaluation Period: {evaluationPeriod.description}
          </span>
        </div>
      </div>

      {/* Current Period Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {roleWeights ? 'Weighted Score' : 'Raw Total Score'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{currentScore}</p>
              {roleWeights && (
                <p className="text-xs text-gray-500">
                  Raw: {weeklyLogs.filter(log => evaluationPeriod.weeks.includes(log.week)).reduce((total, log) => {
                    const safeCount = Number(safeValue(log.count)) || 0
                    const safeScorePerOccurrence = Number(safeValue(log.category?.scorePerOccurrence)) || 0
                    const safeOverrideScore = log.overrideScore !== undefined ? Number(safeValue(log.overrideScore)) : undefined
                    return total + (safeOverrideScore ?? (safeCount * safeScorePerOccurrence))
                  }, 0)} pts
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {evaluationPeriod.description}
              </p>
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
              {activeTarget && (
                <p className="text-xs text-gray-400 mt-1">
                  Based on {activeTarget.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Target Thresholds</p>
              {activeTarget ? (
                <div className="text-xs text-gray-900 space-y-1">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                    <span>Outstanding: {activeTarget.outstandingThreshold}+</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>Strong: {activeTarget.strongThreshold}+</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>Meeting: {activeTarget.meetingThreshold}+</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span>Partial: {activeTarget.partialThreshold}+</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span>Under: {activeTarget.underperformingThreshold}+</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-900">Not Set</p>
              )}
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
            <span className="ml-2 text-sm text-gray-500">({evaluationPeriod.description})</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(getEvaluationPeriodDimensionScores()).map(([dimension, score]) => (
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
              <span className="text-lg font-bold text-purple-600">{getEvaluationPeriodScore()} points</span>
            </div>
            <div className="text-xs text-purple-600 mt-1">
              Using {roleWeights.name} role weights • {evaluationPeriod.description}
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
            <span className="ml-2 text-sm text-gray-500">({evaluationPeriod.description})</span>
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
                  <Bar dataKey={() => activeTarget.outstandingThreshold} fill="transparent" stroke="#16a34a" strokeWidth={2} />
                  <Bar dataKey={() => activeTarget.strongThreshold} fill="transparent" stroke="#22c55e" strokeWidth={2} />
                  <Bar dataKey={() => activeTarget.meetingThreshold} fill="transparent" stroke="#3b82f6" strokeWidth={2} />
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