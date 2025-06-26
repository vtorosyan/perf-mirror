const https = require('https');
const url = require('url');

// Turso configuration
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables');
  process.exit(1);
}

// Parse the Turso URL to get the hostname and path
const tursoUrl = new URL(TURSO_URL.replace('libsql://', 'https://'));
tursoUrl.pathname = '/v2/pipeline';

console.log('🔍 Turso URL:', tursoUrl.toString());

async function executeSql(sql, params = []) {
  return new Promise((resolve, reject) => {
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
    };
    
    const data = JSON.stringify(requestBody);

    const options = {
      hostname: tursoUrl.hostname,
      port: 443,
      path: tursoUrl.pathname,
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

async function createUserProfile() {
  try {
    console.log('🔍 Checking if UserProfile table exists...');
    
    // First, check if UserProfile table exists
    const checkTableSql = "SELECT name FROM sqlite_master WHERE type='table' AND name='UserProfile'";
    const tableResult = await executeSql(checkTableSql);
    
    const hasTable = tableResult.results && 
                     tableResult.results[0] && 
                     tableResult.results[0].response && 
                     tableResult.results[0].response.result &&
                     tableResult.results[0].response.result.rows &&
                     tableResult.results[0].response.result.rows.length > 0;

    if (!hasTable) {
      console.log('❌ UserProfile table does not exist. Creating it...');
      
      const createTableSql = `
        CREATE TABLE UserProfile (
          id TEXT PRIMARY KEY,
          role TEXT NOT NULL,
          level INTEGER NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      await executeSql(createTableSql);
      console.log('✅ UserProfile table created successfully');
    } else {
      console.log('✅ UserProfile table exists');
    }
    
    // Delete existing profiles (since there's no isActive column)
    console.log('🔄 Deleting existing user profiles...');
    const deleteSql = 'DELETE FROM UserProfile';
    await executeSql(deleteSql);
    
    // Create new user profile
    console.log('👤 Creating new user profile...');
    const id = `profile_${Date.now()}`;
    const now = new Date().toISOString();
    const createSql = `
      INSERT INTO UserProfile (id, role, level, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await executeSql(createSql, [id, 'IC', 1, now, now]);
    
    console.log('✅ User profile created successfully!');
    console.log('📋 Profile details:');
    console.log('   ID:', id);
    console.log('   Role: IC');
    console.log('   Level: 1');
    
    // Verify the profile was created
    console.log('🔍 Verifying profile creation...');
    const verifySql = 'SELECT id, role, level FROM UserProfile';
    const verifyResult = await executeSql(verifySql);
    
    const hasActiveProfile = verifyResult.results && 
                            verifyResult.results[0] && 
                            verifyResult.results[0].response && 
                            verifyResult.results[0].response.result &&
                            verifyResult.results[0].response.result.rows &&
                            verifyResult.results[0].response.result.rows.length > 0;

    if (hasActiveProfile) {
      console.log('✅ Verification successful! Profile found:');
      const row = verifyResult.results[0].response.result.rows[0];
      console.log('   ID:', row[0]);
      console.log('   Role:', row[1]);
      console.log('   Level:', row[2]);
    } else {
      console.log('❌ Verification failed - no profile found');
    }
    
  } catch (error) {
    console.error('❌ Error creating user profile:', error.message);
    process.exit(1);
  }
}

createUserProfile(); 