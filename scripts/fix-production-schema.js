#!/usr/bin/env node

// Script to fix the column name mismatch in production database
const https = require('https');
const { URL } = require('url');

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

// Convert libsql:// URL to HTTPS
const httpsUrl = TURSO_URL.replace('libsql://', 'https://') + '/v2/pipeline';

async function executeSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    const url = new URL(httpsUrl);
    
    const requestBody = {
      requests: [
        {
          type: "execute",
          stmt: {
            sql: sql,
            args: params.map(param => ({ type: "text", value: String(param) }))
          }
        },
        {
          type: "close"
        }
      ]
    };

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURSO_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.results && response.results[0]) {
            resolve(response.results[0]);
          } else {
            reject(new Error(`Unexpected response: ${data}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(requestBody));
    req.end();
  });
}

async function fixSchema() {
  try {
    console.log('🔧 Fixing production database schema...');
    
    // Step 1: Create new table with correct column name
    console.log('📝 Creating new LevelExpectation table with correct schema...');
    await executeSql(`
      CREATE TABLE LevelExpectation_new (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        level INTEGER NOT NULL,
        expectations TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        UNIQUE(role, level)
      )
    `);
    
    // Step 2: Copy data from old table to new table
    console.log('📋 Copying data from old table...');
    await executeSql(`
      INSERT INTO LevelExpectation_new (id, role, level, expectations, createdAt, updatedAt)
      SELECT id, role, level, expectation, createdAt, updatedAt
      FROM LevelExpectation
    `);
    
    // Step 3: Drop old table
    console.log('🗑️ Dropping old table...');
    await executeSql('DROP TABLE LevelExpectation');
    
    // Step 4: Rename new table
    console.log('🔄 Renaming new table...');
    await executeSql('ALTER TABLE LevelExpectation_new RENAME TO LevelExpectation');
    
    console.log('✅ Schema fix completed successfully!');
    
    // Verify the fix
    console.log('🔍 Verifying the fix...');
    const result = await executeSql('SELECT COUNT(*) as count FROM LevelExpectation');
    console.log(`📊 LevelExpectation records: ${result.rows[0][0]}`);
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error.message);
    process.exit(1);
  }
}

fixSchema(); 