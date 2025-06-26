import { clsx, type ClassValue } from 'clsx'
import { format, getWeek, getYear, startOfWeek, addWeeks } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function getWeekString(date: Date): string {
  const year = getYear(date)
  const week = getWeek(date, { weekStartsOn: 1 }) // Monday start
  return `${year}-W${week.toString().padStart(2, '0')}`
}

export function getWeekStartDate(weekString: string): Date {
  const [year, weekPart] = weekString.split('-W')
  const weekNumber = parseInt(weekPart)
  
  // Get the first day of the year
  const firstDayOfYear = new Date(parseInt(year), 0, 1)
  
  // Calculate the start of the target week
  const targetWeek = addWeeks(startOfWeek(firstDayOfYear, { weekStartsOn: 1 }), weekNumber - 1)
  
  return targetWeek
}

export function formatWeekString(weekString: string): string {
  const weekStart = getWeekStartDate(weekString)
  return format(weekStart, 'MMM d, yyyy')
}

export function getCurrentWeekString(): string {
  return getWeekString(new Date())
}

export function getPreviousWeeks(count: number): string[] {
  const weeks: string[] = []
  const currentDate = new Date()
  
  for (let i = 0; i < count; i++) {
    const weekDate = addWeeks(currentDate, -i)
    weeks.push(getWeekString(weekDate))
  }
  
  return weeks.reverse()
}

// Dimension scoring utilities
export interface DimensionScore {
  input: number
  output: number
  outcome: number
  impact: number
}

export interface RoleWeights {
  id?: string
  name?: string
  inputWeight: number
  outputWeight: number
  outcomeWeight: number
  impactWeight: number
  isActive?: boolean
}

// Helper function to safely extract values
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

export function calculateDimensionScores(logs: any[]): DimensionScore {
  const dimensions = { input: 0, output: 0, outcome: 0, impact: 0 }
  
  logs.forEach(log => {
    if (!log.category) return
    
    const safeCount = Number(safeValue(log.count)) || 0
    const safeScorePerOccurrence = Number(safeValue(log.category.scorePerOccurrence)) || 0
    const safeOverrideScore = log.overrideScore !== undefined ? Number(safeValue(log.overrideScore)) : undefined
    const safeDimension = safeValue(log.category.dimension) as string
    
    const score = safeOverrideScore ?? (safeCount * safeScorePerOccurrence)
    
    if (safeDimension && dimensions.hasOwnProperty(safeDimension)) {
      dimensions[safeDimension as keyof DimensionScore] += score
    }
  })
  
  return dimensions
}

export function calculateWeightedScore(dimensionScores: DimensionScore, weights: RoleWeights): number {
  // Add safety checks for undefined weights to prevent NaN
  const safeWeights = {
    inputWeight: weights?.inputWeight ?? 0,
    outputWeight: weights?.outputWeight ?? 0,
    outcomeWeight: weights?.outcomeWeight ?? 0,
    impactWeight: weights?.impactWeight ?? 0,
  }
  
  const safeDimensions = {
    input: dimensionScores?.input ?? 0,
    output: dimensionScores?.output ?? 0,
    outcome: dimensionScores?.outcome ?? 0,
    impact: dimensionScores?.impact ?? 0,
  }
  
  return (
    safeDimensions.input * safeWeights.inputWeight +
    safeDimensions.output * safeWeights.outputWeight +
    safeDimensions.outcome * safeWeights.outcomeWeight +
    safeDimensions.impact * safeWeights.impactWeight
  )
}

export function getDimensionLabel(dimension: string): string {
  const labels = {
    input: 'Input',
    output: 'Output', 
    outcome: 'Outcome',
    impact: 'Impact'
  }
  return labels[dimension as keyof typeof labels] || dimension
}

export function getDimensionColor(dimension: string): string {
  const colors = {
    input: 'bg-blue-100 text-blue-800',
    output: 'bg-green-100 text-green-800',
    outcome: 'bg-purple-100 text-purple-800',
    impact: 'bg-orange-100 text-orange-800'
  }
  return colors[dimension as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export function generateInsights(dimensionScores: DimensionScore, weights: RoleWeights): string[] {
  const insights: string[] = []
  const total = dimensionScores.input + dimensionScores.output + dimensionScores.outcome + dimensionScores.impact
  
  if (total === 0) {
    return ['No activity logged this week']
  }
  
  // Calculate percentages with safety check for division by zero
  const percentages = {
    input: total > 0 ? (dimensionScores.input / total) * 100 : 0,
    output: total > 0 ? (dimensionScores.output / total) * 100 : 0,
    outcome: total > 0 ? (dimensionScores.outcome / total) * 100 : 0,
    impact: total > 0 ? (dimensionScores.impact / total) * 100 : 0
  }
  
  // High input, low outcome pattern
  if (percentages.input > 40 && percentages.outcome < 15) {
    insights.push('High input, low outcome pattern detected - consider focusing more on deliverable results')
  }
  
  // High output, low impact
  if (percentages.output > 50 && percentages.impact < 10) {
    insights.push('Strong output focus - consider initiatives with higher strategic impact')
  }
  
  // Balanced distribution
  if (Math.max(...Object.values(percentages)) < 40) {
    insights.push('Well-balanced activity distribution across all dimensions')
  }
  
  // Impact-heavy (good for senior roles)
  if (percentages.impact > 30) {
    insights.push('Strong focus on high-impact activities - excellent for senior roles')
  }
  
  // Identify strongest dimension
  const strongest = Object.entries(percentages).reduce((a, b) => percentages[a[0] as keyof typeof percentages] > percentages[b[0] as keyof typeof percentages] ? a : b)[0]
  insights.push(`Primary focus area: ${getDimensionLabel(strongest)} (${percentages[strongest as keyof typeof percentages].toFixed(0)}% of activity)`)
  
  return insights
}

// Enhanced evaluation types and functions for role-level system
export interface CategoryExpectation {
  categoryName: string
  dimension: string
  expectedWeeklyCount: number
  scorePerOccurrence: number
}

export interface PerformanceComparison {
  categoryName: string
  dimension: string
  actual: number
  expected: number
  actualScore: number
  expectedScore: number
  performance: 'over' | 'met' | 'under' | 'none'
}

export interface PerformanceBandResult {
  band: 'Outstanding' | 'Strong Performance' | 'Meeting Expectations' | 'Partially Meeting Expectations' | 'Underperforming' | 'No Data'
  percentage: number
  totalActual: number
  totalExpected: number
  categoriesOverPerforming: number
  categoriesMeeting: number
  categoriesUnderPerforming: number
  categoriesNoActivity: number
}

export function calculatePerformanceComparison(
  actualLogs: any[],
  expectations: CategoryExpectation[]
): PerformanceComparison[] {
  const comparisons: PerformanceComparison[] = []
  
  expectations.forEach(expectation => {
    const actualLog = actualLogs.find(log => 
      log.category && log.category.name === expectation.categoryName
    )
    
    const actualCount = actualLog ? Number(safeValue(actualLog.count)) || 0 : 0
    const actualScore = actualLog 
      ? (actualLog.overrideScore !== undefined 
          ? Number(safeValue(actualLog.overrideScore)) 
          : actualCount * Number(safeValue(actualLog.category?.scorePerOccurrence || 0)))
      : 0
    
    const expectedScore = expectation.expectedWeeklyCount * expectation.scorePerOccurrence
    
    let performance: 'over' | 'met' | 'under' | 'none' = 'none'
    if (actualCount === 0) {
      performance = 'none'
    } else if (actualCount >= expectation.expectedWeeklyCount * 1.15) {
      performance = 'over'
    } else if (actualCount >= expectation.expectedWeeklyCount * 0.85) {
      performance = 'met'
    } else {
      performance = 'under'
    }
    
    comparisons.push({
      categoryName: expectation.categoryName,
      dimension: expectation.dimension,
      actual: actualCount,
      expected: expectation.expectedWeeklyCount,
      actualScore,
      expectedScore,
      performance
    })
  })
  
  return comparisons
}

export function calculatePerformanceBand(comparisons: PerformanceComparison[]): PerformanceBandResult {
  if (comparisons.length === 0) {
    return {
      band: 'No Data',
      percentage: 0,
      totalActual: 0,
      totalExpected: 0,
      categoriesOverPerforming: 0,
      categoriesMeeting: 0,
      categoriesUnderPerforming: 0,
      categoriesNoActivity: 0
    }
  }
  
  const totalActual = comparisons.reduce((sum, comp) => sum + comp.actualScore, 0)
  const totalExpected = comparisons.reduce((sum, comp) => sum + comp.expectedScore, 0)
  
  const categoriesOverPerforming = comparisons.filter(c => c.performance === 'over').length
  const categoriesMeeting = comparisons.filter(c => c.performance === 'met').length
  const categoriesUnderPerforming = comparisons.filter(c => c.performance === 'under').length
  const categoriesNoActivity = comparisons.filter(c => c.performance === 'none').length
  
  const percentage = totalExpected > 0 ? (totalActual / totalExpected) * 100 : 0
  
  let band: PerformanceBandResult['band'] = 'No Data'
  
  if (totalActual === 0) {
    band = 'No Data'
  } else if (percentage >= 150) {
    band = 'Outstanding'
  } else if (percentage >= 115) {
    band = 'Strong Performance'
  } else if (percentage >= 85) {
    band = 'Meeting Expectations'
  } else if (percentage >= 70) {
    band = 'Partially Meeting Expectations'
  } else {
    band = 'Underperforming'
  }
  
  return {
    band,
    percentage,
    totalActual,
    totalExpected,
    categoriesOverPerforming,
    categoriesMeeting,
    categoriesUnderPerforming,
    categoriesNoActivity
  }
}

export function getPerformanceBandColor(band: PerformanceBandResult['band']): string {
  switch (band) {
    case 'Outstanding': return 'bg-green-100 text-green-800 border-green-300'
    case 'Strong Performance': return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'Meeting Expectations': return 'bg-gray-100 text-gray-800 border-gray-300'
    case 'Partially Meeting Expectations': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'Underperforming': return 'bg-red-100 text-red-800 border-red-300'
    default: return 'bg-gray-100 text-gray-600 border-gray-300'
  }
}

export function generateEnhancedInsights(
  comparisons: PerformanceComparison[],
  performanceBand: PerformanceBandResult,
  userProfile?: { role: string; level: number }
): string[] {
  const insights: string[] = []
  
  if (comparisons.length === 0) {
    insights.push('Set up your role and level to get personalized insights')
    return insights
  }
  
  // Overall performance insight
  if (performanceBand.band === 'Outstanding') {
    insights.push(`Exceptional performance! You're achieving ${performanceBand.percentage.toFixed(0)}% of expected activity levels.`)
  } else if (performanceBand.band === 'Strong Performance') {
    insights.push(`Strong performance at ${performanceBand.percentage.toFixed(0)}% of expected levels. You're exceeding expectations in key areas.`)
  } else if (performanceBand.band === 'Meeting Expectations') {
    insights.push(`Good work! You're meeting expectations at ${performanceBand.percentage.toFixed(0)}% of expected activity levels.`)
  } else if (performanceBand.band === 'Partially Meeting Expectations') {
    insights.push(`Some areas need attention. You're at ${performanceBand.percentage.toFixed(0)}% of expected levels with mixed performance across categories.`)
  } else if (performanceBand.band === 'Underperforming') {
    insights.push(`Focus needed: you're at ${performanceBand.percentage.toFixed(0)}% of expected levels. Consider prioritizing key activities.`)
  }
  
  // Category-specific insights
  if (performanceBand.categoriesOverPerforming > 0) {
    const overPerformingCategories = comparisons.filter(c => c.performance === 'over').map(c => c.categoryName)
    insights.push(`Excelling in: ${overPerformingCategories.slice(0, 3).join(', ')}${overPerformingCategories.length > 3 ? ' and others' : ''}`)
  }
  
  if (performanceBand.categoriesUnderPerforming > 0) {
    const underPerformingCategories = comparisons.filter(c => c.performance === 'under').map(c => c.categoryName)
    insights.push(`Consider increasing: ${underPerformingCategories.slice(0, 3).join(', ')}${underPerformingCategories.length > 3 ? ' and others' : ''}`)
  }
  
  if (performanceBand.categoriesNoActivity > 0) {
    const noActivityCategories = comparisons.filter(c => c.performance === 'none').map(c => c.categoryName)
    insights.push(`No activity logged for: ${noActivityCategories.slice(0, 3).join(', ')}${noActivityCategories.length > 3 ? ' and others' : ''}`)
  }
  
  // Role-specific insights
  if (userProfile) {
    if (userProfile.role === 'IC' && userProfile.level >= 5) {
      const impactActivities = comparisons.filter(c => c.dimension === 'impact')
      if (impactActivities.some(a => a.performance === 'under' || a.performance === 'none')) {
        insights.push('As a senior IC, consider increasing focus on high-impact activities that drive strategic outcomes.')
      }
    }
    
    if (userProfile.role === 'Manager') {
      const inputActivities = comparisons.filter(c => c.dimension === 'input')
      if (inputActivities.some(a => a.performance === 'under' || a.performance === 'none')) {
        insights.push('As a manager, ensure you\'re maintaining regular input activities like 1:1s and team development.')
      }
    }
  }
  
  return insights
} 