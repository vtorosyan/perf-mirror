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
  role?: string
  level?: number
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
  role?: string
  level?: number
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
    const sql = 'SELECT ID as id, NAME as name, ROLE as role, LEVEL as level, INPUTWEIGHT as inputWeight, OUTPUTWEIGHT as outputWeight, OUTCOMEWEIGHT as outcomeWeight, IMPACTWEIGHT as impactWeight, ISACTIVE as isActive, CREATEDAT as createdAt, UPDATEDAT as updatedAt FROM RoleWeights ORDER BY ROLE ASC, LEVEL ASC, CREATEDAT ASC'
    
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
    const insertSql = `INSERT INTO RoleWeights (ID, NAME, ROLE, LEVEL, INPUTWEIGHT, OUTPUTWEIGHT, OUTCOMEWEIGHT, IMPACTWEIGHT, ISACTIVE, CREATEDAT, UPDATEDAT) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    
    const insertParams = [
      id,
      data.name,
      data.role || null,
      data.level || null,
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
      const selectSql = 'SELECT ID as id, NAME as name, ROLE as role, LEVEL as level, INPUTWEIGHT as inputWeight, OUTPUTWEIGHT as outputWeight, OUTCOMEWEIGHT as outcomeWeight, IMPACTWEIGHT as impactWeight, ISACTIVE as isActive, CREATEDAT as createdAt, UPDATEDAT as updatedAt FROM RoleWeights WHERE ID = ?'
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
        const cellValue = rows[0][colIndex]
        // Transform Turso's {type, value} format to simple values
        record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
          ? cellValue.value 
          : cellValue
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
    const sql = 'SELECT id, name, role, level, outstandingThreshold, strongThreshold, meetingThreshold, partialThreshold, underperformingThreshold, timePeriodWeeks, isActive, createdAt, updatedAt FROM PerformanceTarget ORDER BY role ASC, level ASC, createdAt DESC'
    
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
          const cellValue = row[colIndex]
          // Transform Turso's {type, value} format to simple values
          record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
            ? cellValue.value 
            : cellValue
        })
        
        // Convert SQLite boolean back to JS boolean
        if (record.isActive !== undefined) {
          record.isActive = record.isActive === '1' || record.isActive === 1
        }
        
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
          const cellValue = row[colIndex]
          // Transform Turso's {type, value} format to simple values
          record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
            ? cellValue.value 
            : cellValue
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
    let sql = 'SELECT wl.id, wl.categoryId, wl.week, wl.count, wl.overrideScore, wl.reference, wl.createdAt, c.id as cat_id, c.name as cat_name, c.scorePerOccurrence as cat_scorePerOccurrence, c.dimension as cat_dimension, c.description as cat_description, c.createdAt as cat_createdAt, c.updatedAt as cat_updatedAt FROM WeeklyLog wl LEFT JOIN Category c ON wl.categoryId = c.id'
    let params: any[] = []
    
    if (weekFilter && weekFilter.length > 0) {
      const placeholders = weekFilter.map(() => '?').join(',')
      sql += ` WHERE wl.week IN (${placeholders})`
      params = weekFilter
    }
    
    sql += ' ORDER BY wl.week DESC'
    
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
          const cellValue = row[colIndex]
          // Transform Turso's {type, value} format to simple values
          record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
            ? cellValue.value 
            : cellValue
        })
        
        // Transform to match Prisma structure with nested category
        const transformedRecord = {
          id: record.id,
          categoryId: record.categoryId,
          week: record.week,
          count: parseInt(record.count) || 0,
          overrideScore: record.overrideScore ? parseInt(record.overrideScore) : null,
          reference: record.reference || null,
          createdAt: record.createdAt,
          category: record.cat_id ? {
            id: record.cat_id,
            name: record.cat_name,
            scorePerOccurrence: parseInt(record.cat_scorePerOccurrence) || 0,
            dimension: record.cat_dimension,
            description: record.cat_description,
            createdAt: record.cat_createdAt,
            updatedAt: record.cat_updatedAt
          } : null
        }
        
        if (index < 3) { // Log first 3 records for debugging
          console.log(`📝 findManyWeeklyLogs: Record ${index + 1}:`, {
            id: transformedRecord.id,
            week: transformedRecord.week,
            categoryId: transformedRecord.categoryId,
            count: transformedRecord.count,
            hasCategory: !!transformedRecord.category
          })
        }
        return transformedRecord
      })
      
      console.log('✅ findManyWeeklyLogs: Weekly logs fetched successfully:', records.length)
      return records
    } catch (error) {
      console.error('❌ findManyWeeklyLogs: Error fetching weekly logs from Turso:', error)
      return []
    }
  }

  async createCategory(data: any): Promise<any> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    const insertSql = `INSERT INTO Category (id, name, scorePerOccurrence, dimension, description, createdAt, updatedAt) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)`
    
    const insertParams = [
      id,
      data.name,
      data.scorePerOccurrence,
      data.dimension,
      data.description || null,
      now,
      now
    ]
    
    try {
      console.log('🔍 createCategory: Creating category in Turso...')
      console.log('📝 createCategory: Data:', { id, ...data })
      
      const insertResult = await this.executeQuery(insertSql, insertParams)
      
      if (insertResult.error) {
        throw new Error(insertResult.error)
      }

      console.log('✅ createCategory: Record inserted, now fetching it back...')
      
      const selectSql = 'SELECT id, name, scorePerOccurrence, dimension, description, createdAt, updatedAt FROM Category WHERE id = ?'
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
        const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
        const cellValue = rows[0][colIndex]
        // Transform Turso's {type, value} format to simple values
        record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
          ? cellValue.value 
          : cellValue
      })
      
      console.log('✅ createCategory: Category created successfully:', record.id)
      return record
    } catch (error) {
      console.error('❌ createCategory: Error creating category in Turso:', error)
      throw error
    }
  }

  async createTarget(data: any): Promise<any> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    const insertSql = `INSERT INTO PerformanceTarget (id, name, role, level, outstandingThreshold, strongThreshold, meetingThreshold, partialThreshold, underperformingThreshold, timePeriodWeeks, isActive, createdAt, updatedAt) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    
    const insertParams = [
      id,
      data.name,
      data.role,
      data.level,
      data.outstandingThreshold,
      data.strongThreshold,
      data.meetingThreshold,
      data.partialThreshold,
      data.underperformingThreshold,
      data.timePeriodWeeks,
      data.isActive ? 1 : 0,
      now,
      now
    ]
    
    try {
      console.log('🔍 createTarget: Creating target in Turso...')
      console.log('📝 createTarget: Data:', { id, ...data })
      
      const insertResult = await this.executeQuery(insertSql, insertParams)
      
      if (insertResult.error) {
        throw new Error(insertResult.error)
      }

      console.log('✅ createTarget: Record inserted, now fetching it back...')
      
      const selectSql = 'SELECT id, name, role, level, outstandingThreshold, strongThreshold, meetingThreshold, partialThreshold, underperformingThreshold, timePeriodWeeks, isActive, createdAt, updatedAt FROM PerformanceTarget WHERE id = ?'
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
        const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
        const cellValue = rows[0][colIndex]
        record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
          ? cellValue.value 
          : cellValue
      })
      
      // Convert SQLite boolean back to JS boolean
      if (record.isActive !== undefined) {
        record.isActive = record.isActive === '1' || record.isActive === 1
      }
      
      console.log('✅ createTarget: Target created successfully:', record.id)
      return record
    } catch (error) {
      console.error('❌ createTarget: Error creating target in Turso:', error)
      throw error
    }
  }

  async deleteCategory(id: string): Promise<void> {
    console.log('🗑️ deleteCategory: Deleting category with ID:', id)
    
    try {
      const deleteSql = 'DELETE FROM Category WHERE id = ?'
      const result = await this.executeQuery(deleteSql, [id])
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      console.log('✅ deleteCategory: Category deleted successfully')
    } catch (error) {
      console.error('❌ deleteCategory: Error deleting category from Turso:', error)
      throw error
    }
  }

  async deleteTarget(id: string): Promise<void> {
    console.log('🗑️ deleteTarget: Deleting target with ID:', id)
    
    try {
      const deleteSql = 'DELETE FROM PerformanceTarget WHERE id = ?'
      const result = await this.executeQuery(deleteSql, [id])
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      console.log('✅ deleteTarget: Target deleted successfully')
    } catch (error) {
      console.error('❌ deleteTarget: Error deleting target from Turso:', error)
      throw error
    }
  }

  async deleteRoleWeight(id: string): Promise<void> {
    console.log('🗑️ deleteRoleWeight: Deleting role weight with ID:', id)
    
    try {
      const deleteSql = 'DELETE FROM RoleWeights WHERE ID = ?'
      const result = await this.executeQuery(deleteSql, [id])
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      console.log('✅ deleteRoleWeight: Role weight deleted successfully')
    } catch (error) {
      console.error('❌ deleteRoleWeight: Error deleting role weight from Turso:', error)
      throw error
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
      if (data.role !== undefined) {
        setClauses.push('ROLE = ?')
        params.push(data.role)
      }
      if (data.level !== undefined) {
        setClauses.push('LEVEL = ?')
        params.push(data.level)
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
        ROLE as role,
        LEVEL as level,
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

  async updateTarget(id: string, data: any): Promise<any> {
    console.log('🔄 updateTarget: Starting update for ID:', id)
    console.log('📝 updateTarget: Data:', data)
    
    try {
      const setClauses: string[] = []
      const params: any[] = []
      
      if (data.name !== undefined) {
        setClauses.push('name = ?')
        params.push(data.name)
      }
      if (data.role !== undefined) {
        setClauses.push('role = ?')
        params.push(data.role)
      }
      if (data.level !== undefined) {
        setClauses.push('level = ?')
        params.push(data.level)
      }
      if (data.outstandingThreshold !== undefined) {
        setClauses.push('outstandingThreshold = ?')
        params.push(data.outstandingThreshold)
      }
      if (data.strongThreshold !== undefined) {
        setClauses.push('strongThreshold = ?')
        params.push(data.strongThreshold)
      }
      if (data.meetingThreshold !== undefined) {
        setClauses.push('meetingThreshold = ?')
        params.push(data.meetingThreshold)
      }
      if (data.partialThreshold !== undefined) {
        setClauses.push('partialThreshold = ?')
        params.push(data.partialThreshold)
      }
      if (data.underperformingThreshold !== undefined) {
        setClauses.push('underperformingThreshold = ?')
        params.push(data.underperformingThreshold)
      }
      if (data.timePeriodWeeks !== undefined) {
        setClauses.push('timePeriodWeeks = ?')
        params.push(data.timePeriodWeeks)
      }
      if (data.isActive !== undefined) {
        setClauses.push('isActive = ?')
        params.push(data.isActive ? 1 : 0)
      }
      
      if (setClauses.length === 0) {
        throw new Error('No data provided for update')
      }
      
      setClauses.push('updatedAt = ?')
      params.push(new Date().toISOString())
      params.push(id)
      
      const updateSql = `UPDATE PerformanceTarget SET ${setClauses.join(', ')} WHERE id = ?`
      const updateResult = await this.executeQuery(updateSql, params)
      
      if (updateResult.error) {
        throw new Error(updateResult.error)
      }
      
      // Fetch and return the updated record
      const selectSql = 'SELECT id, name, role, level, outstandingThreshold, strongThreshold, meetingThreshold, partialThreshold, underperformingThreshold, timePeriodWeeks, isActive, createdAt, updatedAt FROM PerformanceTarget WHERE id = ?'
      const selectResult = await this.executeQuery(selectSql, [id])
      
      if (selectResult.error) {
        throw new Error(selectResult.error)
      }

      if (!selectResult.results || !selectResult.results[0] || selectResult.results[0].rows.length === 0) {
        throw new Error('Target not found after update')
      }
      
      const { columns, rows } = selectResult.results[0]
      const record: any = {}
      columns.forEach((col, colIndex) => {
        const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
        const cellValue = rows[0][colIndex]
        record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
          ? cellValue.value 
          : cellValue
      })
      
      // Convert SQLite boolean back to JS boolean
      if (record.isActive !== undefined) {
        record.isActive = record.isActive === '1' || record.isActive === 1
      }
      
      console.log('✅ updateTarget: Successfully updated target:', record.id)
      return record
    } catch (error) {
      console.error('❌ updateTarget: Error updating target in Turso:', error)
      throw error
    }
  }

  async updateManyTargets(where: any, data: any): Promise<{ count: number }> {
    console.log('🔄 updateManyTargets: Starting bulk update')
    console.log('📝 updateManyTargets: Where:', where, 'Data:', data)
    
    try {
      const setClauses: string[] = []
      const setParams: any[] = []
      
      if (data.isActive !== undefined) {
        setClauses.push('isActive = ?')
        setParams.push(data.isActive ? 1 : 0)
      }
      
      if (setClauses.length === 0) {
        throw new Error('No data provided for update')
      }
      
      setClauses.push('updatedAt = ?')
      setParams.push(new Date().toISOString())
      
      // Build WHERE clause and collect its parameters
      const conditions: string[] = []
      const whereParams: any[] = []
      
      if (where.isActive === true) {
        conditions.push('isActive = ?')
        whereParams.push(1)
      }
      
      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
      const params = [...setParams, ...whereParams]
      
      const sql = `UPDATE PerformanceTarget SET ${setClauses.join(', ')} ${whereClause}`
      console.log('🔍 updateManyTargets: SQL:', sql, 'Params:', params)
      
      const result = await this.executeQuery(sql, params)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      console.log('✅ updateManyTargets: Bulk update completed successfully')
      return { count: 1 }
    } catch (error) {
      console.error('❌ updateManyTargets: Error updating targets in Turso:', error)
      throw error
    }
  }

  async updateCategory(id: string, data: any): Promise<any> {
    console.log('🔄 updateCategory: Starting update for ID:', id)
    console.log('📝 updateCategory: Data:', data)
    
    try {
      const setClauses: string[] = []
      const params: any[] = []
      
      if (data.name !== undefined) {
        setClauses.push('name = ?')
        params.push(data.name)
      }
      if (data.scorePerOccurrence !== undefined) {
        setClauses.push('scorePerOccurrence = ?')
        params.push(data.scorePerOccurrence)
      }
      if (data.dimension !== undefined) {
        setClauses.push('dimension = ?')
        params.push(data.dimension)
      }
      if (data.description !== undefined) {
        setClauses.push('description = ?')
        params.push(data.description || null)
      }
      
      if (setClauses.length === 0) {
        throw new Error('No data provided for update')
      }
      
      setClauses.push('updatedAt = ?')
      params.push(new Date().toISOString())
      params.push(id)
      
      const updateSql = `UPDATE Category SET ${setClauses.join(', ')} WHERE id = ?`
      const updateResult = await this.executeQuery(updateSql, params)
      
      if (updateResult.error) {
        throw new Error(updateResult.error)
      }
      
      // Fetch and return the updated record
      const selectSql = 'SELECT id, name, scorePerOccurrence, dimension, description, createdAt, updatedAt FROM Category WHERE id = ?'
      const selectResult = await this.executeQuery(selectSql, [id])
      
      if (selectResult.error) {
        throw new Error(selectResult.error)
      }

      if (!selectResult.results || !selectResult.results[0] || selectResult.results[0].rows.length === 0) {
        throw new Error('Category not found after update')
      }
      
      const { columns, rows } = selectResult.results[0]
      const record: any = {}
      columns.forEach((col, colIndex) => {
        const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
        const cellValue = rows[0][colIndex]
        record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
          ? cellValue.value 
          : cellValue
      })
      
      console.log('✅ updateCategory: Successfully updated category:', record.id)
      return record
    } catch (error) {
      console.error('❌ updateCategory: Error updating category in Turso:', error)
      throw error
    }
  }

  async upsertWeeklyLog(data: { categoryId: string; week: string; count: number; overrideScore?: number; reference?: string }): Promise<any> {
    console.log('🔄 upsertWeeklyLog: Starting upsert for week:', data.week)
    console.log('📝 upsertWeeklyLog: Data:', data)
    
    try {
      // First, try to find existing log
      const checkSql = 'SELECT id FROM WeeklyLog WHERE categoryId = ? AND week = ?'
      const checkResult = await this.executeQuery(checkSql, [data.categoryId, data.week])
      
      if (checkResult.error) {
        throw new Error(checkResult.error)
      }

      const existingLog = checkResult.results?.[0]?.rows?.[0]
      
      if (existingLog) {
        // Update existing log
        console.log('📝 upsertWeeklyLog: Updating existing log')
        const updateSql = 'UPDATE WeeklyLog SET count = ?, overrideScore = ?, reference = ? WHERE categoryId = ? AND week = ?'
        const updateParams = [data.count, data.overrideScore || null, data.reference || null, data.categoryId, data.week]
        
        const updateResult = await this.executeQuery(updateSql, updateParams)
        if (updateResult.error) {
          throw new Error(updateResult.error)
        }
      } else {
        // Create new log
        console.log('📝 upsertWeeklyLog: Creating new log')
        const id = this.generateId()
        const insertSql = 'INSERT INTO WeeklyLog (id, categoryId, week, count, overrideScore, reference, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
        const insertParams = [id, data.categoryId, data.week, data.count, data.overrideScore || null, data.reference || null, new Date().toISOString()]
        
        const insertResult = await this.executeQuery(insertSql, insertParams)
        if (insertResult.error) {
          throw new Error(insertResult.error)
        }
      }
      
      // Fetch and return the final record
      const selectSql = 'SELECT id, categoryId, week, count, overrideScore, reference, createdAt FROM WeeklyLog WHERE categoryId = ? AND week = ?'
      const selectResult = await this.executeQuery(selectSql, [data.categoryId, data.week])
      
      if (selectResult.error) {
        throw new Error(selectResult.error)
      }

      if (!selectResult.results || !selectResult.results[0] || selectResult.results[0].rows.length === 0) {
        throw new Error('Weekly log not found after upsert')
      }
      
      const { columns, rows } = selectResult.results[0]
      const record: any = {}
      columns.forEach((col, colIndex) => {
        const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
        const cellValue = rows[0][colIndex]
        record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
          ? cellValue.value 
          : cellValue
      })
      
      console.log('✅ upsertWeeklyLog: Successfully upserted weekly log:', record.id)
      return record
    } catch (error) {
      console.error('❌ upsertWeeklyLog: Error upserting weekly log in Turso:', error)
      throw error
    }
  }

  async findManyCategoryTemplates(filters?: { role?: string; level?: number }): Promise<any[]> {
    console.log('🔍 findManyCategoryTemplates: Fetching category templates from Turso...')
    console.log('📝 findManyCategoryTemplates: Filters:', filters)
    
    try {
      const conditions: string[] = []
      const params: any[] = []
      
      if (filters?.role) {
        conditions.push('role = ?')
        params.push(filters.role)
      }
      
      if (filters?.level !== undefined) {
        conditions.push('level = ?')
        params.push(filters.level)
      }
      
      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
      const sql = `SELECT id, role, level, categoryName, dimension, scorePerOccurrence, expectedWeeklyCount, description, createdAt, updatedAt FROM CategoryTemplate ${whereClause} ORDER BY dimension ASC, categoryName ASC`
      
      const result = await this.executeQuery(sql, params)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0]) {
        console.log('📭 findManyCategoryTemplates: No category templates found')
        return []
      }

      const { columns, rows } = result.results[0]
      console.log('📊 findManyCategoryTemplates: Processing', rows.length, 'rows with', columns.length, 'columns')
      
      const records = rows.map((row, index) => {
        const record: any = {}
        columns.forEach((col, colIndex) => {
          const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
          const cellValue = row[colIndex]
          record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
            ? cellValue.value 
            : cellValue
        })
        
        // Convert level to number
        if (record.level !== undefined) {
          record.level = parseInt(record.level)
        }
        
        // Convert scorePerOccurrence to number
        if (record.scorePerOccurrence !== undefined) {
          record.scorePerOccurrence = parseInt(record.scorePerOccurrence)
        }
        
        // Convert expectedWeeklyCount to number
        if (record.expectedWeeklyCount !== undefined) {
          record.expectedWeeklyCount = parseFloat(record.expectedWeeklyCount)
        }
        
        return record
      })
      
      console.log('✅ findManyCategoryTemplates: Category templates fetched successfully:', records.length)
      return records
    } catch (error) {
      console.error('❌ findManyCategoryTemplates: Error fetching category templates from Turso:', error)
      return []
    }
  }

  async upsertCategoryTemplate(data: {
    role: string;
    level: number;
    categoryName: string;
    dimension: string;
    scorePerOccurrence: number;
    expectedWeeklyCount: number;
    description?: string;
  }): Promise<any> {
    const id = `tpl_${data.role}_${data.level}_${data.categoryName.replace(/\s+/g, '_')}_${Date.now()}`
    
    // Check if template exists
    const existingCheckSql = 'SELECT ID FROM CategoryTemplate WHERE ROLE = ? AND LEVEL = ? AND CATEGORYNAME = ?'
    const existingResult = await this.executeQuery(existingCheckSql, [data.role, data.level, data.categoryName])
    
    let sql: string
    let params: any[]
    
    if (existingResult.results && existingResult.results[0] && existingResult.results[0].rows.length > 0) {
      // Update existing
      sql = `UPDATE CategoryTemplate 
             SET DIMENSION = ?, SCOREPEROCCURRENCE = ?, EXPECTEDWEEKLYCOUNT = ?, DESCRIPTION = ?, UPDATEDAT = ? 
             WHERE ROLE = ? AND LEVEL = ? AND CATEGORYNAME = ?`
      params = [
        data.dimension,
        data.scorePerOccurrence,
        data.expectedWeeklyCount,
        data.description || null,
        new Date().toISOString(),
        data.role,
        data.level,
        data.categoryName
      ]
    } else {
      // Create new
      sql = `INSERT INTO CategoryTemplate (ID, ROLE, LEVEL, CATEGORYNAME, DIMENSION, SCOREPEROCCURRENCE, EXPECTEDWEEKLYCOUNT, DESCRIPTION, CREATEDAT, UPDATEDAT) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      params = [
        id,
        data.role,
        data.level,
        data.categoryName,
        data.dimension,
        data.scorePerOccurrence,
        data.expectedWeeklyCount,
        data.description || null,
        new Date().toISOString(),
        new Date().toISOString()
      ]
    }
    
    await this.executeQuery(sql, params)
    
    // Return the created/updated record
    const selectSql = 'SELECT ID as id, ROLE as role, LEVEL as level, CATEGORYNAME as categoryName, DIMENSION as dimension, SCOREPEROCCURRENCE as scorePerOccurrence, EXPECTEDWEEKLYCOUNT as expectedWeeklyCount, DESCRIPTION as description, CREATEDAT as createdAt, UPDATEDAT as updatedAt FROM CategoryTemplate WHERE ROLE = ? AND LEVEL = ? AND CATEGORYNAME = ?'
    const result = await this.executeQuery(selectSql, [data.role, data.level, data.categoryName])
    
    if (!result.results || !result.results[0] || result.results[0].rows.length === 0) {
      throw new Error('Failed to retrieve upserted category template')
    }
    
    const { columns, rows } = result.results[0]
    const record: any = {}
    columns.forEach((col, index) => {
      const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
      const cellValue = rows[0][index]
      record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
        ? cellValue.value 
        : cellValue
    })
    
    // Convert numeric fields
    if (record.level !== undefined) {
      record.level = parseInt(record.level)
    }
    if (record.scorePerOccurrence !== undefined) {
      record.scorePerOccurrence = parseInt(record.scorePerOccurrence)
    }
    if (record.expectedWeeklyCount !== undefined) {
      record.expectedWeeklyCount = parseInt(record.expectedWeeklyCount)
    }
    
    return record
  }

  async findManyLevelExpectations(filters?: { role?: string; level?: number }): Promise<any[]> {
    let sql = 'SELECT ID as id, ROLE as role, LEVEL as level, EXPECTATIONS as expectations, CREATEDAT as createdAt, UPDATEDAT as updatedAt FROM LevelExpectation'
    const params: any[] = []
    
    if (filters && (filters.role || filters.level !== undefined)) {
      const conditions: string[] = []
      if (filters.role) {
        conditions.push('ROLE = ?')
        params.push(filters.role)
      }
      if (filters.level !== undefined) {
        conditions.push('LEVEL = ?')
        params.push(filters.level)
      }
      sql += ' WHERE ' + conditions.join(' AND ')
    }
    
    sql += ' ORDER BY ROLE ASC, LEVEL ASC'
    
    try {
      console.log('🔍 findManyLevelExpectations: Fetching level expectations from Turso...')
      console.log('📝 Filters:', filters)
      const result = await this.executeQuery(sql, params)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0]) {
        console.log('📭 findManyLevelExpectations: No level expectations found')
        return []
      }

      const { columns, rows } = result.results[0]
      console.log('📊 findManyLevelExpectations: Processing', rows.length, 'rows')
      
      const records = rows.map(row => {
        const record: any = {}
        columns.forEach((col, index) => {
          const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
          const cellValue = row[index]
          record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
            ? cellValue.value 
            : cellValue
        })
        
        // Convert numeric fields
        if (record.level !== undefined) {
          record.level = parseInt(record.level)
        }
        
        return record
      })
      
      console.log('✅ findManyLevelExpectations: Level expectations fetched successfully:', records.length)
      return records
    } catch (error) {
      console.error('❌ findManyLevelExpectations: Error fetching level expectations from Turso:', error)
      return []
    }
  }

  async findFirstLevelExpectation(filters: { role: string; level: number }): Promise<any | null> {
    const sql = 'SELECT ID as id, ROLE as role, LEVEL as level, EXPECTATIONS as expectations, CREATEDAT as createdAt, UPDATEDAT as updatedAt FROM LevelExpectation WHERE ROLE = ? AND LEVEL = ? LIMIT 1'
    
    try {
      console.log('🔍 findFirstLevelExpectation: Fetching level expectation from Turso...')
      console.log('📝 Filters:', filters)
      const result = await this.executeQuery(sql, [filters.role, filters.level])
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0] || result.results[0].rows.length === 0) {
        console.log('📭 findFirstLevelExpectation: No level expectation found')
        return null
      }

      const { columns, rows } = result.results[0]
      const record: any = {}
      columns.forEach((col, index) => {
        const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
        const cellValue = rows[0][index]
        record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
          ? cellValue.value 
          : cellValue
      })
      
      // Convert numeric fields
      if (record.level !== undefined) {
        record.level = parseInt(record.level)
      }
      
      console.log('✅ findFirstLevelExpectation: Level expectation found:', record.id)
      return record
    } catch (error) {
      console.error('❌ findFirstLevelExpectation: Error fetching level expectation from Turso:', error)
      return null
    }
  }

  async createLevelExpectation(data: { role: string; level: number; expectations: string }): Promise<any> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    const sql = `INSERT INTO LevelExpectation (ID, ROLE, LEVEL, EXPECTATIONS, CREATEDAT, UPDATEDAT) 
                 VALUES (?, ?, ?, ?, ?, ?)`
    const params = [id, data.role, data.level, data.expectations, now, now]
    
    try {
      console.log('🔍 createLevelExpectation: Creating level expectation in Turso...')
      console.log('📝 Data:', { role: data.role, level: data.level })
      await this.executeQuery(sql, params)
      
      // Return the created record
      return {
        id,
        role: data.role,
        level: data.level,
        expectations: data.expectations,
        createdAt: now,
        updatedAt: now
      }
    } catch (error) {
      console.error('❌ createLevelExpectation: Error creating level expectation in Turso:', error)
      throw error
    }
  }

  async updateLevelExpectation(id: string, data: { expectations: string }): Promise<any> {
    const now = new Date().toISOString()
    
    const sql = `UPDATE LevelExpectation SET EXPECTATIONS = ?, UPDATEDAT = ? WHERE ID = ?`
    const params = [data.expectations, now, id]
    
    try {
      console.log('🔍 updateLevelExpectation: Updating level expectation in Turso...')
      console.log('📝 ID:', id)
      await this.executeQuery(sql, params)
      
      // Return the updated record
      const selectSql = 'SELECT ID as id, ROLE as role, LEVEL as level, EXPECTATIONS as expectations, CREATEDAT as createdAt, UPDATEDAT as updatedAt FROM LevelExpectation WHERE ID = ?'
      const result = await this.executeQuery(selectSql, [id])
      
      if (!result.results || !result.results[0] || result.results[0].rows.length === 0) {
        throw new Error('Failed to retrieve updated level expectation')
      }
      
      const { columns, rows } = result.results[0]
      const record: any = {}
      columns.forEach((col, index) => {
        const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
        const cellValue = rows[0][index]
        record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
          ? cellValue.value 
          : cellValue
      })
      
      // Convert numeric fields
      if (record.level !== undefined) {
        record.level = parseInt(record.level)
      }
      
      console.log('✅ updateLevelExpectation: Level expectation updated successfully:', record.id)
      return record
    } catch (error) {
      console.error('❌ updateLevelExpectation: Error updating level expectation in Turso:', error)
      throw error
    }
  }

  async findFirstUserProfile(filters?: { isActive?: boolean }): Promise<any | null> {
    // Production schema only has: id, role, level, createdAt, updatedAt
    let sql = 'SELECT id, role, level, createdAt, updatedAt FROM UserProfile'
    const params: any[] = []
    
    // Since there's no isActive column in production, ignore the filter
    sql += ' ORDER BY createdAt DESC LIMIT 1'
    
    try {
      console.log('🔍 findFirstUserProfile: Fetching user profile from Turso...')
      console.log('📝 Filters:', filters)
      const result = await this.executeQuery(sql, params)
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.results || !result.results[0] || result.results[0].rows.length === 0) {
        console.log('📭 findFirstUserProfile: No user profile found')
        return null
      }

      const { columns, rows } = result.results[0]
      const record: any = {}
      columns.forEach((col, index) => {
        const columnName = (typeof col === 'object' && col && 'name' in col) ? (col as any).name : col
        const cellValue = rows[0][index]
        record[columnName] = (typeof cellValue === 'object' && cellValue && 'value' in cellValue) 
          ? cellValue.value 
          : cellValue
      })
      
      // Convert fields
      if (record.level !== undefined) {
        record.level = parseInt(record.level)
      }
      
      console.log('✅ findFirstUserProfile: User profile found:', record.id)
      return record
    } catch (error) {
      console.error('❌ findFirstUserProfile: Error fetching user profile from Turso:', error)
      return null
    }
  }

  async createUserProfile(data: { role: string; level: number; isActive: boolean }): Promise<any> {
    const id = this.generateId()
    const now = new Date().toISOString()
    
    // Production schema only has: id, role, level, createdAt, updatedAt
    const sql = `INSERT INTO UserProfile (id, role, level, createdAt, updatedAt) 
                 VALUES (?, ?, ?, ?, ?)`
    const params = [id, data.role, data.level, now, now]
    
    try {
      console.log('🔍 createUserProfile: Creating user profile in Turso...')
      console.log('📝 Data:', { role: data.role, level: data.level })
      await this.executeQuery(sql, params)
      
      // Return the created record
      return {
        id,
        role: data.role,
        level: data.level,
        createdAt: now,
        updatedAt: now
      }
    } catch (error) {
      console.error('❌ createUserProfile: Error creating user profile in Turso:', error)
      throw error
    }
  }

  async updateManyUserProfiles(where: any, data: any): Promise<{ count: number }> {
    console.log('🔍 updateManyUserProfiles: Updating user profiles in Turso...')
    console.log('📝 Where clause:', where)
    console.log('📝 Update data:', data)
    
    try {
      let sql = 'UPDATE UserProfile SET '
      const params = []
      
      // Build SET clause - production schema only has: id, role, level, createdAt, updatedAt
      const setClauses = []
      if (data.role !== undefined) {
        setClauses.push('role = ?')
        params.push(data.role)
      }
      if (data.level !== undefined) {
        setClauses.push('level = ?')
        params.push(data.level)
      }
      
      // Add updatedAt
      setClauses.push('updatedAt = ?')
      params.push(new Date().toISOString())
      
      sql += setClauses.join(', ')
      
      // Add WHERE clause - ignore isActive since it doesn't exist in production
      if (where.role !== undefined) {
        sql += ' WHERE role = ?'
        params.push(where.role)
      } else if (where.level !== undefined) {
        sql += ' WHERE level = ?'
        params.push(where.level)
      } else {
        sql += ' WHERE 1=1'  // Update all if no where clause
      }
      
      const result = await this.executeQuery(sql, params)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      console.log('✅ updateManyUserProfiles: User profiles updated successfully')
      return { count: 1 }
    } catch (error) {
      console.error('❌ updateManyUserProfiles: Error updating user profiles in Turso:', error)
      throw error
    }
  }

  async deleteManyUserProfiles(where: any = {}): Promise<{ count: number }> {
    console.log('🗑️ deleteManyUserProfiles: Deleting user profiles in Turso...')
    console.log('📝 Where clause:', where)
    
    try {
      let sql = 'DELETE FROM UserProfile'
      const params = []
      
      // Build WHERE clause - production schema only has: id, role, level, createdAt, updatedAt
      if (Object.keys(where).length > 0) {
        const whereClauses = []
        if (where.role !== undefined) {
          whereClauses.push('role = ?')
          params.push(where.role)
        }
        if (where.level !== undefined) {
          whereClauses.push('level = ?')
          params.push(where.level)
        }
        // Ignore isActive since it doesn't exist in production
        
        if (whereClauses.length > 0) {
          sql += ' WHERE ' + whereClauses.join(' AND ')
        }
      }
      
      const result = await this.executeQuery(sql, params)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      console.log('✅ deleteManyUserProfiles: User profiles deleted successfully')
      return { count: 1 }
    } catch (error) {
      console.error('❌ deleteManyUserProfiles: Error deleting user profiles in Turso:', error)
      throw error
    }
  }
}

export { TursoHttpClient } 