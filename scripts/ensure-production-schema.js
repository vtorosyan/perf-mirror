#!/usr/bin/env node

/**
 * Production Schema Update Script
 * 
 * This script ensures that the production database (Turso) has all the necessary
 * schema updates for the enhanced PerfMirror v3.0.0 features:
 * 
 * 1. WeeklyLog.reference field
 * 2. PerformanceTarget 5-band system fields (outstandingThreshold, etc.)
 * 3. PerformanceTarget role and level fields
 * 4. RoleWeights role and level fields
 * 5. CategoryTemplate table
 * 6. LevelExpectation table
 * 7. UserProfile table
 */

const { createClient } = require('@libsql/client');

// Configuration
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('❌ Missing Turso environment variables');
  console.error('   TURSO_DATABASE_URL:', TURSO_URL ? '✅ Set' : '❌ Missing');
  console.error('   TURSO_AUTH_TOKEN:', TURSO_TOKEN ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

async function executeSQL(sql, description) {
  try {
    console.log(`🔧 ${description}...`);
    await client.execute(sql);
    console.log(`✅ ${description} - Success`);
    return true;
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
      console.log(`⚠️ ${description} - Already exists, skipping`);
      return true;
    }
    console.error(`❌ ${description} - Error:`, error.message);
    return false;
  }
}

async function checkTableExists(tableName) {
  try {
    const result = await client.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`);
    return result.rows.length > 0;
  } catch (error) {
    console.error(`❌ Error checking table ${tableName}:`, error.message);
    return false;
  }
}

async function checkColumnExists(tableName, columnName) {
  try {
    const result = await client.execute(`PRAGMA table_info(${tableName})`);
    return result.rows.some(row => row.name === columnName);
  } catch (error) {
    console.error(`❌ Error checking column ${tableName}.${columnName}:`, error.message);
    return false;
  }
}

async function updateSchema() {
  console.log('🚀 Starting production schema update...\n');

  // 1. Add reference field to WeeklyLog if it doesn't exist
  if (await checkTableExists('WeeklyLog')) {
    if (!(await checkColumnExists('WeeklyLog', 'reference'))) {
      await executeSQL(
        'ALTER TABLE WeeklyLog ADD COLUMN reference TEXT',
        'Adding reference field to WeeklyLog'
      );
    } else {
      console.log('✅ WeeklyLog.reference field already exists');
    }
  } else {
    console.log('❌ WeeklyLog table does not exist');
  }

  // 2. Update PerformanceTarget table structure
  if (await checkTableExists('PerformanceTarget')) {
    // Check if we need to migrate from 3-band to 5-band system
    const hasOldFields = await checkColumnExists('PerformanceTarget', 'excellentThreshold');
    const hasNewFields = await checkColumnExists('PerformanceTarget', 'outstandingThreshold');
    
    if (hasOldFields && !hasNewFields) {
      console.log('🔄 Migrating PerformanceTarget from 3-band to 5-band system...');
      
      // Add new fields
      await executeSQL('ALTER TABLE PerformanceTarget ADD COLUMN role TEXT', 'Adding role field to PerformanceTarget');
      await executeSQL('ALTER TABLE PerformanceTarget ADD COLUMN level INTEGER', 'Adding level field to PerformanceTarget');
      await executeSQL('ALTER TABLE PerformanceTarget ADD COLUMN outstandingThreshold INTEGER', 'Adding outstandingThreshold to PerformanceTarget');
      await executeSQL('ALTER TABLE PerformanceTarget ADD COLUMN strongThreshold INTEGER', 'Adding strongThreshold to PerformanceTarget');
      await executeSQL('ALTER TABLE PerformanceTarget ADD COLUMN meetingThreshold INTEGER', 'Adding meetingThreshold to PerformanceTarget');
      await executeSQL('ALTER TABLE PerformanceTarget ADD COLUMN partialThreshold INTEGER', 'Adding partialThreshold to PerformanceTarget');
      await executeSQL('ALTER TABLE PerformanceTarget ADD COLUMN underperformingThreshold INTEGER', 'Adding underperformingThreshold to PerformanceTarget');
      
      // Migrate data from old fields to new fields
      await executeSQL(`
        UPDATE PerformanceTarget SET 
          outstandingThreshold = excellentThreshold + 50,
          strongThreshold = excellentThreshold,
          meetingThreshold = goodThreshold,
          partialThreshold = needsImprovementThreshold,
          underperformingThreshold = needsImprovementThreshold - 30,
          role = 'IC',
          level = 3
        WHERE outstandingThreshold IS NULL
      `, 'Migrating data to 5-band system');
      
    } else if (!hasNewFields) {
      // Add all new fields if they don't exist
      await executeSQL('ALTER TABLE PerformanceTarget ADD COLUMN role TEXT', 'Adding role field to PerformanceTarget');
      await executeSQL('ALTER TABLE PerformanceTarget ADD COLUMN level INTEGER', 'Adding level field to PerformanceTarget');
      await executeSQL('ALTER TABLE PerformanceTarget ADD COLUMN outstandingThreshold INTEGER DEFAULT 250', 'Adding outstandingThreshold to PerformanceTarget');
      await executeSQL('ALTER TABLE PerformanceTarget ADD COLUMN strongThreshold INTEGER DEFAULT 200', 'Adding strongThreshold to PerformanceTarget');
      await executeSQL('ALTER TABLE PerformanceTarget ADD COLUMN meetingThreshold INTEGER DEFAULT 150', 'Adding meetingThreshold to PerformanceTarget');
      await executeSQL('ALTER TABLE PerformanceTarget ADD COLUMN partialThreshold INTEGER DEFAULT 120', 'Adding partialThreshold to PerformanceTarget');
      await executeSQL('ALTER TABLE PerformanceTarget ADD COLUMN underperformingThreshold INTEGER DEFAULT 90', 'Adding underperformingThreshold to PerformanceTarget');
    } else {
      console.log('✅ PerformanceTarget already has 5-band system fields');
    }
  }

  // 3. Update RoleWeights table structure
  if (await checkTableExists('RoleWeights')) {
    if (!(await checkColumnExists('RoleWeights', 'role'))) {
      await executeSQL('ALTER TABLE RoleWeights ADD COLUMN role TEXT', 'Adding role field to RoleWeights');
    }
    if (!(await checkColumnExists('RoleWeights', 'level'))) {
      await executeSQL('ALTER TABLE RoleWeights ADD COLUMN level INTEGER', 'Adding level field to RoleWeights');
    }
  }

  // 4. Create CategoryTemplate table
  if (!(await checkTableExists('CategoryTemplate'))) {
    await executeSQL(`
      CREATE TABLE CategoryTemplate (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        level INTEGER NOT NULL,
        categoryName TEXT NOT NULL,
        dimension TEXT NOT NULL,
        scorePerOccurrence INTEGER NOT NULL,
        expectedWeeklyCount REAL NOT NULL,
        description TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `, 'Creating CategoryTemplate table');
    
    await executeSQL(
      'CREATE UNIQUE INDEX CategoryTemplate_role_level_categoryName_key ON CategoryTemplate(role, level, categoryName)',
      'Creating unique index on CategoryTemplate'
    );
  } else {
    console.log('✅ CategoryTemplate table already exists');
  }

  // 5. Create LevelExpectation table
  if (!(await checkTableExists('LevelExpectation'))) {
    await executeSQL(`
      CREATE TABLE LevelExpectation (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        level INTEGER NOT NULL,
        expectation TEXT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `, 'Creating LevelExpectation table');
    
    await executeSQL(
      'CREATE UNIQUE INDEX LevelExpectation_role_level_key ON LevelExpectation(role, level)',
      'Creating unique index on LevelExpectation'
    );
  } else {
    console.log('✅ LevelExpectation table already exists');
  }

  // 6. Create UserProfile table
  if (!(await checkTableExists('UserProfile'))) {
    await executeSQL(`
      CREATE TABLE UserProfile (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        level INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `, 'Creating UserProfile table');
  } else {
    console.log('✅ UserProfile table already exists');
  }

  console.log('\n🎉 Production schema update completed!');
  console.log('\n📋 Summary:');
  console.log('   ✅ WeeklyLog.reference field');
  console.log('   ✅ PerformanceTarget 5-band system');
  console.log('   ✅ PerformanceTarget role/level fields');
  console.log('   ✅ RoleWeights role/level fields');
  console.log('   ✅ CategoryTemplate table');
  console.log('   ✅ LevelExpectation table');
  console.log('   ✅ UserProfile table');
}

async function main() {
  try {
    await updateSchema();
  } catch (error) {
    console.error('❌ Schema update failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateSchema }; 