// Custom Turso HTTP client for serverless environments
interface TursoResponse {
  results?: Array<{
    columns: string[]
    rows: any[][]
  }>
  error?: string
}

interface DatabaseRecord {
  id: string
  name: string
  inputWeight: number
  outputWeight: number
  outcomeWeight: number
  impactWeight: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

class TursoHttpClient {
  private baseUrl: string
  private authToken: string

  constructor(databaseUrl: string, authToken: string) {
    // Convert libsql:// to https:// for HTTP API
    this.baseUrl = databaseUrl.replace('libsql://', 'https://').replace('.turso.io', '.turso.io/v1/execute')
    this.authToken = authToken
  }

  private async executeQuery(sql: string, params: any[] = []): Promise<TursoResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql,
          args: params,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Turso HTTP query failed:', error)
      throw error
    }
  }

  async findManyRoleWeights(): Promise<DatabaseRecord[]> {
    const sql = 'SELECT id, name, inputWeight, outputWeight, outcomeWeight, impactWeight, isActive, createdAt, updatedAt FROM RoleWeights ORDER BY createdAt ASC'
    
    try {
      const result = await this.executeQuery(sql)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0]) {
        return []
      }

      const { columns, rows } = result.results[0]
      
      return rows.map(row => {
        const record: any = {}
        columns.forEach((col, index) => {
          record[col] = row[index]
        })
        return record as DatabaseRecord
      })
    } catch (error) {
      console.error('Error fetching role weights from Turso:', error)
      return []
    }
  }

  async findManyTargets(): Promise<any[]> {
    const sql = 'SELECT id, name, excellentThreshold, goodThreshold, needsImprovementThreshold, timePeriodWeeks, isActive, createdAt, updatedAt FROM PerformanceTarget ORDER BY createdAt DESC'
    
    try {
      const result = await this.executeQuery(sql)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0]) {
        return []
      }

      const { columns, rows } = result.results[0]
      
      return rows.map(row => {
        const record: any = {}
        columns.forEach((col, index) => {
          record[col] = row[index]
        })
        return record
      })
    } catch (error) {
      console.error('Error fetching targets from Turso:', error)
      return []
    }
  }

  async findManyCategories(): Promise<any[]> {
    const sql = 'SELECT id, name, scorePerOccurrence, dimension, description, createdAt, updatedAt FROM Category ORDER BY createdAt ASC'
    
    try {
      const result = await this.executeQuery(sql)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0]) {
        return []
      }

      const { columns, rows } = result.results[0]
      
      return rows.map(row => {
        const record: any = {}
        columns.forEach((col, index) => {
          record[col] = row[index]
        })
        return record
      })
    } catch (error) {
      console.error('Error fetching categories from Turso:', error)
      return []
    }
  }

  async findManyWeeklyLogs(weekFilter?: string[]): Promise<any[]> {
    let sql = 'SELECT id, categoryId, week, count, overrideScore, createdAt FROM WeeklyLog'
    let params: any[] = []
    
    if (weekFilter && weekFilter.length > 0) {
      const placeholders = weekFilter.map(() => '?').join(',')
      sql += ` WHERE week IN (${placeholders})`
      params = weekFilter
    }
    
    sql += ' ORDER BY week DESC'
    
    try {
      const result = await this.executeQuery(sql, params)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0]) {
        return []
      }

      const { columns, rows } = result.results[0]
      
      return rows.map(row => {
        const record: any = {}
        columns.forEach((col, index) => {
          record[col] = row[index]
        })
        return record
      })
    } catch (error) {
      console.error('Error fetching weekly logs from Turso:', error)
      return []
    }
  }
}

export { TursoHttpClient } 