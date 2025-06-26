#!/usr/bin/env node

// Simple script to check production data
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

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(httpsUrl);
    
    const requestBody = {
      requests: [
        {
          type: "execute",
          stmt: {
            sql: sql,
            args: []
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

async function checkData() {
  try {
    console.log('🔍 Checking production database data...');
    
    // Check CategoryTemplate count
    console.log('\n📋 CategoryTemplate data:');
    const templates = await executeSql('SELECT COUNT(*) as count FROM CategoryTemplate');
    console.log('Total CategoryTemplate records:', templates.results[0].response.result.rows[0][0].value);
    
    // Check LevelExpectation count
    console.log('\n📝 LevelExpectation data:');
    const expectations = await executeSql('SELECT COUNT(*) as count FROM LevelExpectation');
    console.log('Total LevelExpectation records:', expectations.results[0].response.result.rows[0][0].value);
    
    // Check specific IC Level 1 templates
    console.log('\n🔍 IC Level 1 CategoryTemplates:');
    const ic1Templates = await executeSql('SELECT categoryName, dimension, scorePerOccurrence FROM CategoryTemplate WHERE role = "IC" AND level = 1');
    if (ic1Templates.results[0].response.result.rows.length > 0) {
      ic1Templates.results[0].response.result.rows.forEach(row => {
        console.log(`- ${row[0].value} (${row[1].value}) - Score: ${row[2].value}`);
      });
    } else {
      console.log('❌ No IC Level 1 templates found');
    }
    
    // Check IC Level 1 expectations
    console.log('\n📖 IC Level 1 Expectations:');
    const ic1Expectations = await executeSql('SELECT expectations FROM LevelExpectation WHERE role = "IC" AND level = 1');
    if (ic1Expectations.results[0].response.result.rows.length > 0) {
      console.log('✅ Found IC Level 1 expectations');
      console.log('Content:', ic1Expectations.results[0].response.result.rows[0][0].value);
    } else {
      console.log('❌ No IC Level 1 expectations found');
    }
    
  } catch (error) {
    console.error('❌ Error checking production data:', error);
    process.exit(1);
  }
}

checkData(); 