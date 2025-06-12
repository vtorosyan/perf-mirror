'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Settings, Target, TrendingUp, Plus, Scale, BookOpen } from 'lucide-react'
import Dashboard from '@/components/Dashboard'
import Categories from '@/components/Categories'
import WeeklyLog from '@/components/WeeklyLog'
import PerformanceTargets from '@/components/PerformanceTargets'
import RoleWeights from '@/components/RoleWeights'
import Readme from '@/components/Readme'

type Tab = 'dashboard' | 'log' | 'categories' | 'targets' | 'weights' | 'readme'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [tabSwitchTime, setTabSwitchTime] = useState<number>(Date.now())
  
  const handleTabSwitch = (tab: Tab) => {
    setActiveTab(tab)
    setTabSwitchTime(Date.now()) // Force fresh data fetch
  }

  const tabs = [
    { id: 'dashboard' as Tab, name: 'Dashboard', icon: BarChart3 },
    { id: 'log' as Tab, name: 'Log Work', icon: Plus },
    { id: 'categories' as Tab, name: 'Categories', icon: Settings },
    { id: 'targets' as Tab, name: 'Targets', icon: Target },
    { id: 'weights' as Tab, name: 'Role Weights', icon: Scale },
    { id: 'readme' as Tab, name: 'Readme', icon: BookOpen },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">PerfMirror</h1>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabSwitch(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard key={`dashboard-${tabSwitchTime}`} />}
        {activeTab === 'log' && <WeeklyLog key={`log-${tabSwitchTime}`} />}
        {activeTab === 'categories' && <Categories key={`categories-${tabSwitchTime}`} />}
        {activeTab === 'targets' && <PerformanceTargets key={`targets-${tabSwitchTime}`} />}
        {activeTab === 'weights' && <RoleWeights key={`weights-${tabSwitchTime}`} />}
        {activeTab === 'readme' && <Readme key={`readme-${tabSwitchTime}`} />}
      </main>
    </div>
  )
} 