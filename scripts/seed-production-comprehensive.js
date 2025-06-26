#!/usr/bin/env node

/**
 * Comprehensive Production Seeding Script for Turso
 * 
 * This script seeds the production Turso database with the EXACT same data
 * as seed-local-development.js, ensuring consistency between local and production.
 * 
 * Usage:
 * TURSO_DATABASE_URL="libsql://your-db.turso.io" TURSO_AUTH_TOKEN="your-token" node scripts/seed-production-comprehensive.js
 */

const https = require('https');
const { URL } = require('url');

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  console.error('Usage: TURSO_DATABASE_URL="libsql://your-db.turso.io" TURSO_AUTH_TOKEN="your-token" node scripts/seed-production-comprehensive.js');
  process.exit(1);
}

// Convert @libsql:// URL to HTTPS
const httpsUrl = TURSO_URL.replace('@libsql://', 'https://') + '/v2/pipeline';

async function executeSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    const url = new URL(httpsUrl);
    
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = JSON.parse(responseData);
            if (result.results && result.results[0] && result.results[0].error) {
              reject(new Error(result.results[0].error.message));
            } else {
              resolve(result);
            }
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

// EXACT DATA FROM seed-local-development.js
const categories = [
  { name: 'Code Reviews', scorePerOccurrence: 2, dimension: 'input', description: 'Reviewing code from team members' },
  { name: 'Pull Requests', scorePerOccurrence: 3, dimension: 'output', description: 'Creating and submitting pull requests' },
  { name: 'Documentation', scorePerOccurrence: 2, dimension: 'output', description: 'Writing technical documentation' },
  { name: 'Mentoring', scorePerOccurrence: 4, dimension: 'outcome', description: 'Mentoring junior team members' },
  { name: 'Bug Fixes', scorePerOccurrence: 3, dimension: 'output', description: 'Fixing bugs and issues' },
  { name: 'Feature Development', scorePerOccurrence: 5, dimension: 'outcome', description: 'Developing new features' },
  { name: 'Team Meetings', scorePerOccurrence: 1, dimension: 'input', description: 'Participating in team meetings' },
  { name: 'Process Improvement', scorePerOccurrence: 6, dimension: 'impact', description: 'Improving team processes and workflows' },
  { name: 'Learning Activities', scorePerOccurrence: 2, dimension: 'input', description: 'Learning new technologies and skills' },
  { name: 'Architecture Design', scorePerOccurrence: 8, dimension: 'impact', description: 'Designing system architecture' },
  { name: 'Testing', scorePerOccurrence: 2, dimension: 'output', description: 'Writing and executing tests' },
  { name: 'Deployment', scorePerOccurrence: 3, dimension: 'output', description: 'Deploying applications and services' }
];

const roleWeights = [
  { name: 'IC General Weights', role: 'IC', level: null, inputWeight: 0.30, outputWeight: 0.40, outcomeWeight: 0.20, impactWeight: 0.10, isActive: false },
  { name: 'Manager General Weights', role: 'Manager', level: null, inputWeight: 0.20, outputWeight: 0.30, outcomeWeight: 0.30, impactWeight: 0.20, isActive: false },
  { name: 'IC Level 1 Weights', role: 'IC', level: 1, inputWeight: 0.40, outputWeight: 0.35, outcomeWeight: 0.20, impactWeight: 0.05, isActive: false },
  { name: 'IC Level 2 Weights', role: 'IC', level: 2, inputWeight: 0.35, outputWeight: 0.35, outcomeWeight: 0.25, impactWeight: 0.05, isActive: false },
  { name: 'IC Level 3 Weights', role: 'IC', level: 3, inputWeight: 0.30, outputWeight: 0.35, outcomeWeight: 0.25, impactWeight: 0.10, isActive: false },
  { name: 'IC Level 4 Weights (Mid)', role: 'IC', level: 4, inputWeight: 0.25, outputWeight: 0.35, outcomeWeight: 0.30, impactWeight: 0.10, isActive: false },
  { name: 'IC Level 5 Weights (Senior)', role: 'IC', level: 5, inputWeight: 0.20, outputWeight: 0.30, outcomeWeight: 0.35, impactWeight: 0.15, isActive: false },
  { name: 'IC Level 6 Weights (Senior)', role: 'IC', level: 6, inputWeight: 0.15, outputWeight: 0.25, outcomeWeight: 0.40, impactWeight: 0.20, isActive: false },
  { name: 'IC Level 7 Weights (Staff)', role: 'IC', level: 7, inputWeight: 0.10, outputWeight: 0.20, outcomeWeight: 0.40, impactWeight: 0.30, isActive: false },
  { name: 'IC Level 8 Weights (Principal)', role: 'IC', level: 8, inputWeight: 0.05, outputWeight: 0.15, outcomeWeight: 0.35, impactWeight: 0.45, isActive: false },
  { name: 'Manager Level 4 Weights', role: 'Manager', level: 4, inputWeight: 0.20, outputWeight: 0.25, outcomeWeight: 0.35, impactWeight: 0.20, isActive: false },
  { name: 'Manager Level 5 Weights', role: 'Manager', level: 5, inputWeight: 0.15, outputWeight: 0.20, outcomeWeight: 0.35, impactWeight: 0.30, isActive: false },
  { name: 'Manager Level 6 Weights', role: 'Manager', level: 6, inputWeight: 0.10, outputWeight: 0.15, outcomeWeight: 0.35, impactWeight: 0.40, isActive: false },
  { name: 'Manager Level 7 Weights', role: 'Manager', level: 7, inputWeight: 0.05, outputWeight: 0.10, outcomeWeight: 0.35, impactWeight: 0.50, isActive: false },
  { name: 'Manager Level 8 Weights', role: 'Manager', level: 8, inputWeight: 0.05, outputWeight: 0.05, outcomeWeight: 0.30, impactWeight: 0.60, isActive: false }
];

const performanceTargets = [
  { name: 'IC Level 1 Target', role: 'IC', level: 1, outstandingThreshold: 250, strongThreshold: 200, meetingThreshold: 150, partialThreshold: 120, underperformingThreshold: 100, timePeriodWeeks: 12, isActive: false },
  { name: 'IC Level 2 Target', role: 'IC', level: 2, outstandingThreshold: 270, strongThreshold: 220, meetingThreshold: 170, partialThreshold: 140, underperformingThreshold: 120, timePeriodWeeks: 12, isActive: false },
  { name: 'IC Level 3 Target', role: 'IC', level: 3, outstandingThreshold: 290, strongThreshold: 240, meetingThreshold: 190, partialThreshold: 160, underperformingThreshold: 140, timePeriodWeeks: 12, isActive: false },
  { name: 'IC Level 4 Target (Mid)', role: 'IC', level: 4, outstandingThreshold: 320, strongThreshold: 270, meetingThreshold: 220, partialThreshold: 190, underperformingThreshold: 170, timePeriodWeeks: 12, isActive: false },
  { name: 'IC Level 5 Target (Senior)', role: 'IC', level: 5, outstandingThreshold: 350, strongThreshold: 300, meetingThreshold: 250, partialThreshold: 220, underperformingThreshold: 200, timePeriodWeeks: 12, isActive: false },
  { name: 'IC Level 6 Target (Senior)', role: 'IC', level: 6, outstandingThreshold: 380, strongThreshold: 330, meetingThreshold: 280, partialThreshold: 250, underperformingThreshold: 230, timePeriodWeeks: 12, isActive: false },
  { name: 'IC Level 7 Target (Staff)', role: 'IC', level: 7, outstandingThreshold: 400, strongThreshold: 350, meetingThreshold: 300, partialThreshold: 270, underperformingThreshold: 250, timePeriodWeeks: 12, isActive: false },
  { name: 'IC Level 8 Target (Principal)', role: 'IC', level: 8, outstandingThreshold: 420, strongThreshold: 370, meetingThreshold: 320, partialThreshold: 290, underperformingThreshold: 270, timePeriodWeeks: 12, isActive: false },
  { name: 'Manager Level 4 Target', role: 'Manager', level: 4, outstandingThreshold: 320, strongThreshold: 270, meetingThreshold: 220, partialThreshold: 190, underperformingThreshold: 170, timePeriodWeeks: 12, isActive: false },
  { name: 'Manager Level 5 Target', role: 'Manager', level: 5, outstandingThreshold: 360, strongThreshold: 310, meetingThreshold: 260, partialThreshold: 230, underperformingThreshold: 210, timePeriodWeeks: 12, isActive: false },
  { name: 'Manager Level 6 Target', role: 'Manager', level: 6, outstandingThreshold: 400, strongThreshold: 350, meetingThreshold: 300, partialThreshold: 270, underperformingThreshold: 250, timePeriodWeeks: 12, isActive: false },
  { name: 'Manager Level 7 Target', role: 'Manager', level: 7, outstandingThreshold: 440, strongThreshold: 390, meetingThreshold: 340, partialThreshold: 310, underperformingThreshold: 290, timePeriodWeeks: 12, isActive: false },
  { name: 'Manager Level 8 Target', role: 'Manager', level: 8, outstandingThreshold: 480, strongThreshold: 430, meetingThreshold: 380, partialThreshold: 350, underperformingThreshold: 330, timePeriodWeeks: 12, isActive: false }
];

const levelExpectations = [
  { role: 'IC', level: 1, expectations: ['Should write clean, well-tested code', 'Should participate actively in code reviews', 'Should learn from senior team members', 'Should complete assigned tasks on time'] },
  { role: 'IC', level: 2, expectations: ['Should work independently on small to medium features', 'Should provide helpful code reviews', 'Should mentor junior developers', 'Should contribute to technical discussions'] },
  { role: 'IC', level: 3, expectations: ['Should lead small projects end-to-end', 'Should design robust solutions for complex problems', 'Should actively mentor team members', 'Should contribute to architectural decisions'] },
  { role: 'IC', level: 4, expectations: ['Should lead medium to large projects', 'Should drive technical excellence across teams', 'Should mentor multiple engineers', 'Should influence technical direction'] },
  { role: 'IC', level: 5, expectations: ['Should lead complex, cross-team initiatives', 'Should establish technical standards and best practices', 'Should develop other senior engineers', 'Should drive technical strategy'] },
  { role: 'IC', level: 6, expectations: ['Should lead organization-wide technical initiatives', 'Should define technical vision and architecture', 'Should mentor and develop technical leaders', 'Should influence engineering culture'] },
  { role: 'IC', level: 7, expectations: ['Should drive technical innovation across the organization', 'Should establish engineering standards and practices', 'Should develop technical leadership capability', 'Should influence product and business strategy'] },
  { role: 'IC', level: 8, expectations: ['Should lead industry-wide technical initiatives', 'Should drive technical innovation across the industry', 'Should establish thought leadership', 'Should influence company-wide strategic direction'] },
  { role: 'Manager', level: 4, expectations: ['Should manage a small team effectively', 'Should drive team performance and delivery', 'Should support career growth of team members', 'Should contribute to organizational planning'] },
  { role: 'Manager', level: 5, expectations: ['Should manage multiple teams or a large team', 'Should drive cross-team collaboration', 'Should establish team processes and culture', 'Should contribute to strategic planning'] },
  { role: 'Manager', level: 6, expectations: ['Should lead a department or multiple teams', 'Should drive organizational change and improvement', 'Should develop other managers', 'Should contribute to company-wide strategy'] },
  { role: 'Manager', level: 7, expectations: ['Should lead multiple departments', 'Should drive organizational transformation', 'Should develop senior leadership', 'Should influence company direction'] },
  { role: 'Manager', level: 8, expectations: ['Should lead organization-wide initiatives', 'Should drive cultural and strategic transformation', 'Should develop executive leadership', 'Should influence industry direction'] }
];

// All 36 category templates from seed-local-development.js
const categoryTemplates = [
  // IC Level 1 Templates
  { role: 'IC', level: 1, categoryName: 'Learning Activities', dimension: 'input', scorePerOccurrence: 3, expectedWeeklyCount: 5, description: 'Attending training, reading documentation, learning new technologies' },
  { role: 'IC', level: 1, categoryName: 'Code Reviews', dimension: 'input', scorePerOccurrence: 2, expectedWeeklyCount: 8, description: 'Participating in code reviews and learning from feedback' },
  { role: 'IC', level: 1, categoryName: 'Small Feature Implementation', dimension: 'output', scorePerOccurrence: 5, expectedWeeklyCount: 2, description: 'Implementing small, well-defined features' },
  { role: 'IC', level: 1, categoryName: 'Bug Fixes', dimension: 'output', scorePerOccurrence: 3, expectedWeeklyCount: 3, description: 'Fixing bugs and minor issues' },
  { role: 'IC', level: 1, categoryName: 'Team Collaboration', dimension: 'outcome', scorePerOccurrence: 4, expectedWeeklyCount: 3, description: 'Working effectively with team members' },
  { role: 'IC', level: 1, categoryName: 'Documentation Reading', dimension: 'input', scorePerOccurrence: 2, expectedWeeklyCount: 4, description: 'Reading and understanding technical documentation' },

  // IC Level 2 Templates  
  { role: 'IC', level: 2, categoryName: 'Team Collaboration', dimension: 'input', scorePerOccurrence: 3, expectedWeeklyCount: 4, description: 'Active participation in team discussions and planning' },
  { role: 'IC', level: 2, categoryName: 'Documentation Reading', dimension: 'input', scorePerOccurrence: 2, expectedWeeklyCount: 3, description: 'Reading technical documentation and specifications' },
  { role: 'IC', level: 2, categoryName: 'Medium Feature Development', dimension: 'output', scorePerOccurrence: 8, expectedWeeklyCount: 1, description: 'Developing medium-complexity features independently' },
  { role: 'IC', level: 2, categoryName: 'Code Reviews', dimension: 'output', scorePerOccurrence: 3, expectedWeeklyCount: 5, description: 'Providing constructive code review feedback' },
  { role: 'IC', level: 2, categoryName: 'Problem Solving', dimension: 'outcome', scorePerOccurrence: 6, expectedWeeklyCount: 2, description: 'Solving technical problems with minimal guidance' },
  { role: 'IC', level: 2, categoryName: 'Knowledge Sharing', dimension: 'impact', scorePerOccurrence: 5, expectedWeeklyCount: 1, description: 'Sharing knowledge with junior team members' },

  // IC Level 3 Templates
  { role: 'IC', level: 3, categoryName: 'Technical Research', dimension: 'input', scorePerOccurrence: 4, expectedWeeklyCount: 3, description: 'Researching new technologies and approaches' },
  { role: 'IC', level: 3, categoryName: 'Architecture Planning', dimension: 'input', scorePerOccurrence: 6, expectedWeeklyCount: 2, description: 'Participating in architecture planning sessions' },
  { role: 'IC', level: 3, categoryName: 'Complex Feature Development', dimension: 'output', scorePerOccurrence: 12, expectedWeeklyCount: 1, description: 'Leading development of complex features' },
  { role: 'IC', level: 3, categoryName: 'Technical Documentation', dimension: 'output', scorePerOccurrence: 5, expectedWeeklyCount: 2, description: 'Writing comprehensive technical documentation' },
  { role: 'IC', level: 3, categoryName: 'Junior Mentoring', dimension: 'outcome', scorePerOccurrence: 8, expectedWeeklyCount: 2, description: 'Mentoring junior developers' },
  { role: 'IC', level: 3, categoryName: 'Process Optimization', dimension: 'impact', scorePerOccurrence: 10, expectedWeeklyCount: 1, description: 'Optimizing development processes' },

  // IC Level 4 Templates
  { role: 'IC', level: 4, categoryName: 'Cross-team Collaboration', dimension: 'input', scorePerOccurrence: 5, expectedWeeklyCount: 3, description: 'Collaborating across multiple teams' },
  { role: 'IC', level: 4, categoryName: 'Technical Leadership', dimension: 'input', scorePerOccurrence: 8, expectedWeeklyCount: 2, description: 'Providing technical leadership guidance' },
  { role: 'IC', level: 4, categoryName: 'Project Leadership', dimension: 'output', scorePerOccurrence: 15, expectedWeeklyCount: 1, description: 'Leading medium to large projects' },
  { role: 'IC', level: 4, categoryName: 'System Design', dimension: 'output', scorePerOccurrence: 12, expectedWeeklyCount: 1, description: 'Designing system architecture and components' },
  { role: 'IC', level: 4, categoryName: 'Team Mentoring', dimension: 'outcome', scorePerOccurrence: 10, expectedWeeklyCount: 2, description: 'Mentoring multiple team members' },
  { role: 'IC', level: 4, categoryName: 'Technical Standards', dimension: 'impact', scorePerOccurrence: 15, expectedWeeklyCount: 1, description: 'Establishing technical standards and practices' },

  // IC Level 5 Templates
  { role: 'IC', level: 5, categoryName: 'Strategic Planning', dimension: 'input', scorePerOccurrence: 10, expectedWeeklyCount: 2, description: 'Contributing to technical strategy' },
  { role: 'IC', level: 5, categoryName: 'Industry Research', dimension: 'input', scorePerOccurrence: 8, expectedWeeklyCount: 2, description: 'Researching industry trends and best practices' },
  { role: 'IC', level: 5, categoryName: 'Cross-team Initiatives', dimension: 'output', scorePerOccurrence: 20, expectedWeeklyCount: 1, description: 'Leading cross-team technical initiatives' },
  { role: 'IC', level: 5, categoryName: 'Architecture Design', dimension: 'output', scorePerOccurrence: 18, expectedWeeklyCount: 1, description: 'Designing complex system architectures' },
  { role: 'IC', level: 5, categoryName: 'Senior Mentoring', dimension: 'outcome', scorePerOccurrence: 15, expectedWeeklyCount: 1, description: 'Mentoring senior engineers' },
  { role: 'IC', level: 5, categoryName: 'Technical Innovation', dimension: 'impact', scorePerOccurrence: 25, expectedWeeklyCount: 1, description: 'Driving technical innovation initiatives' },

  // IC Level 6 Templates
  { role: 'IC', level: 6, categoryName: 'Organizational Strategy', dimension: 'input', scorePerOccurrence: 12, expectedWeeklyCount: 2, description: 'Contributing to organizational technical strategy' },
  { role: 'IC', level: 6, categoryName: 'External Collaboration', dimension: 'input', scorePerOccurrence: 10, expectedWeeklyCount: 2, description: 'Collaborating with external partners and vendors' },
  { role: 'IC', level: 6, categoryName: 'Organization-wide Initiatives', dimension: 'output', scorePerOccurrence: 25, expectedWeeklyCount: 1, description: 'Leading organization-wide technical initiatives' },
  { role: 'IC', level: 6, categoryName: 'Technical Vision', dimension: 'output', scorePerOccurrence: 30, expectedWeeklyCount: 1, description: 'Defining technical vision and roadmaps' },
  { role: 'IC', level: 6, categoryName: 'Leadership Development', dimension: 'outcome', scorePerOccurrence: 20, expectedWeeklyCount: 1, description: 'Developing technical leaders' },
  { role: 'IC', level: 6, categoryName: 'Engineering Culture', dimension: 'impact', scorePerOccurrence: 30, expectedWeeklyCount: 1, description: 'Shaping engineering culture and practices' },

  // IC Level 7 Templates
  { role: 'IC', level: 7, categoryName: 'Industry Leadership', dimension: 'input', scorePerOccurrence: 15, expectedWeeklyCount: 1, description: 'Leading industry technical discussions' },
  { role: 'IC', level: 7, categoryName: 'Executive Collaboration', dimension: 'input', scorePerOccurrence: 12, expectedWeeklyCount: 2, description: 'Collaborating with executive leadership' },
  { role: 'IC', level: 7, categoryName: 'Technical Innovation', dimension: 'output', scorePerOccurrence: 35, expectedWeeklyCount: 1, description: 'Driving breakthrough technical innovations' },
  { role: 'IC', level: 7, categoryName: 'Industry Standards', dimension: 'output', scorePerOccurrence: 30, expectedWeeklyCount: 1, description: 'Contributing to industry standards and practices' },
  { role: 'IC', level: 7, categoryName: 'Technical Leadership', dimension: 'outcome', scorePerOccurrence: 25, expectedWeeklyCount: 1, description: 'Providing technical leadership across organization' },
  { role: 'IC', level: 7, categoryName: 'Strategic Impact', dimension: 'impact', scorePerOccurrence: 40, expectedWeeklyCount: 1, description: 'Creating strategic technical impact' },

  // IC Level 8 Templates
  { role: 'IC', level: 8, categoryName: 'Industry Innovation', dimension: 'input', scorePerOccurrence: 20, expectedWeeklyCount: 1, description: 'Leading industry-wide technical innovation' },
  { role: 'IC', level: 8, categoryName: 'Thought Leadership', dimension: 'input', scorePerOccurrence: 18, expectedWeeklyCount: 1, description: 'Establishing technical thought leadership' },
  { role: 'IC', level: 8, categoryName: 'Revolutionary Innovation', dimension: 'output', scorePerOccurrence: 50, expectedWeeklyCount: 1, description: 'Creating revolutionary technical innovations' },
  { role: 'IC', level: 8, categoryName: 'Industry Influence', dimension: 'output', scorePerOccurrence: 45, expectedWeeklyCount: 1, description: 'Influencing industry technical direction' },
  { role: 'IC', level: 8, categoryName: 'Global Impact', dimension: 'outcome', scorePerOccurrence: 40, expectedWeeklyCount: 1, description: 'Creating global technical impact' },
  { role: 'IC', level: 8, categoryName: 'Legacy Building', dimension: 'impact', scorePerOccurrence: 60, expectedWeeklyCount: 1, description: 'Building lasting technical legacy' },

  // Manager Level 4 Templates
  { role: 'Manager', level: 4, categoryName: 'Team Meetings', dimension: 'input', scorePerOccurrence: 3, expectedWeeklyCount: 5, description: 'Leading and participating in team meetings' },
  { role: 'Manager', level: 4, categoryName: '1-on-1 Sessions', dimension: 'input', scorePerOccurrence: 5, expectedWeeklyCount: 6, description: 'Conducting regular 1-on-1s with team members' },
  { role: 'Manager', level: 4, categoryName: 'Code Reviews', dimension: 'output', scorePerOccurrence: 4, expectedWeeklyCount: 3, description: 'Reviewing and providing feedback on code' },
  { role: 'Manager', level: 4, categoryName: 'Team Planning', dimension: 'output', scorePerOccurrence: 8, expectedWeeklyCount: 2, description: 'Planning team work and sprint activities' },
  { role: 'Manager', level: 4, categoryName: 'Mentoring', dimension: 'outcome', scorePerOccurrence: 10, expectedWeeklyCount: 3, description: 'Mentoring and developing team members' },
  { role: 'Manager', level: 4, categoryName: 'Process Improvement', dimension: 'impact', scorePerOccurrence: 12, expectedWeeklyCount: 1, description: 'Improving team processes and efficiency' },

  // Manager Level 5 Templates
  { role: 'Manager', level: 5, categoryName: 'Strategic Planning', dimension: 'input', scorePerOccurrence: 10, expectedWeeklyCount: 3, description: 'Participating in strategic planning sessions' },
  { role: 'Manager', level: 5, categoryName: 'Cross-team Collaboration', dimension: 'input', scorePerOccurrence: 8, expectedWeeklyCount: 4, description: 'Collaborating with other teams and managers' },
  { role: 'Manager', level: 5, categoryName: 'Performance Reviews', dimension: 'output', scorePerOccurrence: 15, expectedWeeklyCount: 1, description: 'Conducting performance reviews and feedback' },
  { role: 'Manager', level: 5, categoryName: 'Hiring & Interviews', dimension: 'output', scorePerOccurrence: 12, expectedWeeklyCount: 2, description: 'Recruiting and interviewing candidates' },
  { role: 'Manager', level: 5, categoryName: 'Budget Planning', dimension: 'outcome', scorePerOccurrence: 20, expectedWeeklyCount: 1, description: 'Planning and managing team budget' },
  { role: 'Manager', level: 5, categoryName: 'Stakeholder Communication', dimension: 'impact', scorePerOccurrence: 15, expectedWeeklyCount: 2, description: 'Communicating with stakeholders and leadership' },

  // Manager Level 6 Templates
  { role: 'Manager', level: 6, categoryName: 'Organizational Strategy', dimension: 'input', scorePerOccurrence: 15, expectedWeeklyCount: 2, description: 'Contributing to organizational strategy' },
  { role: 'Manager', level: 6, categoryName: 'Leadership Development', dimension: 'input', scorePerOccurrence: 12, expectedWeeklyCount: 2, description: 'Developing leadership skills and knowledge' },
  { role: 'Manager', level: 6, categoryName: 'Cross-functional Projects', dimension: 'output', scorePerOccurrence: 20, expectedWeeklyCount: 1, description: 'Leading cross-functional initiatives' },
  { role: 'Manager', level: 6, categoryName: 'Executive Reporting', dimension: 'output', scorePerOccurrence: 18, expectedWeeklyCount: 1, description: 'Reporting to executive leadership' },
  { role: 'Manager', level: 6, categoryName: 'Culture Building', dimension: 'outcome', scorePerOccurrence: 25, expectedWeeklyCount: 1, description: 'Building and improving organizational culture' },
  { role: 'Manager', level: 6, categoryName: 'Risk Management', dimension: 'impact', scorePerOccurrence: 20, expectedWeeklyCount: 1, description: 'Identifying and managing organizational risks' },

  // Manager Level 7 Templates
  { role: 'Manager', level: 7, categoryName: 'Vision Setting', dimension: 'input', scorePerOccurrence: 20, expectedWeeklyCount: 1, description: 'Setting organizational vision and direction' },
  { role: 'Manager', level: 7, categoryName: 'Board Communication', dimension: 'input', scorePerOccurrence: 25, expectedWeeklyCount: 1, description: 'Communicating with board and investors' },
  { role: 'Manager', level: 7, categoryName: 'Department Strategy', dimension: 'output', scorePerOccurrence: 30, expectedWeeklyCount: 1, description: 'Developing department-wide strategy' },
  { role: 'Manager', level: 7, categoryName: 'Executive Decisions', dimension: 'output', scorePerOccurrence: 25, expectedWeeklyCount: 1, description: 'Making critical executive decisions' },
  { role: 'Manager', level: 7, categoryName: 'Industry Leadership', dimension: 'outcome', scorePerOccurrence: 35, expectedWeeklyCount: 1, description: 'Leading industry initiatives and partnerships' },
  { role: 'Manager', level: 7, categoryName: 'Organizational Change', dimension: 'impact', scorePerOccurrence: 30, expectedWeeklyCount: 1, description: 'Driving major organizational transformations' },

  // Manager Level 8 Templates
  { role: 'Manager', level: 8, categoryName: 'Corporate Strategy', dimension: 'input', scorePerOccurrence: 30, expectedWeeklyCount: 1, description: 'Developing corporate-wide strategy' },
  { role: 'Manager', level: 8, categoryName: 'Market Analysis', dimension: 'input', scorePerOccurrence: 25, expectedWeeklyCount: 1, description: 'Analyzing market trends and opportunities' },
  { role: 'Manager', level: 8, categoryName: 'Investor Relations', dimension: 'output', scorePerOccurrence: 40, expectedWeeklyCount: 1, description: 'Managing investor relationships and communications' },
  { role: 'Manager', level: 8, categoryName: 'Executive Leadership', dimension: 'output', scorePerOccurrence: 35, expectedWeeklyCount: 1, description: 'Leading executive team and company direction' },
  { role: 'Manager', level: 8, categoryName: 'Industry Partnerships', dimension: 'outcome', scorePerOccurrence: 45, expectedWeeklyCount: 1, description: 'Building strategic industry partnerships' },
  { role: 'Manager', level: 8, categoryName: 'Company Culture', dimension: 'impact', scorePerOccurrence: 40, expectedWeeklyCount: 1, description: 'Shaping company-wide culture and values' }
];

function generateId() {
  return 'prod_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

async function clearExistingData() {
  console.log('🗑️ Clearing existing data...');
  
  const tables = ['CategoryTemplate', 'LevelExpectation', 'PerformanceTarget', 'RoleWeights', 'Category'];
  
  for (const table of tables) {
    try {
      await executeSql(`DELETE FROM ${table}`);
      console.log(`✅ Cleared ${table} table`);
    } catch (error) {
      console.log(`⚠️ Error clearing ${table} (table might not exist):`, error.message);
    }
  }
}

async function seedCategories() {
  console.log('📋 Seeding categories...');
  
  for (const category of categories) {
    try {
      const id = generateId();
      const now = new Date().toISOString();
      
      await executeSql(
        'INSERT INTO Category (id, name, scorePerOccurrence, dimension, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, category.name, category.scorePerOccurrence, category.dimension, category.description, now, now]
      );
    } catch (error) {
      console.error(`❌ Error seeding category ${category.name}:`, error.message);
    }
  }
  
  console.log(`✅ Seeded ${categories.length} categories`);
}

async function seedRoleWeights() {
  console.log('⚖️ Seeding role weights...');
  
  for (const weight of roleWeights) {
    try {
      const id = generateId();
      const now = new Date().toISOString();
      
      await executeSql(
        'INSERT INTO RoleWeights (id, name, role, level, inputWeight, outputWeight, outcomeWeight, impactWeight, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, weight.name, weight.role, weight.level, weight.inputWeight, weight.outputWeight, weight.outcomeWeight, weight.impactWeight, weight.isActive, now, now]
      );
    } catch (error) {
      console.error(`❌ Error seeding role weight ${weight.name}:`, error.message);
    }
  }
  
  console.log(`✅ Seeded ${roleWeights.length} role weights`);
}

async function seedPerformanceTargets() {
  console.log('🎯 Seeding performance targets...');
  
  for (const target of performanceTargets) {
    try {
      const id = generateId();
      const now = new Date().toISOString();
      
      await executeSql(
        'INSERT INTO PerformanceTarget (id, name, role, level, outstandingThreshold, strongThreshold, meetingThreshold, partialThreshold, underperformingThreshold, timePeriodWeeks, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, target.name, target.role, target.level, target.outstandingThreshold, target.strongThreshold, target.meetingThreshold, target.partialThreshold, target.underperformingThreshold, target.timePeriodWeeks, target.isActive, now, now]
      );
    } catch (error) {
      console.error(`❌ Error seeding performance target ${target.name}:`, error.message);
    }
  }
  
  console.log(`✅ Seeded ${performanceTargets.length} performance targets`);
}

async function seedLevelExpectations() {
  console.log('📝 Seeding level expectations...');
  
  for (const expectation of levelExpectations) {
    try {
      const id = generateId();
      const now = new Date().toISOString();
      
      await executeSql(
        'INSERT INTO LevelExpectation (id, role, level, expectations, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [id, expectation.role, expectation.level, JSON.stringify(expectation.expectations), now, now]
      );
    } catch (error) {
      console.error(`❌ Error seeding level expectation ${expectation.role} L${expectation.level}:`, error.message);
    }
  }
  
  console.log(`✅ Seeded ${levelExpectations.length} level expectations`);
}

async function seedCategoryTemplates() {
  console.log('🏷️ Seeding category templates...');
  
  for (const template of categoryTemplates) {
    try {
      const id = generateId();
      const now = new Date().toISOString();
      
      await executeSql(
        'INSERT INTO CategoryTemplate (id, role, level, categoryName, dimension, scorePerOccurrence, expectedWeeklyCount, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, template.role, template.level, template.categoryName, template.dimension, template.scorePerOccurrence, template.expectedWeeklyCount, template.description, now, now]
      );
    } catch (error) {
      console.error(`❌ Error seeding category template ${template.role} L${template.level} - ${template.categoryName}:`, error.message);
    }
  }
  
  console.log(`✅ Seeded ${categoryTemplates.length} category templates`);
}

async function main() {
  try {
    console.log('🌱 Starting comprehensive production seeding...');
    console.log('🔗 Database:', TURSO_URL.replace(/\/\/.*@/, '//***@')); // Hide credentials in logs
    
    await clearExistingData();
    await seedCategories();
    await seedRoleWeights();
    await seedPerformanceTargets();
    await seedLevelExpectations();
    await seedCategoryTemplates();
    
    console.log('🎉 Comprehensive production seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - ${categories.length} Categories`);
    console.log(`   - ${roleWeights.length} Role Weights`);
    console.log(`   - ${performanceTargets.length} Performance Targets`);
    console.log(`   - ${levelExpectations.length} Level Expectations`);
    console.log(`   - ${categoryTemplates.length} Category Templates`);
    console.log('');
    console.log('✅ Production database is now fully seeded with all data!');
    
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 