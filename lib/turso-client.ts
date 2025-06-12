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
    // Convert libsql://database-name-org.turso.io to https://database-name-org.turso.io/v1/execute
    this.baseUrl = databaseUrl.replace('libsql://', 'https://') + '/v1/execute'
    this.authToken = authToken
    
    console.log('🌐 Turso HTTP client initialized')
    console.log('📍 Base URL:', this.baseUrl)
  }

  private async executeQuery(sql: string, params: any[] = []): Promise<TursoResponse> {
    try {
      console.log('🔍 Executing query:', sql.substring(0, 100) + '...')
      
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

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ HTTP error:', response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Query successful, rows:', result.results?.[0]?.rows?.length || 0)
      return result
    } catch (error) {
      console.error('❌ Turso HTTP query failed:', error)
      throw error
    }
  }

  async findManyRoleWeights(): Promise<DatabaseRecord[]> {
    const sql = 'SELECT id, name, inputWeight, outputWeight, outcomeWeight, impactWeight, isActive, createdAt, updatedAt FROM RoleWeights ORDER BY createdAt ASC'
    
    try {
      console.log('🔍 Fetching role weights from Turso...')
      const result = await this.executeQuery(sql)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0]) {
        console.log('📭 No role weights found')
        return []
      }

      const { columns, rows } = result.results[0]
      
      const records = rows.map(row => {
        const record: any = {}
        columns.forEach((col, index) => {
          record[col] = row[index]
        })
        return record as DatabaseRecord
      })
      
      console.log('✅ Role weights fetched:', records.length)
      return records
    } catch (error) {
      console.error('❌ Error fetching role weights from Turso:', error)
      return []
    }
  }

  async findManyTargets(): Promise<any[]> {
    const sql = 'SELECT id, name, excellentThreshold, goodThreshold, needsImprovementThreshold, timePeriodWeeks, isActive, createdAt, updatedAt FROM PerformanceTarget ORDER BY createdAt DESC'
    
    try {
      console.log('🔍 Fetching targets from Turso...')
      const result = await this.executeQuery(sql)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0]) {
        console.log('📭 No targets found')
        return []
      }

      const { columns, rows } = result.results[0]
      
      const records = rows.map(row => {
        const record: any = {}
        columns.forEach((col, index) => {
          record[col] = row[index]
        })
        return record
      })
      
      console.log('✅ Targets fetched:', records.length)
      return records
    } catch (error) {
      console.error('❌ Error fetching targets from Turso:', error)
      return []
    }
  }

  async findManyCategories(): Promise<any[]> {
    const sql = 'SELECT id, name, scorePerOccurrence, dimension, description, createdAt, updatedAt FROM Category ORDER BY createdAt ASC'
    
    try {
      console.log('🔍 Fetching categories from Turso...')
      const result = await this.executeQuery(sql)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0]) {
        console.log('📭 No categories found')
        return []
      }

      const { columns, rows } = result.results[0]
      
      const records = rows.map(row => {
        const record: any = {}
        columns.forEach((col, index) => {
          record[col] = row[index]
        })
        return record
      })
      
      console.log('✅ Categories fetched:', records.length)
      return records
    } catch (error) {
      console.error('❌ Error fetching categories from Turso:', error)
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
      console.log('🔍 Fetching weekly logs from Turso...')
      if (weekFilter) {
        console.log('📅 Week filter:', weekFilter.length, 'weeks')
      }
      
      const result = await this.executeQuery(sql, params)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0]) {
        console.log('📭 No weekly logs found')
        return []
      }

      const { columns, rows } = result.results[0]
      
      const records = rows.map(row => {
        const record: any = {}
        columns.forEach((col, index) => {
          record[col] = row[index]
        })
        return record
      })
      
      console.log('✅ Weekly logs fetched:', records.length)
      return records
    } catch (error) {
      console.error('❌ Error fetching weekly logs from Turso:', error)
      return []
    }
  }
}

export { TursoHttpClient } 