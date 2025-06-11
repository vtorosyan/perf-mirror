'use client'

import { BookOpen, ExternalLink, Target, BarChart3, Settings, Scale, Plus } from 'lucide-react'

export default function Readme() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center mb-6">
          <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Welcome to PerfMirror</h1>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            PerfMirror is a performance tracking application designed for engineers and managers 
            to quantify and track performance using a structured, point-based scoring system 
            based on the IOOI framework (Input, Output, Outcome, Impact).
          </p>

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
              <h3 className="text-lg font-semibold text-green-900 mb-3">Performance Formula</h3>
              <p className="text-green-800 mb-2">
                Your performance is calculated as a weighted combination:
              </p>
              <p className="font-mono text-sm bg-green-100 p-2 rounded">
                Score = Input×w₁ + Output×w₂ + Outcome×w₃ + Impact×w₄
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Using the Application</h2>
          
          <div className="grid gap-4 mb-8">
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Dashboard</h4>
                <p className="text-gray-600">View your performance analytics, IOOI breakdown, and smart insights about your work patterns.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <Plus className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Log Work</h4>
                <p className="text-gray-600">Record your weekly activities grouped by IOOI dimensions. Set custom scores or let the system calculate based on categories.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Categories</h4>
                <p className="text-gray-600">Define work categories with fixed scores, organized by Input, Output, Outcome, and Impact dimensions.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <Target className="h-6 w-6 text-red-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Performance Targets</h4>
                <p className="text-gray-600">Set and manage performance thresholds (Excellent: 225+, Good: 170+, Needs Improvement: 120+, Unsatisfactory: &lt;120).</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <Scale className="h-6 w-6 text-orange-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Role Weights</h4>
                <p className="text-gray-600">Configure dimension weights based on your role (Engineer, Manager, Senior Manager, Director) or create custom weightings.</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Performance Bands</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-800">225+</div>
              <div className="text-green-700 font-medium">Excellent</div>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-800">170+</div>
              <div className="text-blue-700 font-medium">Good</div>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-800">120+</div>
              <div className="text-yellow-700 font-medium">Needs Improvement</div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-800">&lt;120</div>
              <div className="text-red-700 font-medium">Unsatisfactory</div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Features</h2>
          
          <ul className="list-disc pl-6 space-y-2 mb-8 text-gray-700">
            <li>Weekly activity logging with real-time IOOI breakdown</li>
            <li>Role-based weighted scoring with customizable weights</li>
            <li>Individual score override capability for exceptional circumstances</li>
            <li>Smart insights and pattern detection (e.g., "High input, low outcome pattern detected")</li>
            <li>Visual dashboards with comprehensive analytics and trend analysis</li>
            <li>Dimension-based categorization using the IOOI framework</li>
          </ul>

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
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Getting Started</h3>
            <ol className="list-decimal pl-6 space-y-1 text-yellow-800">
              <li>Set up your work categories in the Categories tab</li>
              <li>Configure your role weights (or use defaults)</li>
              <li>Set your performance targets</li>
              <li>Start logging your weekly activities</li>
              <li>Monitor your progress on the Dashboard</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
} 