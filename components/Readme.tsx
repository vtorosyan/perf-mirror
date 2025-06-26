'use client'

import { BookOpen, ExternalLink, Target, BarChart3, Settings, Scale, Plus, Calendar, RefreshCw, Container, Users, Trophy } from 'lucide-react'

export default function Readme() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center mb-6">
          <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Welcome to PerfMirror v3.0</h1>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            PerfMirror is a comprehensive performance tracking application designed for engineers and managers 
            to quantify and track performance using a structured, point-based scoring system 
            based on the IOOI framework (Input, Output, Outcome, Impact) with role-level performance targets, 
            5-band evaluation system, and configurable evaluation periods with real-time data synchronization.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">🎉 What's New in v3.0.0</h3>
            <ul className="space-y-2 text-blue-800">
              <li><strong>5-Band Performance System:</strong> More nuanced evaluation with Outstanding, Strong Performance, Meeting Expectations, Partially Meeting, and Underperforming</li>
              <li><strong>Role-Level Performance Targets:</strong> Specific targets for IC (levels 1-6), Manager (levels 1-4), Senior Manager (levels 1-3), and Director (levels 1-2)</li>
              <li><strong>Level Expectations Management:</strong> Define and edit detailed expectations for each role and level combination</li>
              <li><strong>Enhanced Career Guidance:</strong> Better alignment between performance evaluation and career progression</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">The IOOI Framework</h3>
              <ul className="space-y-2 text-blue-800">
                <li><strong>Input:</strong> Your effort and time invested</li>
                <li><strong>Output:</strong> Tangible deliverables you create</li>
                <li><strong>Outcome:</strong> Effectiveness of your work</li>
                <li><strong>Impact:</strong> Long-term influence on business goals</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Role-Level Evaluation</h3>
              <p className="text-green-800 mb-2">
                Performance targets are now role and level specific:
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• IC (Individual Contributor): Levels 1-6</li>
                <li>• Manager: Levels 1-4</li>
                <li>• Senior Manager: Levels 1-3</li>
                <li>• Director: Levels 1-2</li>
                <li>• Custom expectations per role-level</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Features</h2>
          
          <div className="grid gap-4 mb-8">
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Dynamic Dashboard</h4>
                <p className="text-gray-600">View performance analytics with 5-band evaluation system and role-level targets. Dashboard automatically adjusts to show data for your active target's time frame.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <Plus className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Weekly Activity Logging</h4>
                <p className="text-gray-600">Record activities grouped by IOOI dimensions. Set custom scores or let the system calculate based on categories with real-time updates.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Category Management</h4>
                <p className="text-gray-600">Define work categories with fixed scores, organized by Input, Output, Outcome, and Impact dimensions.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <Target className="h-6 w-6 text-red-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Role-Level Performance Targets</h4>
                <p className="text-gray-600">Set performance thresholds specific to your role and level with 5-band evaluation system. Targets automatically adjust based on career progression.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <Scale className="h-6 w-6 text-orange-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Role-Based Weights</h4>
                <p className="text-gray-600">Configure dimension weights based on your specific role and level (IC, Manager, Senior Manager, Director) with level-specific weightings.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 text-teal-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Level Expectations Management</h4>
                <p className="text-gray-600">Define and edit detailed expectations for each role and level combination through the Role & Level Setup interface.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <RefreshCw className="h-6 w-6 text-indigo-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Real-Time Data Refresh</h4>
                <p className="text-gray-600">Seamless data updates when switching between tabs. No more manual page refreshes to see your latest changes.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <Container className="h-6 w-6 text-cyan-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Docker & Make Support</h4>
                <p className="text-gray-600">Complete containerization with Make commands for easy development and deployment. Hybrid database switching between SQLite and Turso.</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5-Band Performance Evaluation</h2>
          
          <div className="bg-purple-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">Enhanced Evaluation System</h3>
            <p className="text-purple-800 mb-3">
              The new 5-band system provides more nuanced performance assessment with role-level specific targets:
            </p>
            <div className="bg-blue-100 border border-blue-200 rounded p-3 text-blue-800 font-medium">
              📅 Evaluation Period: Last 12 weeks (IC Level 3 Target)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <div className="text-xl font-bold text-green-800">280+</div>
              <div className="text-green-700 font-medium">Outstanding</div>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <div className="text-xl font-bold text-blue-800">240+</div>
              <div className="text-blue-700 font-medium">Strong Performance</div>
            </div>
            <div className="bg-teal-100 p-4 rounded-lg text-center">
              <div className="text-xl font-bold text-teal-800">200+</div>
              <div className="text-teal-700 font-medium">Meeting Expectations</div>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg text-center">
              <div className="text-xl font-bold text-yellow-800">160+</div>
              <div className="text-yellow-700 font-medium">Partially Meeting</div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg text-center">
              <div className="text-xl font-bold text-red-800">&lt;160</div>
              <div className="text-red-700 font-medium">Underperforming</div>
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-amber-900 mb-3">📊 Role-Level Performance Examples</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">IC Level 3 (Mid-level)</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Outstanding: 280+ points</li>
                  <li>• Strong Performance: 240+ points</li>
                  <li>• Meeting Expectations: 200+ points</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">Manager Level 2</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Outstanding: 320+ points</li>
                  <li>• Strong Performance: 280+ points</li>
                  <li>• Meeting Expectations: 240+ points</li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Enhanced Features</h2>
          
          <ul className="list-disc pl-6 space-y-2 mb-8 text-gray-700">
            <li><strong>5-Band Performance System:</strong> More nuanced evaluation with Outstanding, Strong Performance, Meeting Expectations, Partially Meeting, and Underperforming levels</li>
            <li><strong>Role-Level Performance Targets:</strong> Specific targets for different roles (IC, Manager, Senior Manager, Director) and levels within each role</li>
            <li><strong>Level Expectations Management:</strong> Define and edit detailed expectations for each role-level combination</li>
            <li><strong>Dynamic Evaluation Periods:</strong> Configure targets for 1-52 week periods with automatic dashboard adjustment</li>
            <li><strong>Real-Time Data Sync:</strong> Seamless updates when switching tabs - no more manual refreshes</li>
            <li><strong>Hybrid Database:</strong> Intelligent switching between SQLite (local) and Turso (production)</li>
            <li><strong>Role-based weighted scoring</strong> with customizable weights for different career levels</li>
            <li><strong>Individual score override capability</strong> for exceptional circumstances</li>
            <li><strong>Smart insights and pattern detection</strong> with role-level context</li>
            <li><strong>Visual dashboards</strong> with comprehensive analytics and trend analysis</li>
            <li><strong>Docker containerization</strong> with Make commands for simplified development</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Start Commands</h2>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Make Commands (Recommended)</h3>
            <div className="space-y-2 font-mono text-sm">
              <div><span className="text-blue-600">make setup</span> - Complete project setup</div>
              <div><span className="text-blue-600">make dev</span> - Start development server</div>
              <div><span className="text-blue-600">make docker-build</span> - Build Docker image</div>
              <div><span className="text-blue-600">make docker-deploy</span> - Deploy with Docker Compose</div>
              <div><span className="text-blue-600">make help</span> - View all available commands</div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Learn More</h2>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-blue-800 mb-4">
              This application is based on performance quantification frameworks for software engineers and engineering managers. 
              Learn more about the theory and methodology behind these approaches:
            </p>
            
            <div className="space-y-3">
              <a 
                href="https://vtorosyan.github.io/performance-reviews-quantification/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                A framework for quantifying software engineer performance
              </a>
              
              <a 
                href="https://vtorosyan.github.io/engineering-manager-performance/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Performance of an engineering manager
              </a>
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg mt-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Getting Started with v3.0</h3>
            <ol className="list-decimal pl-6 space-y-1 text-yellow-800">
              <li>Set up your work categories in the Categories tab</li>
              <li>Configure your role and level in the Role & Level Setup</li>
              <li>Define or edit expectations for your role-level combination</li>
              <li>Set your role-level specific performance targets</li>
              <li>Configure role-based weights (or use defaults)</li>
              <li>Start logging your weekly activities</li>
              <li>Monitor your progress on the Dashboard with 5-band evaluation</li>
            </ol>
          </div>

          <div className="bg-green-50 p-6 rounded-lg mt-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">🚀 Recent Updates</h3>
            <ul className="list-disc pl-6 space-y-1 text-green-800">
              <li><strong>v3.0.0:</strong> 5-band performance system, role-level performance targets, level expectations management, enhanced career guidance</li>
              <li><strong>v2.1.0:</strong> Dynamic evaluation periods (1-52 weeks) with automatic dashboard adjustment</li>
              <li><strong>v2.0.0:</strong> Hybrid database support, Docker containerization, and production deployment</li>
              <li><strong>v1.5.0:</strong> Real-time data refresh, enhanced UX, and mobile responsiveness</li>
            </ul>
          </div>

          <div className="bg-indigo-50 p-6 rounded-lg mt-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">💡 Benefits of v3.0</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-indigo-800 mb-2">For Individual Contributors</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Clear career progression pathways</li>
                  <li>• Level-specific performance expectations</li>
                  <li>• Targeted skill development guidance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-indigo-800 mb-2">For Managers</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Consistent evaluation standards</li>
                  <li>• Role-specific performance metrics</li>
                  <li>• Enhanced team development tools</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 