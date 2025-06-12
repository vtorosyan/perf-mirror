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
                // Convert all parameters to strings as Turso HTTP API expects
                if (param === null || param === undefined) {
                  return { type: "null" }
                } else if (typeof param === 'boolean') {
                  return { type: "integer", value: param ? "1" : "0" }
                } else {
                  // Convert everything else to string
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
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ [${queryId}] HTTP error:`, response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      
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
          // Handle case where col might be an object with name property
          const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
          const cellValue = row[colIndex]
          // Extract value from Turso's type wrapper if present
          record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
            ? cellValue.value 
            : cellValue
        })
        
        // Convert SQLite boolean back to JS boolean
        if (record.isActive !== undefined) {
          record.isActive = record.isActive === '1' || record.isActive === 1
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
        // Handle case where col might be an object with name property
        const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
        const cellValue = rows[0][colIndex]
        // Extract value from Turso's type wrapper if present
        record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
          ? cellValue.value 
          : cellValue
      })
      
      // Convert SQLite boolean back to JS boolean
      if (record.isActive !== undefined) {
        record.isActive = record.isActive === '1' || record.isActive === 1
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
        // Handle case where col might be an object with name property
        const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
        record[columnName] = rows[0][colIndex]
      })
      
      // Convert SQLite boolean back to JS boolean
      if (record.isActive !== undefined) {
        record.isActive = record.isActive === '1' || record.isActive === 1
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
          // Handle case where col might be an object with name property
          const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
          record[columnName] = row[colIndex]
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
          // Handle case where col might be an object with name property
          const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
          record[columnName] = row[colIndex]
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
          // Handle case where col might be an object with name property
          const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
          record[columnName] = row[colIndex]
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

  async updateManyRoleWeights(where: any, data: any): Promise<{ count: number }> {
    console.log('🔄 updateManyRoleWeights: Starting bulk update')
    console.log('📝 updateManyRoleWeights: Where:', where, 'Data:', data)
    
    try {
      // Build SET clause first and collect its parameters
      const setClauses: string[] = []
      const setParams: any[] = []
      
      if (data.isActive !== undefined) {
        setClauses.push('ISACTIVE = ?')
        setParams.push(data.isActive ? '1' : '0')
      }
      
      if (setClauses.length === 0) {
        throw new Error('No data provided for update')
      }
      
      // Build WHERE clause and collect its parameters
      const conditions: string[] = []
      const whereParams: any[] = []
      
      if (where.isActive === true) {
        conditions.push('ISACTIVE = ?')
        whereParams.push('1')
      }
      
      if (where.id && where.id.not) {
        conditions.push('ID != ?')
        whereParams.push(where.id.not)
      }
      
      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
      
      // Combine parameters in correct order: SET parameters first, then WHERE parameters
      const params = [...setParams, ...whereParams]
      
      const sql = `UPDATE RoleWeights SET ${setClauses.join(', ')} ${whereClause}`
      console.log('🔍 updateManyRoleWeights: SQL:', sql, 'Params:', params)
      
      const result = await this.executeQuery(sql, params)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      console.log('✅ updateManyRoleWeights: Bulk update completed successfully')
      return { count: 1 } // Turso doesn't return affected rows count, so we return 1
    } catch (error) {
      console.error('❌ updateManyRoleWeights: Error updating role weights in Turso:', error)
      throw error
    }
  }

  async updateRoleWeight(id: string, data: any): Promise<DatabaseRecord> {
    console.log('🔄 updateRoleWeight: Starting update for ID:', id)
    console.log('📝 updateRoleWeight: Data:', data)
    
    try {
      // Build SET clause and params
      const setClauses: string[] = []
      const params: any[] = []
      
      if (data.name !== undefined) {
        setClauses.push('NAME = ?')
        params.push(data.name)
      }
      if (data.inputWeight !== undefined) {
        setClauses.push('INPUTWEIGHT = ?')
        params.push(data.inputWeight.toString())
      }
      if (data.outputWeight !== undefined) {
        setClauses.push('OUTPUTWEIGHT = ?')
        params.push(data.outputWeight.toString())
      }
      if (data.outcomeWeight !== undefined) {
        setClauses.push('OUTCOMEWEIGHT = ?')
        params.push(data.outcomeWeight.toString())
      }
      if (data.impactWeight !== undefined) {
        setClauses.push('IMPACTWEIGHT = ?')
        params.push(data.impactWeight.toString())
      }
      if (data.isActive !== undefined) {
        setClauses.push('ISACTIVE = ?')
        params.push(data.isActive ? '1' : '0')
      }
      
      if (setClauses.length === 0) {
        throw new Error('No data provided for update')
      }
      
      // Add the ID parameter for WHERE clause
      params.push(id)
      
      const updateSql = `UPDATE RoleWeights SET ${setClauses.join(', ')} WHERE ID = ?`
      
      // Execute the update
      const updateResult = await this.executeQuery(updateSql, params)
      
      if (updateResult.error) {
        throw new Error(updateResult.error)
      }
      
      // Fetch and return the updated record
      const selectSql = `SELECT 
        ID as id,
        NAME as name,
        INPUTWEIGHT as inputWeight,
        OUTPUTWEIGHT as outputWeight,
        OUTCOMEWEIGHT as outcomeWeight,
        IMPACTWEIGHT as impactWeight,
        ISACTIVE as isActive,
        CREATEDAT as createdAt,
        UPDATEDAT as updatedAt
      FROM RoleWeights WHERE ID = ?`
      
      const selectResult = await this.executeQuery(selectSql, [id])
      
      if (selectResult.error) {
        throw new Error(selectResult.error)
      }

      if (!selectResult.results || !selectResult.results[0] || selectResult.results[0].rows.length === 0) {
        throw new Error('Role weight not found after update')
      }
      
      const { columns, rows } = selectResult.results[0]
      const record: any = {}
      columns.forEach((col, colIndex) => {
        // Handle case where col might be an object with name property
        const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
        const cellValue = rows[0][colIndex]
        // Extract value from Turso's type wrapper if present
        record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
          ? cellValue.value 
          : cellValue
      })
      
      // Convert SQLite boolean back to JS boolean
      if (record.isActive !== undefined) {
        record.isActive = record.isActive === '1' || record.isActive === 1
      }
      
      console.log('✅ updateRoleWeight: Successfully updated role weight:', record.id)
      return record as DatabaseRecord
    } catch (error) {
      console.error('❌ updateRoleWeight: Error updating role weight in Turso:', error)
      throw error
    }
  }
}

export { TursoHttpClient } 