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