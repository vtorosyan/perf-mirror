#!/usr/bin/env node

// Simple production seeding script using Turso client directly
const tursoClient = require('../lib/turso-client');

// Level expectations data
const levelExpectations = [
  {
    role: 'IC',
    level: 1,
    expectations: 'Focus on learning and executing well-defined tasks. Demonstrate technical competence in assigned areas. Seek guidance when needed and contribute to team goals.'
  },
  {
    role: 'IC',
    level: 2,
    expectations: 'Execute tasks independently with minimal guidance. Begin contributing to technical discussions. Take ownership of small features or components.'
  },
  {
    role: 'IC',
    level: 3,
    expectations: 'Lead small projects and mentor junior team members. Contribute to technical architecture decisions. Demonstrate expertise in multiple technical areas.'
  },
  {
    role: 'IC',
    level: 4,
    expectations: 'Lead complex technical projects and drive technical excellence. Mentor multiple team members. Influence technical direction and standards across teams.'
  },
  {
    role: 'IC',
    level: 5,
    expectations: 'Lead organization-wide technical initiatives. Establish technical vision and strategy. Mentor senior engineers and drive innovation across the organization.'
  },
  // Manager levels
  {
    role: 'Manager',
    level: 4,
    expectations: 'Lead and develop a small team. Drive team performance and delivery. Support career growth of team members. Contribute to organizational planning.'
  },
  {
    role: 'Manager',
    level: 5,
    expectations: 'Manage multiple teams or a large team. Drive cross-team collaboration. Establish team processes and culture. Contribute to strategic planning.'
  },
  {
    role: 'Manager',
    level: 6,
    expectations: 'Lead a department or multiple teams. Drive organizational change and improvement. Develop other managers. Contribute to company-wide strategy.'
  },
  // Senior Manager levels
  {
    role: 'Senior Manager',
    level: 6,
    expectations: 'Lead multiple departments. Drive organizational strategy and execution. Develop senior leadership. Influence company direction and culture.'
  },
  {
    role: 'Senior Manager',
    level: 7,
    expectations: 'Lead large organizations. Drive company-wide initiatives. Develop executive leadership. Shape industry standards and practices.'
  },
  // Director levels
  {
    role: 'Director',
    level: 7,
    expectations: 'Lead major business units. Drive strategic initiatives across the organization. Develop senior leadership pipeline. Influence industry direction.'
  },
  {
    role: 'Director',
    level: 8,
    expectations: 'Lead multiple business units or major functions. Drive company strategy and vision. Develop executive team. Shape market and industry direction.'
  }
];

// Sample category templates (just a few for each level)
const categoryTemplates = [
  // IC Level 1
  { role: 'IC', level: 1, categoryName: 'Code Reviews', dimension: 'input', scorePerOccurrence: 5, expectedWeeklyCount: 3, description: 'Participating in code reviews and providing feedback' },
  { role: 'IC', level: 1, categoryName: 'Bug Fixes', dimension: 'output', scorePerOccurrence: 8, expectedWeeklyCount: 2, description: 'Fixing bugs and resolving issues' },
  { role: 'IC', level: 1, categoryName: 'Feature Development', dimension: 'output', scorePerOccurrence: 15, expectedWeeklyCount: 1, description: 'Developing new features and functionality' },
  { role: 'IC', level: 1, categoryName: 'Task Completion', dimension: 'outcome', scorePerOccurrence: 10, expectedWeeklyCount: 2, description: 'Completing assigned tasks and deliverables' },
  { role: 'IC', level: 1, categoryName: 'Learning & Development', dimension: 'input', scorePerOccurrence: 8, expectedWeeklyCount: 2, description: 'Learning new technologies and skills' },
  { role: 'IC', level: 1, categoryName: 'Team Collaboration', dimension: 'impact', scorePerOccurrence: 12, expectedWeeklyCount: 1, description: 'Collaborating effectively with team members' },
  
  // IC Level 2
  { role: 'IC', level: 2, categoryName: 'Code Reviews', dimension: 'input', scorePerOccurrence: 6, expectedWeeklyCount: 4, description: 'Providing thorough code reviews and mentoring junior developers' },
  { role: 'IC', level: 2, categoryName: 'Feature Development', dimension: 'output', scorePerOccurrence: 18, expectedWeeklyCount: 1, description: 'Leading feature development independently' },
  { role: 'IC', level: 2, categoryName: 'Technical Documentation', dimension: 'output', scorePerOccurrence: 12, expectedWeeklyCount: 1, description: 'Writing technical documentation and guides' },
  { role: 'IC', level: 2, categoryName: 'Problem Solving', dimension: 'outcome', scorePerOccurrence: 15, expectedWeeklyCount: 1, description: 'Solving complex technical problems independently' },
  { role: 'IC', level: 2, categoryName: 'Mentoring', dimension: 'impact', scorePerOccurrence: 20, expectedWeeklyCount: 1, description: 'Mentoring junior team members' },
  { role: 'IC', level: 2, categoryName: 'Process Improvement', dimension: 'impact', scorePerOccurrence: 25, expectedWeeklyCount: 0.5, description: 'Improving team processes and workflows' },
];

async function seedProduction() {
  try {
    console.log('🌱 Starting production seeding...');
    
    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await tursoClient.execute('DELETE FROM CategoryTemplate');
    await tursoClient.execute('DELETE FROM LevelExpectation');
    
    // Seed level expectations
    console.log('📝 Seeding level expectations...');
    for (const expectation of levelExpectations) {
      await tursoClient.execute(
        'INSERT INTO LevelExpectation (id, role, level, expectations, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [
          `exp_${expectation.role}_${expectation.level}_${Date.now()}`,
          expectation.role,
          expectation.level,
          expectation.expectations,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );
    }
    console.log(`✅ Seeded ${levelExpectations.length} level expectations`);
    
    // Seed category templates
    console.log('📋 Seeding category templates...');
    for (const template of categoryTemplates) {
      await tursoClient.execute(
        'INSERT INTO CategoryTemplate (id, role, level, categoryName, dimension, scorePerOccurrence, expectedWeeklyCount, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          `tpl_${template.role}_${template.level}_${template.categoryName.replace(/\s+/g, '_')}_${Date.now()}`,
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
    console.log(`✅ Seeded ${categoryTemplates.length} category templates`);
    
    console.log('🎉 Production seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding production database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedProduction(); 