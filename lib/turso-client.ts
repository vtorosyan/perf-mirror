// Custom Turso HTTP client for serverless environments
// Updated: 2025-06-12 - Fixed stmt format for Turso API
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

interface CreateRoleWeightData {
  name: string
  inputWeight: number
  outputWeight: number
  outcomeWeight: number
  impactWeight: number
  isActive: boolean
}

class TursoHttpClient {
  private baseUrl: string
  private authToken: string

  constructor(databaseUrl: string, authToken: string) {
    console.log('🔧 TursoHttpClient constructor called')
    console.log('📍 Input database URL:', databaseUrl.substring(0, 30) + '...')
    console.log('🔑 Auth token length:', authToken.length)
    
    // Convert libsql://database-name-org.turso.io to https://database-name-org.turso.io/v2/pipeline
    this.baseUrl = databaseUrl.replace('libsql://', 'https://') + '/v2/pipeline'
    this.authToken = authToken
    
    console.log('🌐 Turso HTTP client initialized')
    console.log('📍 Base URL:', this.baseUrl)
    console.log('🔑 Auth token masked:', authToken.substring(0, 10) + '...' + authToken.substring(authToken.length - 10))
  }

  private async executeQuery(sql: string, params: any[] = []): Promise<TursoResponse> {
    const queryId = Math.random().toString(36).substring(7)
    console.log(`🔍 [${queryId}] Executing query:`, sql.substring(0, 100) + (sql.length > 100 ? '...' : ''))
    console.log(`📊 [${queryId}] Query params:`, params.length, 'parameters')
    
    try {
      // Use the correct Turso v2/pipeline format
      const requestBody = {
        requests: [
          {
            type: "execute",
            stmt: {
              sql: sql,
              args: params.map(param => {
                // Convert parameters to Turso's expected format
                if (typeof param === 'string') {
                  return { type: "text", value: param }
                } else if (typeof param === 'number') {
                  if (Number.isInteger(param)) {
                    return { type: "integer", value: param.toString() }
                  } else {
                    return { type: "float", value: param.toString() }
                  }
                } else if (typeof param === 'boolean') {
                  return { type: "integer", value: param ? "1" : "0" }
                } else if (param === null || param === undefined) {
                  return { type: "null" }
                } else {
                  return { type: "text", value: String(param) }
                }
              })
            }
          },
          {
            type: "close"
          }
        ]
      }
      
      console.log(`🚀 [${queryId}] Making request to:`, this.baseUrl)
      console.log(`📝 [${queryId}] Request body:`, JSON.stringify(requestBody).substring(0, 300) + '...')
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log(`📡 [${queryId}] Response status:`, response.status, response.statusText)
      console.log(`📊 [${queryId}] Response headers:`, Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ [${queryId}] HTTP error:`, response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log(`✅ [${queryId}] Query successful`)
      console.log(`📊 [${queryId}] Response structure:`, {
        hasBaton: !!result.baton,
        hasResults: !!result.results,
        resultCount: result.results?.length || 0
      })
      
      // Extract the actual query result from the v2/pipeline response
      if (result.results && result.results[0] && result.results[0].type === 'ok') {
        const executeResult = result.results[0].response?.result
        if (executeResult) {
          // Convert v2/pipeline format to our expected format
          return {
            results: [{
              columns: executeResult.cols || [],
              rows: executeResult.rows || []
            }]
          }
        }
      }
      
      // Handle error responses
      if (result.results && result.results[0] && result.results[0].type === 'error') {
        const error = result.results[0].error
        console.error(`❌ [${queryId}] Database error:`, error)
        return { error: error.message || 'Database error' }
      }
      
      console.log(`📭 [${queryId}] No data in response`)
      return { results: [{ columns: [], rows: [] }] }
    } catch (error) {
      console.error(`❌ [${queryId}] Turso HTTP query failed:`, error)
      console.error(`❌ [${queryId}] Error details:`, {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  private generateId(): string {
    // Generate a simple ID similar to Prisma's cuid format
    return 'cmbs' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  async findManyRoleWeights(): Promise<DatabaseRecord[]> {
    const sql = 'SELECT ID as id, NAME as name, INPUTWEIGHT as inputWeight, OUTPUTWEIGHT as outputWeight, OUTCOMEWEIGHT as outcomeWeight, IMPACTWEIGHT as impactWeight, ISACTIVE as isActive, CREATEDAT as createdAt, UPDATEDAT as updatedAt FROM RoleWeights ORDER BY CREATEDAT ASC'
    
    try {
      console.log('🔍 findManyRoleWeights: Fetching role weights from Turso...')
      const result = await this.executeQuery(sql)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0]) {
        console.log('📭 findManyRoleWeights: No role weights found')
        return []
      }

      const { columns, rows } = result.results[0]
      console.log('📊 findManyRoleWeights: Processing', rows.length, 'rows with', columns.length, 'columns')
      console.log('📊 findManyRoleWeights: Column names:', columns)
      
      const records = rows.map((row, index) => {
        const record: any = {}
        columns.forEach((col, colIndex) => {
          record[col] = row[colIndex]
        })
        
        // Convert SQLite boolean back to JS boolean
        if (record.isActive !== undefined) {
          record.isActive = record.isActive === 1
        }
        
        console.log(`📝 findManyRoleWeights: Record ${index + 1}:`, {
          id: record.id,
          name: record.name,
          isActive: record.isActive
        })
        return record as DatabaseRecord
      })
      
      console.log('✅ findManyRoleWeights: Role weights fetched successfully:', records.length)
      return records
    } catch (error) {
      console.error('❌ findManyRoleWeights: Error fetching role weights from Turso:', error)
      return []
    }
  }

  async findFirstRoleWeights(): Promise<DatabaseRecord | null> {
    const sql = 'SELECT ID as id, NAME as name, INPUTWEIGHT as inputWeight, OUTPUTWEIGHT as outputWeight, OUTCOMEWEIGHT as outcomeWeight, IMPACTWEIGHT as impactWeight, ISACTIVE as isActive, CREATEDAT as createdAt, UPDATEDAT as updatedAt FROM RoleWeights ORDER BY CREATEDAT ASC LIMIT 1'
    
    try {
      console.log('🔍 findFirstRoleWeights: Fetching first role weight from Turso...')
      const result = await this.executeQuery(sql)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0] || result.results[0].rows.length === 0) {
        console.log('📭 findFirstRoleWeights: No role weights found')
        return null
      }

      const { columns, rows } = result.results[0]
      console.log('📊 findFirstRoleWeights: Processing first record')
      
      const record: any = {}
      columns.forEach((col, colIndex) => {
        record[col] = rows[0][colIndex]
      })
      
      // Convert SQLite boolean back to JS boolean
      if (record.isActive !== undefined) {
        record.isActive = record.isActive === 1
      }
      
      console.log('✅ findFirstRoleWeights: First role weight found:', {
        id: record.id,
        name: record.name,
        isActive: record.isActive
      })
      
      return record as DatabaseRecord
    } catch (error) {
      console.error('❌ findFirstRoleWeights: Error fetching first role weight from Turso:', error)
      return null
    }
  }

  async createRoleWeight(data: CreateRoleWeightData): Promise<DatabaseRecord> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    // First insert the record - using uppercase column names
    const insertSql = `INSERT INTO RoleWeights (ID, NAME, INPUTWEIGHT, OUTPUTWEIGHT, OUTCOMEWEIGHT, IMPACTWEIGHT, ISACTIVE, CREATEDAT, UPDATEDAT) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    
    const insertParams = [
      id,
      data.name,
      data.inputWeight,
      data.outputWeight,
      data.outcomeWeight,
      data.impactWeight,
      data.isActive ? 1 : 0, // SQLite uses 1/0 for boolean
      now,
      now
    ]
    
    try {
      console.log('🔍 createRoleWeight: Creating role weight in Turso...')
      console.log('📝 createRoleWeight: Data:', { id, ...data })
      
      // Execute the insert
      const insertResult = await this.executeQuery(insertSql, insertParams)
      
      if (insertResult.error) {
        throw new Error(insertResult.error)
      }

      console.log('✅ createRoleWeight: Record inserted, now fetching it back...')
      
      // Now fetch the created record - using uppercase column names with aliases
      const selectSql = 'SELECT ID as id, NAME as name, INPUTWEIGHT as inputWeight, OUTPUTWEIGHT as outputWeight, OUTCOMEWEIGHT as outcomeWeight, IMPACTWEIGHT as impactWeight, ISACTIVE as isActive, CREATEDAT as createdAt, UPDATEDAT as updatedAt FROM RoleWeights WHERE ID = ?'
      const selectResult = await this.executeQuery(selectSql, [id])
      
      if (selectResult.error) {
        throw new Error(selectResult.error)
      }

      if (!selectResult.results || !selectResult.results[0] || selectResult.results[0].rows.length === 0) {
        throw new Error('No data returned from SELECT query after INSERT')
      }

      const { columns, rows } = selectResult.results[0]
      const record: any = {}
      columns.forEach((col, colIndex) => {
        record[col] = rows[0][colIndex]
      })
      
      // Convert SQLite boolean back to JS boolean
      if (record.isActive !== undefined) {
        record.isActive = record.isActive === 1
      }
      
      console.log('✅ createRoleWeight: Role weight created successfully:', {
        id: record.id,
        name: record.name,
        isActive: record.isActive
      })
      
      return record as DatabaseRecord
    } catch (error) {
      console.error('❌ createRoleWeight: Error creating role weight in Turso:', error)
      throw error
    }
  }

  async findManyTargets(): Promise<any[]> {
    const sql = 'SELECT id, name, excellentThreshold, goodThreshold, needsImprovementThreshold, timePeriodWeeks, isActive, createdAt, updatedAt FROM PerformanceTarget ORDER BY createdAt DESC'
    
    try {
      console.log('🔍 findManyTargets: Fetching targets from Turso...')
      const result = await this.executeQuery(sql)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0]) {
        console.log('📭 findManyTargets: No targets found')
        return []
      }

      const { columns, rows } = result.results[0]
      console.log('📊 findManyTargets: Processing', rows.length, 'rows with', columns.length, 'columns')
      
      const records = rows.map((row, index) => {
        const record: any = {}
        columns.forEach((col, colIndex) => {
          record[col] = row[colIndex]
        })
        console.log(`📝 findManyTargets: Record ${index + 1}:`, {
          id: record.id,
          name: record.name,
          isActive: record.isActive
        })
        return record
      })
      
      console.log('✅ findManyTargets: Targets fetched successfully:', records.length)
      return records
    } catch (error) {
      console.error('❌ findManyTargets: Error fetching targets from Turso:', error)
      return []
    }
  }

  async findManyCategories(): Promise<any[]> {
    const sql = 'SELECT id, name, scorePerOccurrence, dimension, description, createdAt, updatedAt FROM Category ORDER BY createdAt ASC'
    
    try {
      console.log('🔍 findManyCategories: Fetching categories from Turso...')
      const result = await this.executeQuery(sql)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0]) {
        console.log('📭 findManyCategories: No categories found')
        return []
      }

      const { columns, rows } = result.results[0]
      console.log('📊 findManyCategories: Processing', rows.length, 'rows with', columns.length, 'columns')
      
      const records = rows.map((row, index) => {
        const record: any = {}
        columns.forEach((col, colIndex) => {
          record[col] = row[colIndex]
        })
        console.log(`📝 findManyCategories: Record ${index + 1}:`, {
          id: record.id,
          name: record.name,
          dimension: record.dimension
        })
        return record
      })
      
      console.log('✅ findManyCategories: Categories fetched successfully:', records.length)
      return records
    } catch (error) {
      console.error('❌ findManyCategories: Error fetching categories from Turso:', error)
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
      console.log('🔍 findManyWeeklyLogs: Fetching weekly logs from Turso...')
      if (weekFilter) {
        console.log('📅 findManyWeeklyLogs: Week filter:', weekFilter.length, 'weeks -', weekFilter.slice(0, 5).join(', ') + (weekFilter.length > 5 ? '...' : ''))
      }
      
      const result = await this.executeQuery(sql, params)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0]) {
        console.log('📭 findManyWeeklyLogs: No weekly logs found')
        return []
      }

      const { columns, rows } = result.results[0]
      console.log('📊 findManyWeeklyLogs: Processing', rows.length, 'rows with', columns.length, 'columns')
      
      const records = rows.map((row, index) => {
        const record: any = {}
        columns.forEach((col, colIndex) => {
          record[col] = row[colIndex]
        })
        if (index < 3) { // Log first 3 records for debugging
          console.log(`📝 findManyWeeklyLogs: Record ${index + 1}:`, {
            id: record.id,
            week: record.week,
            categoryId: record.categoryId,
            count: record.count
          })
        }
        return record
      })
      
      console.log('✅ findManyWeeklyLogs: Weekly logs fetched successfully:', records.length)
      return records
    } catch (error) {
      console.error('❌ findManyWeeklyLogs: Error fetching weekly logs from Turso:', error)
      return []
    }
  }
}

export { TursoHttpClient } 