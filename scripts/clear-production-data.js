#!/usr/bin/env node

/**
 * Clear all data from production Turso database
 * This script will delete all records from all tables
 */

const https = require('https');
const { URL } = require('url');

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error('❌ Missing required environment variables:');
  console.error('   TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
  console.error('');
  console.error('Example usage:');
  console.error('   TURSO_DATABASE_URL="your-url" TURSO_AUTH_TOKEN="your-token" node scripts/clear-production-data.js');
  process.exit(1);
}

function makeHttpRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(body);
    }
    
    req.end();
  });
}

async function executeTursoQuery(query, params = []) {
  // Convert @libsql://host to https://host
  const baseUrl = TURSO_DATABASE_URL.replace('@libsql://', 'https://');
  const url = `${baseUrl}/v2/pipeline`;
  
  const body = JSON.stringify({
    requests: [
      {
        type: "execute",
        stmt: {
          sql: query,
          args: params.map(param => ({ type: "text", value: String(param) }))
        }
      }
    ]
  });

  try {
    const response = await makeHttpRequest(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURSO_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }, body);

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    }

    const result = response.data;
    
    if (result.results?.[0]?.error) {
      throw new Error(`Database error: ${result.results[0].error.message}`);
    }

    return result.results?.[0]?.result || {};
  } catch (error) {
    console.error(`❌ Query failed: ${query}`);
    throw error;
  }
}

async function clearAllTables() {
  console.log('🗑️  Starting to clear all production data...');
  console.log(`🔗 Database: ${TURSO_DATABASE_URL}`);
  console.log('');

  // Order matters due to foreign key constraints
  // Delete in reverse dependency order
  const tables = [
    'WeeklyLog',
    'CategoryTemplate', 
    'LevelExpectation',
    'PerformanceTarget',
    'RoleWeights',
    'UserProfile',
    'Category'
  ];

  let totalDeleted = 0;

  for (const table of tables) {
    try {
      console.log(`🗑️  Clearing table: ${table}`);
      
      // First, count existing records
      const countResult = await executeTursoQuery(`SELECT COUNT(*) as count FROM ${table}`);
      const count = countResult.rows?.[0]?.[0] || 0;
      
      if (count > 0) {
        // Delete all records
        const deleteResult = await executeTursoQuery(`DELETE FROM ${table}`);
        console.log(`   ✅ Deleted ${count} records from ${table}`);
        totalDeleted += count;
      } else {
        console.log(`   ℹ️  Table ${table} was already empty`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to clear ${table}: ${error.message}`);
      throw error;
    }
  }

  console.log('');
  console.log(`✅ Successfully cleared all production data!`);
  console.log(`📊 Total records deleted: ${totalDeleted}`);
  console.log('');
  console.log('🌱 You can now run the seeding script to populate with fresh data:');
  console.log(`   make seed-production TURSO_DATABASE_URL="${TURSO_DATABASE_URL}" TURSO_AUTH_TOKEN="your-token"`);
}

// Run the clearing process
clearAllTables()
  .then(() => {
    console.log('🎉 Production data clearing completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Production data clearing failed:', error.message);
    process.exit(1);
  }); 