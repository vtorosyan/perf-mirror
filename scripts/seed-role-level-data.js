const { prisma } = require('../lib/prisma')

// Level expectations for each role and level
const levelExpectations = [
  // IC Levels
  {
    role: 'IC',
    level: 1,
    expectations: [
      'Should learn and adapt to team processes quickly',
      'Should ask questions when unclear and seek guidance',
      'Should complete assigned tasks with support',
      'Should participate in team meetings and discussions'
    ]
  },
  {
    role: 'IC',
    level: 2,
    expectations: [
      'Should work independently on small tasks',
      'Should contribute to code reviews with basic feedback',
      'Should identify and escalate blockers appropriately',
      'Should demonstrate basic understanding of team goals'
    ]
  },
  {
    role: 'IC',
    level: 3,
    expectations: [
      'Should complete small- to medium-sized tasks reliably',
      'Should participate in code reviews regularly',
      'Should ask for support when blocked',
      'Should demonstrate basic ownership over their work',
      'Should contribute to team discussions with relevant insights'
    ]
  },
  {
    role: 'IC',
    level: 4,
    expectations: [
      'Should handle complex tasks independently',
      'Should provide thoughtful code review feedback',
      'Should mentor junior team members',
      'Should drive small projects from conception to completion',
      'Should identify and propose process improvements'
    ]
  },
  {
    role: 'IC',
    level: 5,
    expectations: [
      'Should lead technical initiatives and projects',
      'Should architect solutions for complex problems',
      'Should mentor and guide other engineers',
      'Should drive cross-team collaboration when needed',
      'Should contribute to technical strategy and roadmap',
      'Should identify and address technical debt proactively'
    ]
  },
  {
    role: 'IC',
    level: 6,
    expectations: [
      'Should lead large, complex technical initiatives',
      'Should set technical direction for the team',
      'Should influence engineering practices across teams',
      'Should identify and solve systemic technical challenges',
      'Should mentor other senior engineers',
      'Should drive significant architectural decisions'
    ]
  },
  {
    role: 'IC',
    level: 7,
    expectations: [
      'Should lead organization-wide technical initiatives',
      'Should drive technical strategy and vision',
      'Should influence engineering culture and practices',
      'Should solve complex, ambiguous technical problems',
      'Should mentor and develop other technical leaders',
      'Should represent the organization in technical discussions'
    ]
  },
  {
    role: 'IC',
    level: 8,
    expectations: [
      'Should set technical direction for the entire organization',
      'Should drive industry-leading technical innovations',
      'Should influence engineering practices across the industry',
      'Should solve the most complex technical challenges',
      'Should develop and mentor other principal engineers',
      'Should represent the organization as a technical thought leader'
    ]
  },
  // Manager Levels
  {
    role: 'Manager',
    level: 4,
    expectations: [
      'Should manage a small team effectively',
      'Should conduct regular 1:1s and provide feedback',
      'Should help team members grow and develop',
      'Should ensure team delivery against commitments',
      'Should collaborate with other teams and stakeholders'
    ]
  },
  {
    role: 'Manager',
    level: 5,
    expectations: [
      'Should manage larger teams or multiple teams',
      'Should develop and execute team strategy',
      'Should identify and develop high-potential team members',
      'Should drive cross-functional initiatives',
      'Should contribute to organizational planning and strategy',
      'Should manage team performance and address issues'
    ]
  },
  {
    role: 'Manager',
    level: 6,
    expectations: [
      'Should manage managers and larger organizations',
      'Should set strategic direction for their area',
      'Should drive organizational change and transformation',
      'Should develop other managers and leaders',
      'Should influence company-wide decisions',
      'Should represent the organization to external stakeholders'
    ]
  },
  {
    role: 'Manager',
    level: 7,
    expectations: [
      'Should lead large organizations or critical functions',
      'Should set company-wide strategic initiatives',
      'Should drive cultural change and transformation',
      'Should develop executive leadership pipeline',
      'Should influence industry practices and standards',
      'Should represent the company at the highest levels'
    ]
  },
  {
    role: 'Manager',
    level: 8,
    expectations: [
      'Should lead major business units or functions',
      'Should set company vision and strategy',
      'Should drive company-wide transformation',
      'Should develop other executives and leaders',
      'Should influence industry direction and standards',
      'Should represent the company as a thought leader'
    ]
  }
]

// Category templates for specific levels
const categoryTemplates = [
  // IC L1 Templates - Junior Developer
  {
    role: 'IC',
    level: 1,
    categoryName: 'Code Reviews',
    dimension: 'input',
    scorePerOccurrence: 3,
    expectedWeeklyCount: 5,
    description: 'Learning from code review feedback'
  },
  {
    role: 'IC',
    level: 1,
    categoryName: 'Bug Fixes',
    dimension: 'output',
    scorePerOccurrence: 5,
    expectedWeeklyCount: 4,
    description: 'Fixing simple bugs and issues'
  },
  {
    role: 'IC',
    level: 1,
    categoryName: 'Documentation Reading',
    dimension: 'input',
    scorePerOccurrence: 2,
    expectedWeeklyCount: 8,
    description: 'Reading technical documentation and learning materials'
  },
  {
    role: 'IC',
    level: 1,
    categoryName: 'Small Feature Implementation',
    dimension: 'output',
    scorePerOccurrence: 8,
    expectedWeeklyCount: 2,
    description: 'Implementing small, well-defined features'
  },
  {
    role: 'IC',
    level: 1,
    categoryName: 'Team Meetings',
    dimension: 'input',
    scorePerOccurrence: 2,
    expectedWeeklyCount: 6,
    description: 'Participating in team meetings and standups'
  },
  {
    role: 'IC',
    level: 1,
    categoryName: 'Task Completion',
    dimension: 'outcome',
    scorePerOccurrence: 10,
    expectedWeeklyCount: 3,
    description: 'Completing assigned tasks and tickets'
  },

  // IC L2 Templates - Developer
  {
    role: 'IC',
    level: 2,
    categoryName: 'Code Reviews',
    dimension: 'input',
    scorePerOccurrence: 4,
    expectedWeeklyCount: 6,
    description: 'Providing basic feedback on code changes'
  },
  {
    role: 'IC',
    level: 2,
    categoryName: 'Feature Development',
    dimension: 'output',
    scorePerOccurrence: 12,
    expectedWeeklyCount: 2,
    description: 'Developing medium-complexity features'
  },
  {
    role: 'IC',
    level: 2,
    categoryName: 'Bug Fixes',
    dimension: 'output',
    scorePerOccurrence: 6,
    expectedWeeklyCount: 3,
    description: 'Resolving bugs with moderate complexity'
  },
  {
    role: 'IC',
    level: 2,
    categoryName: 'Testing',
    dimension: 'output',
    scorePerOccurrence: 4,
    expectedWeeklyCount: 4,
    description: 'Writing and maintaining unit tests'
  },
  {
    role: 'IC',
    level: 2,
    categoryName: 'Documentation Writing',
    dimension: 'output',
    scorePerOccurrence: 8,
    expectedWeeklyCount: 1,
    description: 'Writing technical documentation'
  },
  {
    role: 'IC',
    level: 2,
    categoryName: 'User Story Completion',
    dimension: 'outcome',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 2,
    description: 'Delivering completed user stories'
  },

  // IC L3 Templates - Senior Developer
  {
    role: 'IC',
    level: 3,
    categoryName: 'Code Reviews',
    dimension: 'input',
    scorePerOccurrence: 5,
    expectedWeeklyCount: 8,
    description: 'Providing detailed feedback on code changes'
  },
  {
    role: 'IC',
    level: 3,
    categoryName: 'Feature Development',
    dimension: 'output',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 2,
    description: 'Completing complex feature development tasks'
  },
  {
    role: 'IC',
    level: 3,
    categoryName: 'Bug Fixes',
    dimension: 'output',
    scorePerOccurrence: 8,
    expectedWeeklyCount: 3,
    description: 'Resolving complex software defects'
  },
  {
    role: 'IC',
    level: 3,
    categoryName: 'Team Meetings',
    dimension: 'input',
    scorePerOccurrence: 3,
    expectedWeeklyCount: 5,
    description: 'Participating in team meetings and discussions'
  },
  {
    role: 'IC',
    level: 3,
    categoryName: 'User Story Completion',
    dimension: 'outcome',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 2,
    description: 'Delivering completed user stories'
  },
  {
    role: 'IC',
    level: 3,
    categoryName: 'Junior Mentoring',
    dimension: 'input',
    scorePerOccurrence: 6,
    expectedWeeklyCount: 2,
    description: 'Mentoring junior developers'
  },
  {
    role: 'IC',
    level: 3,
    categoryName: 'Technical Design',
    dimension: 'output',
    scorePerOccurrence: 18,
    expectedWeeklyCount: 1,
    description: 'Creating technical designs for features'
  },

  // IC L4 Templates - Staff Developer
  {
    role: 'IC',
    level: 4,
    categoryName: 'Code Review Leadership',
    dimension: 'input',
    scorePerOccurrence: 6,
    expectedWeeklyCount: 10,
    description: 'Leading code review processes'
  },
  {
    role: 'IC',
    level: 4,
    categoryName: 'Architecture Design',
    dimension: 'output',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 1,
    description: 'Designing system architecture'
  },
  {
    role: 'IC',
    level: 4,
    categoryName: 'Technical Mentoring',
    dimension: 'input',
    scorePerOccurrence: 8,
    expectedWeeklyCount: 3,
    description: 'Mentoring developers on technical topics'
  },
  {
    role: 'IC',
    level: 4,
    categoryName: 'Cross-team Collaboration',
    dimension: 'input',
    scorePerOccurrence: 12,
    expectedWeeklyCount: 2,
    description: 'Collaborating with other teams'
  },
  {
    role: 'IC',
    level: 4,
    categoryName: 'Project Delivery',
    dimension: 'outcome',
    scorePerOccurrence: 30,
    expectedWeeklyCount: 0.5,
    description: 'Delivering complex projects'
  },
  {
    role: 'IC',
    level: 4,
    categoryName: 'Technical Innovation',
    dimension: 'impact',
    scorePerOccurrence: 35,
    expectedWeeklyCount: 0.5,
    description: 'Driving technical innovation'
  },
  {
    role: 'IC',
    level: 4,
    categoryName: 'Process Improvement',
    dimension: 'outcome',
    scorePerOccurrence: 25,
    expectedWeeklyCount: 0.5,
    description: 'Improving team processes and practices'
  },

  // IC L5 Templates - Senior Staff Developer
  {
    role: 'IC',
    level: 5,
    categoryName: 'Technical Design',
    dimension: 'output',
    scorePerOccurrence: 25,
    expectedWeeklyCount: 1,
    description: 'Creating technical designs and architecture'
  },
  {
    role: 'IC',
    level: 5,
    categoryName: 'Code Review Leadership',
    dimension: 'input',
    scorePerOccurrence: 8,
    expectedWeeklyCount: 10,
    description: 'Leading code review processes'
  },
  {
    role: 'IC',
    level: 5,
    categoryName: 'Mentoring Sessions',
    dimension: 'input',
    scorePerOccurrence: 10,
    expectedWeeklyCount: 3,
    description: 'Mentoring junior and mid-level engineers'
  },
  {
    role: 'IC',
    level: 5,
    categoryName: 'Project Delivery',
    dimension: 'outcome',
    scorePerOccurrence: 40,
    expectedWeeklyCount: 0.5,
    description: 'Delivering complex projects'
  },
  {
    role: 'IC',
    level: 5,
    categoryName: 'Cross-team Collaboration',
    dimension: 'input',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 2,
    description: 'Collaborating with other teams'
  },
  {
    role: 'IC',
    level: 5,
    categoryName: 'Technical Innovation',
    dimension: 'impact',
    scorePerOccurrence: 50,
    expectedWeeklyCount: 0.25,
    description: 'Driving technical innovation and improvements'
  },
  {
    role: 'IC',
    level: 5,
    categoryName: 'Technical Writing',
    dimension: 'output',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 1,
    description: 'Writing technical documentation and RFCs'
  },

  // IC L6 Templates - Principal Engineer
  {
    role: 'IC',
    level: 6,
    categoryName: 'System Architecture',
    dimension: 'output',
    scorePerOccurrence: 40,
    expectedWeeklyCount: 1,
    description: 'Designing large-scale system architecture'
  },
  {
    role: 'IC',
    level: 6,
    categoryName: 'Technical Strategy',
    dimension: 'impact',
    scorePerOccurrence: 60,
    expectedWeeklyCount: 0.5,
    description: 'Contributing to technical strategy'
  },
  {
    role: 'IC',
    level: 6,
    categoryName: 'Architecture Reviews',
    dimension: 'input',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 4,
    description: 'Reviewing and approving architectural decisions'
  },
  {
    role: 'IC',
    level: 6,
    categoryName: 'Senior Mentoring',
    dimension: 'input',
    scorePerOccurrence: 12,
    expectedWeeklyCount: 4,
    description: 'Mentoring senior engineers'
  },
  {
    role: 'IC',
    level: 6,
    categoryName: 'Cross-org Initiatives',
    dimension: 'impact',
    scorePerOccurrence: 75,
    expectedWeeklyCount: 0.25,
    description: 'Leading cross-organizational initiatives'
  },
  {
    role: 'IC',
    level: 6,
    categoryName: 'Technical Presentations',
    dimension: 'output',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 1,
    description: 'Presenting technical concepts to stakeholders'
  },
  {
    role: 'IC',
    level: 6,
    categoryName: 'Industry Engagement',
    dimension: 'impact',
    scorePerOccurrence: 25,
    expectedWeeklyCount: 0.5,
    description: 'Engaging with industry communities'
  },

  // IC L7 Templates - Distinguished Engineer
  {
    role: 'IC',
    level: 7,
    categoryName: 'Technical Strategy',
    dimension: 'impact',
    scorePerOccurrence: 75,
    expectedWeeklyCount: 0.5,
    description: 'Defining technical strategy and direction'
  },
  {
    role: 'IC',
    level: 7,
    categoryName: 'Architecture Reviews',
    dimension: 'input',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 3,
    description: 'Reviewing and approving architectural decisions'
  },
  {
    role: 'IC',
    level: 7,
    categoryName: 'Senior Mentoring',
    dimension: 'input',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 4,
    description: 'Mentoring senior engineers and tech leads'
  },
  {
    role: 'IC',
    level: 7,
    categoryName: 'Organizational Initiatives',
    dimension: 'impact',
    scorePerOccurrence: 100,
    expectedWeeklyCount: 0.25,
    description: 'Leading organization-wide technical initiatives'
  },
  {
    role: 'IC',
    level: 7,
    categoryName: 'External Representation',
    dimension: 'impact',
    scorePerOccurrence: 30,
    expectedWeeklyCount: 1,
    description: 'Representing the organization externally'
  },
  {
    role: 'IC',
    level: 7,
    categoryName: 'Technical Vision',
    dimension: 'impact',
    scorePerOccurrence: 80,
    expectedWeeklyCount: 0.25,
    description: 'Setting technical vision and standards'
  },
  {
    role: 'IC',
    level: 7,
    categoryName: 'Executive Consultation',
    dimension: 'input',
    scorePerOccurrence: 25,
    expectedWeeklyCount: 2,
    description: 'Consulting with executives on technical matters'
  },

  // IC L8 Templates - Fellow/Chief Engineer
  {
    role: 'IC',
    level: 8,
    categoryName: 'Industry Leadership',
    dimension: 'impact',
    scorePerOccurrence: 100,
    expectedWeeklyCount: 0.5,
    description: 'Leading industry technical initiatives'
  },
  {
    role: 'IC',
    level: 8,
    categoryName: 'Technical Vision',
    dimension: 'impact',
    scorePerOccurrence: 120,
    expectedWeeklyCount: 0.25,
    description: 'Setting long-term technical vision'
  },
  {
    role: 'IC',
    level: 8,
    categoryName: 'Research & Innovation',
    dimension: 'impact',
    scorePerOccurrence: 80,
    expectedWeeklyCount: 0.5,
    description: 'Leading research and innovation initiatives'
  },
  {
    role: 'IC',
    level: 8,
    categoryName: 'Executive Advisory',
    dimension: 'input',
    scorePerOccurrence: 30,
    expectedWeeklyCount: 2,
    description: 'Advising executives on technology strategy'
  },
  {
    role: 'IC',
    level: 8,
    categoryName: 'Thought Leadership',
    dimension: 'impact',
    scorePerOccurrence: 50,
    expectedWeeklyCount: 1,
    description: 'Publishing thought leadership content'
  },
  {
    role: 'IC',
    level: 8,
    categoryName: 'Patent Development',
    dimension: 'outcome',
    scorePerOccurrence: 100,
    expectedWeeklyCount: 0.1,
    description: 'Developing patents and IP'
  },

  // Manager L4 Templates - Team Lead/Engineering Manager
  {
    role: 'Manager',
    level: 4,
    categoryName: 'One-on-Ones',
    dimension: 'input',
    scorePerOccurrence: 10,
    expectedWeeklyCount: 6,
    description: 'Conducting regular 1:1 meetings with team members'
  },
  {
    role: 'Manager',
    level: 4,
    categoryName: 'Team Planning',
    dimension: 'output',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 2,
    description: 'Planning team work and priorities'
  },
  {
    role: 'Manager',
    level: 4,
    categoryName: 'Performance Reviews',
    dimension: 'input',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 0.5,
    description: 'Conducting performance reviews and feedback'
  },
  {
    role: 'Manager',
    level: 4,
    categoryName: 'Team Deliverables',
    dimension: 'outcome',
    scorePerOccurrence: 30,
    expectedWeeklyCount: 1,
    description: 'Ensuring team meets delivery commitments'
  },
  {
    role: 'Manager',
    level: 4,
    categoryName: 'Stakeholder Meetings',
    dimension: 'input',
    scorePerOccurrence: 12,
    expectedWeeklyCount: 3,
    description: 'Meeting with stakeholders and partners'
  },
  {
    role: 'Manager',
    level: 4,
    categoryName: 'Hiring & Interviews',
    dimension: 'input',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 2,
    description: 'Conducting interviews and hiring activities'
  },
  {
    role: 'Manager',
    level: 4,
    categoryName: 'Process Improvement',
    dimension: 'outcome',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 0.5,
    description: 'Improving team processes and efficiency'
  },

  // Manager L5 Templates - Senior Engineering Manager
  {
    role: 'Manager',
    level: 5,
    categoryName: 'Team Leadership',
    dimension: 'input',
    scorePerOccurrence: 15,
    expectedWeeklyCount: 8,
    description: 'Leading multiple teams or larger team'
  },
  {
    role: 'Manager',
    level: 5,
    categoryName: 'Strategic Planning',
    dimension: 'output',
    scorePerOccurrence: 25,
    expectedWeeklyCount: 1,
    description: 'Developing strategic plans for the team'
  },
  {
    role: 'Manager',
    level: 5,
    categoryName: 'Cross-team Coordination',
    dimension: 'input',
    scorePerOccurrence: 18,
    expectedWeeklyCount: 3,
    description: 'Coordinating with other teams and departments'
  },
  {
    role: 'Manager',
    level: 5,
    categoryName: 'Manager Development',
    dimension: 'input',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 2,
    description: 'Mentoring and developing other managers'
  },
  {
    role: 'Manager',
    level: 5,
    categoryName: 'Project Delivery',
    dimension: 'outcome',
    scorePerOccurrence: 40,
    expectedWeeklyCount: 1,
    description: 'Ensuring successful project delivery'
  },
  {
    role: 'Manager',
    level: 5,
    categoryName: 'Organizational Impact',
    dimension: 'impact',
    scorePerOccurrence: 50,
    expectedWeeklyCount: 0.5,
    description: 'Driving organizational improvements'
  },
  {
    role: 'Manager',
    level: 5,
    categoryName: 'Technical Direction',
    dimension: 'output',
    scorePerOccurrence: 30,
    expectedWeeklyCount: 1,
    description: 'Setting technical direction for teams'
  },

  // Manager L6 Templates - Director of Engineering
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Strategic Planning',
    dimension: 'impact',
    scorePerOccurrence: 50,
    expectedWeeklyCount: 1,
    description: 'Developing strategic plans and initiatives'
  },
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Manager Development',
    dimension: 'input',
    scorePerOccurrence: 25,
    expectedWeeklyCount: 2,
    description: 'Developing and mentoring other managers'
  },
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Cross-functional Leadership',
    dimension: 'input',
    scorePerOccurrence: 20,
    expectedWeeklyCount: 4,
    description: 'Leading cross-functional initiatives'
  },
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Organizational Change',
    dimension: 'impact',
    scorePerOccurrence: 75,
    expectedWeeklyCount: 0.5,
    description: 'Driving organizational change and transformation'
  },
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Executive Reporting',
    dimension: 'output',
    scorePerOccurrence: 30,
    expectedWeeklyCount: 1,
    description: 'Reporting to executives and leadership'
  },
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Budget Management',
    dimension: 'outcome',
    scorePerOccurrence: 25,
    expectedWeeklyCount: 1,
    description: 'Managing budgets and resource allocation'
  },
  {
    role: 'Manager',
    level: 6,
    categoryName: 'Talent Strategy',
    dimension: 'impact',
    scorePerOccurrence: 40,
    expectedWeeklyCount: 0.5,
    description: 'Developing talent acquisition and retention strategies'
  },

  // Manager L7 Templates - VP of Engineering
  {
    role: 'Manager',
    level: 7,
    categoryName: 'Executive Leadership',
    dimension: 'impact',
    scorePerOccurrence: 60,
    expectedWeeklyCount: 1,
    description: 'Leading engineering organization'
  },
  {
    role: 'Manager',
    level: 7,
    categoryName: 'Strategic Vision',
    dimension: 'impact',
    scorePerOccurrence: 80,
    expectedWeeklyCount: 0.5,
    description: 'Setting strategic vision for engineering'
  },
  {
    role: 'Manager',
    level: 7,
    categoryName: 'Board Presentations',
    dimension: 'output',
    scorePerOccurrence: 40,
    expectedWeeklyCount: 0.25,
    description: 'Presenting to board and investors'
  },
  {
    role: 'Manager',
    level: 7,
    categoryName: 'Organizational Transformation',
    dimension: 'impact',
    scorePerOccurrence: 100,
    expectedWeeklyCount: 0.25,
    description: 'Leading major organizational changes'
  },
  {
    role: 'Manager',
    level: 7,
    categoryName: 'Industry Relations',
    dimension: 'input',
    scorePerOccurrence: 30,
    expectedWeeklyCount: 1,
    description: 'Building industry relationships and partnerships'
  },
  {
    role: 'Manager',
    level: 7,
    categoryName: 'Executive Team Collaboration',
    dimension: 'input',
    scorePerOccurrence: 25,
    expectedWeeklyCount: 3,
    description: 'Collaborating with other executives'
  },
  {
    role: 'Manager',
    level: 7,
    categoryName: 'Culture Development',
    dimension: 'impact',
    scorePerOccurrence: 50,
    expectedWeeklyCount: 0.5,
    description: 'Developing engineering culture and values'
  },

  // Manager L8 Templates - CTO/Chief Engineer
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Company Vision',
    dimension: 'impact',
    scorePerOccurrence: 100,
    expectedWeeklyCount: 0.5,
    description: 'Setting and communicating company technical vision'
  },
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Board Meetings',
    dimension: 'input',
    scorePerOccurrence: 50,
    expectedWeeklyCount: 0.25,
    description: 'Participating in board meetings and governance'
  },
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Executive Team Leadership',
    dimension: 'input',
    scorePerOccurrence: 40,
    expectedWeeklyCount: 2,
    description: 'Leading executive team meetings and decisions'
  },
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Industry Leadership',
    dimension: 'impact',
    scorePerOccurrence: 75,
    expectedWeeklyCount: 0.5,
    description: 'Representing company in industry forums'
  },
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Company Transformation',
    dimension: 'impact',
    scorePerOccurrence: 150,
    expectedWeeklyCount: 0.25,
    description: 'Driving major company-wide transformations'
  },
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Technology Strategy',
    dimension: 'impact',
    scorePerOccurrence: 120,
    expectedWeeklyCount: 0.25,
    description: 'Setting company-wide technology strategy'
  },
  {
    role: 'Manager',
    level: 8,
    categoryName: 'Investor Relations',
    dimension: 'input',
    scorePerOccurrence: 35,
    expectedWeeklyCount: 0.5,
    description: 'Managing investor relations and technical due diligence'
  }
]

async function seedData() {
  try {
    console.log('🌱 Starting to seed role-level data...')
    
    // Ensure tables exist (for production deployments)
    console.log('🔧 Ensuring database tables exist...')
    try {
      // Try to query CategoryTemplate table to see if it exists
      await prisma.categoryTemplate.findFirst()
      console.log('✅ CategoryTemplate table exists')
    } catch (error) {
      if (error.message.includes('no such table') || error.message.includes('does not exist')) {
        console.log('⚠️ CategoryTemplate table does not exist, it should be created by schema migration')
        // In production with Turso, tables should be created via schema sync
        // Log the error but continue - the upsert operations will fail gracefully
      } else {
        console.log('⚠️ Error checking CategoryTemplate table:', error.message)
      }
    }
    
    try {
      // Try to query LevelExpectation table to see if it exists
      await prisma.levelExpectation.findFirst()
      console.log('✅ LevelExpectation table exists')
    } catch (error) {
      if (error.message.includes('no such table') || error.message.includes('does not exist')) {
        console.log('⚠️ LevelExpectation table does not exist, it should be created by schema migration')
        // In production with Turso, tables should be created via schema sync
        // Log the error but continue - the upsert operations will fail gracefully
      } else {
        console.log('⚠️ Error checking LevelExpectation table:', error.message)
      }
    }
    
    // Seed level expectations
    console.log('📝 Seeding level expectations...')
    for (const expectation of levelExpectations) {
      await prisma.levelExpectation.upsert({
        where: {
          role_level: {
            role: expectation.role,
            level: expectation.level
          }
        },
        update: {
          expectations: JSON.stringify(expectation.expectations)
        },
        create: {
          role: expectation.role,
          level: expectation.level,
          expectations: JSON.stringify(expectation.expectations)
        }
      })
    }
    
    // Seed category templates
    console.log('📋 Seeding category templates...')
    for (const template of categoryTemplates) {
      await prisma.categoryTemplate.upsert({
        where: {
          role_level_categoryName: {
            role: template.role,
            level: template.level,
            categoryName: template.categoryName
          }
        },
        update: {
          dimension: template.dimension,
          scorePerOccurrence: template.scorePerOccurrence,
          expectedWeeklyCount: template.expectedWeeklyCount,
          description: template.description
        },
        create: {
          role: template.role,
          level: template.level,
          categoryName: template.categoryName,
          dimension: template.dimension,
          scorePerOccurrence: template.scorePerOccurrence,
          expectedWeeklyCount: template.expectedWeeklyCount,
          description: template.description
        }
      })
    }
    
    console.log('✅ Successfully seeded role-level data!')
    console.log(`📊 Seeded ${levelExpectations.length} level expectations`)
    console.log(`📋 Seeded ${categoryTemplates.length} category templates`)
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  }
}

seedData()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  }) 