#!/usr/bin/env node

// Script to inspect production database schema
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
    
    // Use the correct Turso v2/pipeline format
    const requestBody = {
      requests: [
        {
          type: "execute",
          stmt: {
            sql: sql,
            args: params.map(param => {
              if (param === null || param === undefined) {
                return { type: "null" }
              } else if (typeof param === 'boolean') {
                return { type: "integer", value: param ? "1" : "0" }
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
    };
    
    const data = JSON.stringify(requestBody);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURSO_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (res.statusCode >= 400) {
            reject(new Error(`SQL execution failed (${res.statusCode}): ${JSON.stringify(result)}`));
          } else {
            // Handle v2/pipeline response format
            if (result.results && result.results[0] && result.results[0].type === 'error') {
              const error = result.results[0].error;
              reject(new Error(`Database error: ${error.message || 'Unknown error'}`));
            } else {
              resolve(result);
            }
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.write(data);
    req.end();
  });
}

async function inspectSchema() {
  try {
    console.log('🔍 Inspecting production database schema...');
    
    // List all tables
    console.log('\n📋 Listing all tables:');
    const tablesResult = await executeSql("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    if (tablesResult.results && tablesResult.results[0] && tablesResult.results[0].response && tablesResult.results[0].response.result) {
      const tables = tablesResult.results[0].response.result.rows;
      console.log('Tables found:', tables.map(row => row[0]));
      
      // Check each table's schema
      for (const tableRow of tables) {
        const tableName = tableRow[0];
        console.log(`\n🔍 Schema for table ${tableName}:`);
        try {
          const schemaResult = await executeSql(`PRAGMA table_info(${tableName})`);
          if (schemaResult.results && schemaResult.results[0] && schemaResult.results[0].response && schemaResult.results[0].response.result) {
            const columns = schemaResult.results[0].response.result.rows;
            console.log('Columns:');
            columns.forEach(col => {
              console.log(`  - ${col[1]} (${col[2]}) ${col[3] ? 'NOT NULL' : ''} ${col[5] ? 'PRIMARY KEY' : ''}`);
            });
          }
        } catch (error) {
          console.log(`  Error getting schema: ${error.message}`);
        }
      }
    } else {
      console.log('No tables found or unexpected response format');
      console.log('Raw response:', JSON.stringify(tablesResult, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error inspecting schema:', error);
    process.exit(1);
  }
}

// Run the inspection
inspectSchema(); 