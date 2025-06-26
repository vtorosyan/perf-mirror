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

// Comprehensive category templates for all roles and levels
const categoryTemplates = [
  // IC Level 3
  { role: 'IC', level: 3, categoryName: 'Code Reviews', dimension: 'input', scorePerOccurrence: 4, expectedWeeklyCount: 7, description: 'Providing detailed code review feedback' },
  { role: 'IC', level: 3, categoryName: 'Technical Research', dimension: 'input', scorePerOccurrence: 6, expectedWeeklyCount: 3, description: 'Researching technical solutions and best practices' },
  { role: 'IC', level: 3, categoryName: 'Feature Development', dimension: 'output', scorePerOccurrence: 15, expectedWeeklyCount: 2, description: 'Developing medium-complexity features independently' },
  { role: 'IC', level: 3, categoryName: 'Bug Resolution', dimension: 'output', scorePerOccurrence: 8, expectedWeeklyCount: 3, description: 'Resolving complex bugs and issues' },
  { role: 'IC', level: 3, categoryName: 'Project Delivery', dimension: 'outcome', scorePerOccurrence: 20, expectedWeeklyCount: 1, description: 'Delivering complete project milestones' },
  { role: 'IC', level: 3, categoryName: 'Knowledge Sharing', dimension: 'impact', scorePerOccurrence: 10, expectedWeeklyCount: 2, description: 'Sharing knowledge with team members' },

  // IC Level 4
  { role: 'IC', level: 4, categoryName: 'Architecture Design', dimension: 'input', scorePerOccurrence: 12, expectedWeeklyCount: 2, description: 'Contributing to system architecture decisions' },
  { role: 'IC', level: 4, categoryName: 'Mentoring', dimension: 'input', scorePerOccurrence: 8, expectedWeeklyCount: 3, description: 'Mentoring junior developers' },
  { role: 'IC', level: 4, categoryName: 'Complex Features', dimension: 'output', scorePerOccurrence: 25, expectedWeeklyCount: 1, description: 'Developing complex, high-impact features' },
  { role: 'IC', level: 4, categoryName: 'Technical Leadership', dimension: 'output', scorePerOccurrence: 15, expectedWeeklyCount: 2, description: 'Leading technical discussions and decisions' },
  { role: 'IC', level: 4, categoryName: 'Cross-team Collaboration', dimension: 'outcome', scorePerOccurrence: 18, expectedWeeklyCount: 2, description: 'Successfully collaborating across team boundaries' },
  { role: 'IC', level: 4, categoryName: 'Process Improvement', dimension: 'impact', scorePerOccurrence: 20, expectedWeeklyCount: 1, description: 'Identifying and implementing process improvements' },

  // IC Level 5
  { role: 'IC', level: 5, categoryName: 'System Architecture', dimension: 'input', scorePerOccurrence: 20, expectedWeeklyCount: 2, description: 'Designing and architecting complex systems' },
  { role: 'IC', level: 5, categoryName: 'Technical Strategy', dimension: 'input', scorePerOccurrence: 25, expectedWeeklyCount: 1, description: 'Contributing to technical strategy and roadmap' },
  { role: 'IC', level: 5, categoryName: 'Platform Development', dimension: 'output', scorePerOccurrence: 35, expectedWeeklyCount: 1, description: 'Building platform-level solutions' },
  { role: 'IC', level: 5, categoryName: 'Technical Mentorship', dimension: 'output', scorePerOccurrence: 20, expectedWeeklyCount: 2, description: 'Mentoring senior engineers' },
  { role: 'IC', level: 5, categoryName: 'Initiative Leadership', dimension: 'outcome', scorePerOccurrence: 30, expectedWeeklyCount: 1, description: 'Leading major technical initiatives' },
  { role: 'IC', level: 5, categoryName: 'Engineering Excellence', dimension: 'impact', scorePerOccurrence: 25, expectedWeeklyCount: 1, description: 'Driving engineering excellence across teams' },

  // IC Level 6
  { role: 'IC', level: 6, categoryName: 'Technical Vision', dimension: 'input', scorePerOccurrence: 30, expectedWeeklyCount: 1, description: 'Setting technical vision and direction' },
  { role: 'IC', level: 6, categoryName: 'Industry Research', dimension: 'input', scorePerOccurrence: 20, expectedWeeklyCount: 2, description: 'Researching industry trends and innovations' },
  { role: 'IC', level: 6, categoryName: 'Architecture Leadership', dimension: 'output', scorePerOccurrence: 40, expectedWeeklyCount: 1, description: 'Leading organization-wide architecture decisions' },
  { role: 'IC', level: 6, categoryName: 'Technical Influence', dimension: 'output', scorePerOccurrence: 25, expectedWeeklyCount: 2, description: 'Influencing technical decisions across teams' },
  { role: 'IC', level: 6, categoryName: 'Strategic Projects', dimension: 'outcome', scorePerOccurrence: 50, expectedWeeklyCount: 0.5, description: 'Delivering strategic technical projects' },
  { role: 'IC', level: 6, categoryName: 'Organizational Impact', dimension: 'impact', scorePerOccurrence: 40, expectedWeeklyCount: 1, description: 'Creating organization-wide technical impact' },

  // IC Level 7
  { role: 'IC', level: 7, categoryName: 'Technology Leadership', dimension: 'input', scorePerOccurrence: 40, expectedWeeklyCount: 1, description: 'Leading technology direction for the organization' },
  { role: 'IC', level: 7, categoryName: 'External Influence', dimension: 'input', scorePerOccurrence: 30, expectedWeeklyCount: 1, description: 'Influencing external technical communities' },
  { role: 'IC', level: 7, categoryName: 'Innovation Leadership', dimension: 'output', scorePerOccurrence: 50, expectedWeeklyCount: 1, description: 'Leading breakthrough technical innovations' },
  { role: 'IC', level: 7, categoryName: 'Technical Standards', dimension: 'output', scorePerOccurrence: 35, expectedWeeklyCount: 1, description: 'Setting technical standards and practices' },
  { role: 'IC', level: 7, categoryName: 'Industry Leadership', dimension: 'outcome', scorePerOccurrence: 60, expectedWeeklyCount: 0.5, description: 'Leading industry-wide technical initiatives' },
  { role: 'IC', level: 7, categoryName: 'Technical Culture', dimension: 'impact', scorePerOccurrence: 50, expectedWeeklyCount: 1, description: 'Shaping technical culture and practices' },

  // IC Level 8
  { role: 'IC', level: 8, categoryName: 'Visionary Leadership', dimension: 'input', scorePerOccurrence: 60, expectedWeeklyCount: 1, description: 'Setting visionary technical direction' },
  { role: 'IC', level: 8, categoryName: 'Industry Innovation', dimension: 'input', scorePerOccurrence: 50, expectedWeeklyCount: 1, description: 'Driving industry-wide technical innovation' },
  { role: 'IC', level: 8, categoryName: 'Breakthrough Solutions', dimension: 'output', scorePerOccurrence: 80, expectedWeeklyCount: 0.5, description: 'Creating breakthrough technical solutions' },
  { role: 'IC', level: 8, categoryName: 'Global Influence', dimension: 'output', scorePerOccurrence: 60, expectedWeeklyCount: 1, description: 'Influencing global technical standards' },
  { role: 'IC', level: 8, categoryName: 'Transformational Impact', dimension: 'outcome', scorePerOccurrence: 100, expectedWeeklyCount: 0.25, description: 'Creating transformational technical impact' },
  { role: 'IC', level: 8, categoryName: 'Technical Legacy', dimension: 'impact', scorePerOccurrence: 80, expectedWeeklyCount: 0.5, description: 'Building lasting technical legacy' },

  // Manager Level 4
  { role: 'Manager', level: 4, categoryName: 'Team Management', dimension: 'input', scorePerOccurrence: 15, expectedWeeklyCount: 5, description: 'Managing team members and their development' },
  { role: 'Manager', level: 4, categoryName: 'Project Planning', dimension: 'input', scorePerOccurrence: 12, expectedWeeklyCount: 3, description: 'Planning and organizing team projects' },
  { role: 'Manager', level: 4, categoryName: 'Team Delivery', dimension: 'output', scorePerOccurrence: 25, expectedWeeklyCount: 2, description: 'Ensuring team delivers on commitments' },
  { role: 'Manager', level: 4, categoryName: 'Performance Management', dimension: 'output', scorePerOccurrence: 20, expectedWeeklyCount: 2, description: 'Managing team performance and growth' },
  { role: 'Manager', level: 4, categoryName: 'Stakeholder Management', dimension: 'outcome', scorePerOccurrence: 18, expectedWeeklyCount: 3, description: 'Managing relationships with stakeholders' },
  { role: 'Manager', level: 4, categoryName: 'Team Culture', dimension: 'impact', scorePerOccurrence: 15, expectedWeeklyCount: 2, description: 'Building positive team culture' },

  // Manager Level 5
  { role: 'Manager', level: 5, categoryName: 'Strategic Planning', dimension: 'input', scorePerOccurrence: 25, expectedWeeklyCount: 2, description: 'Developing team and project strategy' },
  { role: 'Manager', level: 5, categoryName: 'Cross-team Leadership', dimension: 'input', scorePerOccurrence: 20, expectedWeeklyCount: 3, description: 'Leading across multiple teams' },
  { role: 'Manager', level: 5, categoryName: 'Organizational Delivery', dimension: 'output', scorePerOccurrence: 35, expectedWeeklyCount: 1, description: 'Delivering on organizational objectives' },
  { role: 'Manager', level: 5, categoryName: 'Talent Development', dimension: 'output', scorePerOccurrence: 30, expectedWeeklyCount: 2, description: 'Developing talent across teams' },
  { role: 'Manager', level: 5, categoryName: 'Strategic Execution', dimension: 'outcome', scorePerOccurrence: 40, expectedWeeklyCount: 1, description: 'Executing strategic initiatives' },
  { role: 'Manager', level: 5, categoryName: 'Organizational Impact', dimension: 'impact', scorePerOccurrence: 30, expectedWeeklyCount: 1, description: 'Creating organizational impact' },

  // Manager Level 6
  { role: 'Manager', level: 6, categoryName: 'Organizational Strategy', dimension: 'input', scorePerOccurrence: 40, expectedWeeklyCount: 1, description: 'Setting organizational strategy and direction' },
  { role: 'Manager', level: 6, categoryName: 'Executive Leadership', dimension: 'input', scorePerOccurrence: 35, expectedWeeklyCount: 2, description: 'Providing executive-level leadership' },
  { role: 'Manager', level: 6, categoryName: 'Transformation Leadership', dimension: 'output', scorePerOccurrence: 50, expectedWeeklyCount: 1, description: 'Leading organizational transformation' },
  { role: 'Manager', level: 6, categoryName: 'Leadership Development', dimension: 'output', scorePerOccurrence: 40, expectedWeeklyCount: 1, description: 'Developing other leaders' },
  { role: 'Manager', level: 6, categoryName: 'Strategic Impact', dimension: 'outcome', scorePerOccurrence: 60, expectedWeeklyCount: 0.5, description: 'Creating strategic organizational impact' },
  { role: 'Manager', level: 6, categoryName: 'Cultural Leadership', dimension: 'impact', scorePerOccurrence: 45, expectedWeeklyCount: 1, description: 'Leading cultural change and development' },

  // Manager Level 7
  { role: 'Manager', level: 7, categoryName: 'Visionary Leadership', dimension: 'input', scorePerOccurrence: 60, expectedWeeklyCount: 1, description: 'Setting visionary organizational direction' },
  { role: 'Manager', level: 7, categoryName: 'Industry Leadership', dimension: 'input', scorePerOccurrence: 50, expectedWeeklyCount: 1, description: 'Leading within the industry' },
  { role: 'Manager', level: 7, categoryName: 'Organizational Excellence', dimension: 'output', scorePerOccurrence: 70, expectedWeeklyCount: 0.5, description: 'Driving organizational excellence' },
  { role: 'Manager', level: 7, categoryName: 'Executive Development', dimension: 'output', scorePerOccurrence: 55, expectedWeeklyCount: 1, description: 'Developing executive talent' },
  { role: 'Manager', level: 7, categoryName: 'Market Leadership', dimension: 'outcome', scorePerOccurrence: 80, expectedWeeklyCount: 0.5, description: 'Achieving market leadership' },
  { role: 'Manager', level: 7, categoryName: 'Industry Influence', dimension: 'impact', scorePerOccurrence: 60, expectedWeeklyCount: 1, description: 'Influencing industry standards and practices' },

  // Manager Level 8
  { role: 'Manager', level: 8, categoryName: 'Global Leadership', dimension: 'input', scorePerOccurrence: 80, expectedWeeklyCount: 1, description: 'Providing global organizational leadership' },
  { role: 'Manager', level: 8, categoryName: 'Industry Transformation', dimension: 'input', scorePerOccurrence: 70, expectedWeeklyCount: 1, description: 'Leading industry transformation' },
  { role: 'Manager', level: 8, categoryName: 'Legacy Building', dimension: 'output', scorePerOccurrence: 100, expectedWeeklyCount: 0.5, description: 'Building lasting organizational legacy' },
  { role: 'Manager', level: 8, categoryName: 'Global Influence', dimension: 'output', scorePerOccurrence: 85, expectedWeeklyCount: 0.5, description: 'Influencing global business practices' },
  { role: 'Manager', level: 8, categoryName: 'Transformational Impact', dimension: 'outcome', scorePerOccurrence: 120, expectedWeeklyCount: 0.25, description: 'Creating transformational market impact' },
  { role: 'Manager', level: 8, categoryName: 'Industry Legacy', dimension: 'impact', scorePerOccurrence: 100, expectedWeeklyCount: 0.5, description: 'Creating lasting industry legacy' }
];

async function seedCategoryTemplates() {
  try {
    console.log('🌱 Starting comprehensive category template seeding...');
    console.log(`📊 Total templates to seed: ${categoryTemplates.length}`);
    
    let successCount = 0;
    let skipCount = 0;
    
    for (const template of categoryTemplates) {
      try {
        // Check if template already exists
        const checkSql = 'SELECT id FROM CategoryTemplate WHERE role = ? AND level = ? AND categoryName = ?';
        const existingResult = await executeSql(checkSql, [template.role, template.level, template.categoryName]);
        
        const exists = existingResult.results && 
                      existingResult.results[0] && 
                      existingResult.results[0].response && 
                      existingResult.results[0].response.result &&
                      existingResult.results[0].response.result.rows &&
                      existingResult.results[0].response.result.rows.length > 0;

        if (exists) {
          console.log(`⏭️  Skipping existing: ${template.role} L${template.level} - ${template.categoryName}`);
          skipCount++;
          continue;
        }
        
        // Insert new template
        const id = `tpl_${template.role}_${template.level}_${template.categoryName.replace(/\s+/g, '_')}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        const insertSql = `
          INSERT INTO CategoryTemplate (id, role, level, categoryName, dimension, scorePerOccurrence, expectedWeeklyCount, description, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await executeSql(insertSql, [
          id,
          template.role,
          template.level,
          template.categoryName,
          template.dimension,
          template.scorePerOccurrence,
          template.expectedWeeklyCount,
          template.description,
          now,
          now
        ]);
        
        console.log(`✅ Created: ${template.role} L${template.level} - ${template.categoryName}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Failed to create ${template.role} L${template.level} - ${template.categoryName}:`, error.message);
      }
    }
    
    console.log('\n🎉 Category template seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Created: ${successCount} templates`);
    console.log(`   ⏭️  Skipped: ${skipCount} existing templates`);
    console.log(`   📝 Total processed: ${successCount + skipCount}/${categoryTemplates.length}`);
    
    // Verify final counts
    console.log('\n🔍 Verifying final counts...');
    const countSql = 'SELECT role, level, COUNT(*) as count FROM CategoryTemplate GROUP BY role, level ORDER BY role, level';
    const countResult = await executeSql(countSql);
    
    if (countResult.results && countResult.results[0] && countResult.results[0].response) {
      const rows = countResult.results[0].response.result.rows;
      console.log('📋 Final template counts by role/level:');
      rows.forEach(row => {
        console.log(`   ${row[0]} Level ${row[1]}: ${row[2]} templates`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  }
}

seedCategoryTemplates(); 