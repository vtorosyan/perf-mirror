'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, Target, AlertTriangle, Brain, Scale, Calendar, CheckCircle, Star, AlertCircle, Compass, Rocket } from 'lucide-react'
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
  expectations: string // JSON array of expectation strings
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

interface ExpectationAnalysis {
  expectation: string
  status: 'evidenced' | 'consistent' | 'not_evidenced'
  matchingCategories: string[]
  weeksCovered: number
}

interface GrowthSuggestion {
  expectation: string
  status: 'emerging' | 'missing'
  suggestion: string
  recommendedCategories: string[]
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [currentLevelExpectations, setCurrentLevelExpectations] = useState<LevelExpectation | null>(null)
  const [nextLevelExpectations, setNextLevelExpectations] = useState<LevelExpectation | null>(null)
  const [currentLevelTemplates, setCurrentLevelTemplates] = useState<CategoryTemplate[]>([])
  const [nextLevelTemplates, setNextLevelTemplates] = useState<CategoryTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const weeks = getPreviousWeeks(12)
      console.log(`📅 Dashboard fetching data for weeks: ${weeks.join(',')}`)
      
      const [logsResponse, targetsResponse, weightsResponse, profileResponse] = await Promise.all([
        fetch(`/api/weekly-logs?weeks=${weeks.join(',')}`),
        fetch('/api/targets'),
        fetch('/api/role-weights'),
        fetch('/api/user-profile')
      ])

      const rawLogs = await logsResponse.json()
      const targetsData = await targetsResponse.json()
      const weightsData = await weightsResponse.json()
      const profileData = await profileResponse.json()

      console.log(`📊 Dashboard received ${rawLogs.length} raw logs:`, rawLogs)
      console.log(`🎯 Dashboard received ${targetsData.length} targets`)
      console.log(`⚖️ Dashboard received ${weightsData.length} role weights`)
      console.log(`👤 Dashboard received user profile:`, profileData)

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
      setUserProfile(profileData)
      
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

      // Fetch level expectations and category templates if user profile exists
      if (profileData && profileData.role && profileData.level) {
        const currentRole = profileData.role
        const currentLevel = profileData.level
        const nextLevel = currentLevel + 1

        console.log(`🎯 Fetching expectations for ${currentRole} L${currentLevel} and L${nextLevel}`)

        try {
          const [
            currentExpectationsResponse,
            nextExpectationsResponse,
            currentTemplatesResponse,
            nextTemplatesResponse
          ] = await Promise.all([
            fetch(`/api/level-expectations?role=${currentRole}&level=${currentLevel}`),
            fetch(`/api/level-expectations?role=${currentRole}&level=${nextLevel}`),
            fetch(`/api/category-templates?role=${currentRole}&level=${currentLevel}`),
            fetch(`/api/category-templates?role=${currentRole}&level=${nextLevel}`)
          ])

          const [currentExpectations, nextExpectations, currentTemplates, nextTemplates] = await Promise.all([
            currentExpectationsResponse.json(),
            nextExpectationsResponse.json(),
            currentTemplatesResponse.json(),
            nextTemplatesResponse.json()
          ])

          console.log(`📋 Current level expectations:`, currentExpectations)
          console.log(`📈 Next level expectations:`, nextExpectations)
          console.log(`📂 Current level templates:`, currentTemplates)
          console.log(`📂 Next level templates:`, nextTemplates)

          setCurrentLevelExpectations(currentExpectations)
          setNextLevelExpectations(nextExpectations)
          setCurrentLevelTemplates(Array.isArray(currentTemplates) ? currentTemplates : [])
          setNextLevelTemplates(Array.isArray(nextTemplates) ? nextTemplates : [])
        } catch (error) {
          console.error('Error fetching level-specific data:', error)
        }
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

  // Analyze current level expectations coverage
  const analyzeCurrentLevelExpectations = (): ExpectationAnalysis[] => {
    if (!currentLevelExpectations || !currentLevelTemplates.length) return []

    const evaluationPeriod = getEvaluationPeriod()
    const periodLogs = weeklyLogs.filter(log => evaluationPeriod.weeks.includes(log.week))
    
    try {
      const expectations = JSON.parse(currentLevelExpectations.expectations)
      
      return expectations.map((expectation: string) => {
        // Find matching category templates for this expectation
        const matchingCategories = findMatchingCategories(expectation, currentLevelTemplates)
        
        // Check activity in these categories
        const categoryActivity = matchingCategories.map(template => {
          const categoryLogs = periodLogs.filter(log => 
            log.category.name.toLowerCase().includes(template.categoryName.toLowerCase()) ||
            template.categoryName.toLowerCase().includes(log.category.name.toLowerCase())
          )
          
          const weeksWithActivity = new Set(
            categoryLogs.filter(log => log.count > 0).map(log => log.week)
          ).size
          
          return { categoryName: template.categoryName, weeksWithActivity }
        })
        
        const totalWeeksWithActivity = Math.max(...categoryActivity.map(ca => ca.weeksWithActivity), 0)
        const hasActivity = categoryActivity.some(ca => ca.weeksWithActivity > 0)
        
        let status: 'evidenced' | 'consistent' | 'not_evidenced'
        if (totalWeeksWithActivity >= 3) {
          status = 'consistent'
        } else if (hasActivity) {
          status = 'evidenced'
        } else {
          status = 'not_evidenced'
        }
        
        return {
          expectation,
          status,
          matchingCategories: matchingCategories.map(t => t.categoryName),
          weeksCovered: totalWeeksWithActivity
        }
      })
    } catch (error) {
      console.error('Error parsing current level expectations:', error)
      return []
    }
  }

  // Generate growth suggestions for next level
  const generateGrowthSuggestions = (): GrowthSuggestion[] => {
    if (!nextLevelExpectations || !nextLevelTemplates.length || !userProfile) return []

    const evaluationPeriod = getEvaluationPeriod()
    const periodLogs = weeklyLogs.filter(log => evaluationPeriod.weeks.includes(log.week))
    
    try {
      const expectations = JSON.parse(nextLevelExpectations.expectations)
      
      return expectations.map((expectation: string) => {
        // Find matching category templates for this expectation
        const matchingCategories = findMatchingCategories(expectation, nextLevelTemplates)
        
        // Check if user already has some activity in these areas
        const hasCurrentActivity = matchingCategories.some(template => {
          return periodLogs.some(log => 
            (log.category.name.toLowerCase().includes(template.categoryName.toLowerCase()) ||
             template.categoryName.toLowerCase().includes(log.category.name.toLowerCase())) &&
            log.count > 0
          )
        })
        
        const status: 'emerging' | 'missing' = hasCurrentActivity ? 'emerging' : 'missing'
        
        // Generate contextual suggestions
        const suggestion = generateSuggestionText(expectation, matchingCategories, status, userProfile)
        
        return {
          expectation,
          status,
          suggestion,
          recommendedCategories: matchingCategories.map(t => t.categoryName)
        }
      })
    } catch (error) {
      console.error('Error parsing next level expectations:', error)
      return []
    }
  }

  // Helper function to find matching categories for an expectation
  const findMatchingCategories = (expectation: string, templates: CategoryTemplate[]): CategoryTemplate[] => {
    const expectationLower = expectation.toLowerCase()
    
    // Simple keyword matching - can be enhanced with more sophisticated logic
    const keywords = extractKeywords(expectationLower)
    
    return templates.filter(template => {
      const templateName = template.categoryName.toLowerCase()
      const templateDesc = (template.description || '').toLowerCase()
      
      return keywords.some(keyword => 
        templateName.includes(keyword) || 
        templateDesc.includes(keyword) ||
        keyword.includes(templateName.split(' ')[0]) // Partial matching
      )
    })
  }

  // Extract keywords from expectation text
  const extractKeywords = (text: string): string[] => {
    // Remove common words and extract meaningful keywords
    const commonWords = ['should', 'must', 'can', 'will', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
    
    return text
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 5) // Limit to most important keywords
  }

  // Generate contextual suggestion text
  const generateSuggestionText = (
    expectation: string, 
    categories: CategoryTemplate[], 
    status: 'emerging' | 'missing',
    profile: UserProfile
  ): string => {
    const roleLevel = `${profile.role} L${profile.level}`
    
    if (status === 'emerging') {
      if (categories.length > 0) {
        return `Great start! Keep building on your ${categories[0].categoryName.toLowerCase()} work to strengthen this area.`
      }
      return `You're showing early signs of this capability — keep developing it!`
    } else {
      // Missing - provide specific suggestions
      if (categories.length > 0) {
        const category = categories[0]
        const suggestions = getSuggestionsByCategory(category.categoryName, category.dimension)
        return suggestions
      }
      
      // Fallback suggestions based on expectation content
      const expectationLower = expectation.toLowerCase()
      if (expectationLower.includes('mentor')) {
        return `Consider volunteering to mentor junior team members or participating in onboarding new hires.`
      } else if (expectationLower.includes('lead') || expectationLower.includes('leadership')) {
        return `Look for opportunities to lead initiatives, projects, or technical discussions.`
      } else if (expectationLower.includes('design') || expectationLower.includes('architecture')) {
        return `Try participating in design reviews or proposing architectural improvements.`
      } else if (expectationLower.includes('strategy')) {
        return `Engage in strategic planning sessions or contribute to technical roadmap discussions.`
      } else {
        return `Focus on developing this capability through relevant projects and initiatives.`
      }
    }
  }

  // Get specific suggestions based on category and dimension
  const getSuggestionsByCategory = (categoryName: string, dimension: string): string => {
    const categoryLower = categoryName.toLowerCase()
    
    if (categoryLower.includes('mentor')) {
      return `Start by mentoring junior developers, reviewing their code, or helping with onboarding.`
    } else if (categoryLower.includes('review') || categoryLower.includes('code review')) {
      return `Participate more actively in code reviews, focusing on architecture and best practices.`
    } else if (categoryLower.includes('design') || categoryLower.includes('architecture')) {
      return `Propose design improvements, lead architecture discussions, or write technical RFCs.`
    } else if (categoryLower.includes('strategy')) {
      return `Contribute to technical strategy discussions and long-term planning initiatives.`
    } else if (categoryLower.includes('coordination') || categoryLower.includes('collaboration')) {
      return `Take on cross-team projects or coordinate with other engineering teams.`
    } else if (categoryLower.includes('documentation')) {
      return `Write technical documentation, API guides, or knowledge sharing articles.`
    } else {
      // Fallback based on dimension
      switch (dimension) {
        case 'input':
          return `Seek out more learning opportunities and knowledge sharing in this area.`
        case 'output':
          return `Focus on delivering concrete results and measurable outcomes.`
        case 'outcome':
          return `Work on initiatives that drive team or product success metrics.`
        case 'impact':
          return `Look for opportunities to influence broader organizational goals.`
        default:
          return `Develop this capability through relevant projects and focused practice.`
      }
    }
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

      {/* Expectation Coverage (Current Level) */}
      {userProfile && analyzeCurrentLevelExpectations().length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Compass className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              🧭 Expectation Coverage ({userProfile.role} L{userProfile.level})
            </h3>
            <span className="ml-2 text-sm text-gray-500">({evaluationPeriod.description})</span>
          </div>
          <div className="space-y-3">
            {analyzeCurrentLevelExpectations().map((analysis, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-shrink-0 mt-1">
                  {analysis.status === 'consistent' ? (
                    <Star className="h-5 w-5 text-yellow-500" />
                  ) : analysis.status === 'evidenced' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <p className="text-gray-900 font-medium">{analysis.expectation}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      analysis.status === 'consistent' ? 'bg-yellow-100 text-yellow-800' :
                      analysis.status === 'evidenced' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {analysis.status === 'consistent' ? '🌟 Consistently evidenced' :
                       analysis.status === 'evidenced' ? '✅ Evidenced' :
                       '⚠️ Not yet evidenced'}
                    </span>
                  </div>
                  {analysis.status === 'not_evidenced' && analysis.matchingCategories.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      → Try logging work in: {analysis.matchingCategories.join(', ')}
                    </p>
                  )}
                  {analysis.status !== 'not_evidenced' && analysis.weeksCovered > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Active in {analysis.weeksCovered} week{analysis.weeksCovered !== 1 ? 's' : ''} recently
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Growth Suggestions (Next Level) */}
      {userProfile && generateGrowthSuggestions().length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Rocket className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              🚀 Growth Suggestions (Next Level: {userProfile.role} L{userProfile.level + 1})
            </h3>
            <span className="ml-2 text-sm text-gray-500">({evaluationPeriod.description})</span>
          </div>
          <div className="space-y-4">
            {generateGrowthSuggestions().map((suggestion, index) => (
              <div key={index} className="p-4 rounded-lg border-l-4 border-purple-400 bg-purple-50">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {suggestion.status === 'emerging' ? (
                      <Star className="h-5 w-5 text-purple-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-gray-900 font-medium">{suggestion.expectation}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        suggestion.status === 'emerging' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {suggestion.status === 'emerging' ? '🌟 Emerging strength' : '⚠️ Growth area'}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{suggestion.suggestion}</p>
                    {suggestion.recommendedCategories.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Focus areas:</span> {suggestion.recommendedCategories.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
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