#!/usr/bin/env node

// Direct Turso seeding script for production
const https = require('https');
const { URL } = require('url');

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

// Convert libsql:// URL to HTTPS
const httpsUrl = TURSO_URL.replace('libsql://', 'https://') + '/v1/execute';

async function executeSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    const url = new URL(httpsUrl);
    const data = JSON.stringify({
      stmt: sql,
      args: params
    });

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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        } else {
          reject(new Error(`SQL execution failed (${res.statusCode}): ${responseData}`));
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

// Level expectations data
const levelExpectations = [
  { role: 'IC', level: 1, expectations: ['Should learn and adapt to team processes quickly', 'Should ask questions when unclear and seek guidance', 'Should complete assigned tasks with support', 'Should participate in team meetings and discussions'] },
  { role: 'IC', level: 2, expectations: ['Should work independently on small tasks', 'Should contribute to code reviews with basic feedback', 'Should identify and escalate blockers appropriately', 'Should demonstrate basic understanding of team goals'] },
  { role: 'IC', level: 3, expectations: ['Should complete small- to medium-sized tasks reliably', 'Should participate in code reviews regularly', 'Should ask for support when blocked', 'Should demonstrate basic ownership over their work', 'Should contribute to team discussions with relevant insights'] },
  { role: 'IC', level: 4, expectations: ['Should handle complex tasks independently', 'Should provide thoughtful code review feedback', 'Should mentor junior team members', 'Should drive small projects from conception to completion', 'Should identify and propose process improvements'] },
  { role: 'IC', level: 5, expectations: ['Should lead technical initiatives and projects', 'Should architect solutions for complex problems', 'Should mentor and guide other engineers', 'Should drive cross-team collaboration when needed', 'Should contribute to technical strategy and roadmap', 'Should identify and address technical debt proactively'] },
  { role: 'IC', level: 6, expectations: ['Should lead large, complex technical initiatives', 'Should set technical direction for the team', 'Should influence engineering practices across teams', 'Should identify and solve systemic technical challenges', 'Should mentor other senior engineers', 'Should drive significant architectural decisions'] },
  { role: 'IC', level: 7, expectations: ['Should lead organization-wide technical initiatives', 'Should drive technical strategy and vision', 'Should influence engineering culture and practices', 'Should solve complex, ambiguous technical problems', 'Should mentor and develop other technical leaders', 'Should represent the organization in technical discussions'] },
  { role: 'IC', level: 8, expectations: ['Should set technical direction for the entire organization', 'Should drive industry-leading technical innovations', 'Should influence engineering practices across the industry', 'Should solve the most complex technical challenges', 'Should develop and mentor other principal engineers', 'Should represent the organization as a technical thought leader'] },
  { role: 'Manager', level: 4, expectations: ['Should manage a small team effectively', 'Should conduct regular 1:1s and provide feedback', 'Should help team members grow and develop', 'Should ensure team delivery against commitments', 'Should collaborate with other teams and stakeholders'] },
  { role: 'Manager', level: 5, expectations: ['Should manage larger teams or multiple teams', 'Should develop and execute team strategy', 'Should identify and develop high-potential team members', 'Should drive cross-functional initiatives', 'Should contribute to organizational planning and strategy', 'Should manage team performance and address issues'] },
  { role: 'Manager', level: 6, expectations: ['Should manage managers and larger organizations', 'Should set strategic direction for their area', 'Should drive organizational change and transformation', 'Should develop other managers and leaders', 'Should influence company-wide decisions', 'Should represent the organization to external stakeholders'] },
  { role: 'Manager', level: 7, expectations: ['Should lead large organizations or critical functions', 'Should set company-wide strategic initiatives', 'Should drive cultural change and transformation', 'Should develop executive leadership pipeline', 'Should influence industry practices and standards', 'Should represent the company at the highest levels'] },
  { role: 'Manager', level: 8, expectations: ['Should lead major business units or functions', 'Should set company vision and strategy', 'Should drive company-wide transformation', 'Should develop other executives and leaders', 'Should influence industry direction and standards', 'Should represent the company as a thought leader'] }
];

// Category templates data (first few examples)
const categoryTemplates = [
  { role: 'IC', level: 1, categoryName: 'Code Reviews', dimension: 'input', scorePerOccurrence: 3, expectedWeeklyCount: 5, description: 'Learning from code review feedback' },
  { role: 'IC', level: 1, categoryName: 'Bug Fixes', dimension: 'output', scorePerOccurrence: 5, expectedWeeklyCount: 4, description: 'Fixing simple bugs and issues' },
  { role: 'IC', level: 1, categoryName: 'Documentation Reading', dimension: 'input', scorePerOccurrence: 2, expectedWeeklyCount: 8, description: 'Reading technical documentation and learning materials' },
  { role: 'IC', level: 1, categoryName: 'Small Feature Implementation', dimension: 'output', scorePerOccurrence: 8, expectedWeeklyCount: 2, description: 'Implementing small, well-defined features' },
  { role: 'IC', level: 1, categoryName: 'Team Meetings', dimension: 'input', scorePerOccurrence: 2, expectedWeeklyCount: 6, description: 'Participating in team meetings and standups' },
  { role: 'IC', level: 1, categoryName: 'Task Completion', dimension: 'outcome', scorePerOccurrence: 10, expectedWeeklyCount: 3, description: 'Completing assigned tasks and tickets' }
];

async function seedData() {
  try {
    console.log('🌱 Starting direct Turso seeding...');
    
    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await executeSql('DELETE FROM CategoryTemplate');
    await executeSql('DELETE FROM LevelExpectation');
    
    // Seed level expectations
    console.log('📝 Seeding level expectations...');
    for (const expectation of levelExpectations) {
      await executeSql(
        'INSERT INTO LevelExpectation (id, role, level, expectations, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [
          `le_${expectation.role}_${expectation.level}_${Date.now()}`,
          expectation.role,
          expectation.level,
          JSON.stringify(expectation.expectations),
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );
    }
    
    // Seed category templates
    console.log('📋 Seeding category templates...');
    for (const template of categoryTemplates) {
      await executeSql(
        'INSERT INTO CategoryTemplate (id, role, level, categoryName, dimension, scorePerOccurrence, expectedWeeklyCount, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          `ct_${template.role}_${template.level}_${template.categoryName.replace(/\s+/g, '_')}_${Date.now()}`,
          template.role,
          template.level,
          template.categoryName,
          template.dimension,
          template.scorePerOccurrence,
          template.expectedWeeklyCount,
          template.description,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );
    }
    
    console.log('✅ Direct Turso seeding completed successfully!');
    console.log(`📊 Seeded ${levelExpectations.length} level expectations`);
    console.log(`📋 Seeded ${categoryTemplates.length} category templates`);
    
  } catch (error) {
    console.error('❌ Error seeding Turso database:', error);
    throw error;
  }
}

if (require.main === module) {
  seedData()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { seedData }; 