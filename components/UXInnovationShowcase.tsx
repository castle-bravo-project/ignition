/**
 * UX Innovation Showcase - Complete Demo Component
 * 
 * Comprehensive showcase of all UX Innovation features including interactive widgets,
 * advanced charts, A/B testing, real-time notifications, and customizable dashboards.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProjectData } from '../types';
import InteractiveDashboardWidget, { WidgetData } from './InteractiveDashboardWidget';
import AnimatedChart, { ChartDataPoint } from './AnimatedChart';
import NetworkDiagram, { NetworkNode, NetworkLink } from './NetworkDiagram';
import DrillDownDonutChart, { DonutSegment } from './DrillDownDonutChart';
import ABTestingFramework, { ABTestExperiment } from './ABTestingFramework';
import LiveActivityFeed, { ActivityEvent } from './LiveActivityFeed';
import RealTimeProgressIndicator, { ProgressData } from './RealTimeProgressIndicator';
import CustomizableDashboard, { DashboardWidget, DashboardLayout } from './CustomizableDashboard';
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Users, 
  Target, 
  Activity,
  BarChart3,
  PieChart,
  Network,
  FlaskConical,
  Bell,
  Layout
} from 'lucide-react';

interface UXInnovationShowcaseProps {
  projectData: ProjectData;
  className?: string;
}

const UXInnovationShowcase: React.FC<UXInnovationShowcaseProps> = ({
  projectData,
  className = ''
}) => {
  const [activeDemo, setActiveDemo] = useState<string>('widgets');

  // Sample data for demonstrations
  const sampleWidgets: WidgetData[] = [
    {
      id: 'widget-1',
      title: 'Test Coverage',
      value: '87%',
      trend: 'up',
      trendPercentage: 5,
      status: 'success',
      description: 'Requirements covered by tests',
      lastUpdated: new Date(),
      drillDownData: [
        { label: 'Unit Tests', value: 45, trend: 'up' },
        { label: 'Integration Tests', value: 32, trend: 'stable' },
        { label: 'E2E Tests', value: 10, trend: 'down' }
      ]
    },
    {
      id: 'widget-2',
      title: 'Active Users',
      value: 1247,
      trend: 'up',
      trendPercentage: 12,
      status: 'success',
      description: 'Users in the last 24 hours',
      lastUpdated: new Date()
    },
    {
      id: 'widget-3',
      title: 'System Health',
      value: '94%',
      trend: 'stable',
      trendPercentage: 0,
      status: 'warning',
      description: 'Overall system performance',
      lastUpdated: new Date()
    }
  ];

  const sampleChartData: ChartDataPoint[] = [
    { label: 'Requirements', value: 85, color: '#f59e0b' },
    { label: 'Test Cases', value: 92, color: '#10b981' },
    { label: 'Documentation', value: 78, color: '#3b82f6' },
    { label: 'Code Coverage', value: 88, color: '#8b5cf6' }
  ];

  const sampleNetworkNodes: NetworkNode[] = [
    { id: 'req-1', label: 'User Auth', type: 'requirement', value: 10 },
    { id: 'test-1', label: 'Auth Tests', type: 'test', value: 8 },
    { id: 'ci-1', label: 'Auth Service', type: 'ci', value: 12 },
    { id: 'req-2', label: 'Data API', type: 'requirement', value: 15 },
    { id: 'test-2', label: 'API Tests', type: 'test', value: 10 },
    { id: 'ci-2', label: 'API Gateway', type: 'ci', value: 18 }
  ];

  const sampleNetworkLinks: NetworkLink[] = [
    { source: 'req-1', target: 'test-1', type: 'tests' },
    { source: 'req-1', target: 'ci-1', type: 'implements' },
    { source: 'req-2', target: 'test-2', type: 'tests' },
    { source: 'req-2', target: 'ci-2', type: 'implements' },
    { source: 'ci-1', target: 'ci-2', type: 'depends' }
  ];

  const sampleDonutData: DonutSegment[] = [
    {
      id: 'frontend',
      label: 'Frontend',
      value: 45,
      color: '#f59e0b',
      children: [
        { id: 'react', label: 'React Components', value: 25, color: '#61dafb' },
        { id: 'styles', label: 'Styling', value: 15, color: '#38bdf8' },
        { id: 'assets', label: 'Assets', value: 5, color: '#fbbf24' }
      ]
    },
    {
      id: 'backend',
      label: 'Backend',
      value: 35,
      color: '#10b981',
      children: [
        { id: 'api', label: 'API Routes', value: 20, color: '#059669' },
        { id: 'database', label: 'Database', value: 10, color: '#047857' },
        { id: 'auth', label: 'Authentication', value: 5, color: '#065f46' }
      ]
    },
    {
      id: 'testing',
      label: 'Testing',
      value: 20,
      color: '#8b5cf6',
      children: [
        { id: 'unit', label: 'Unit Tests', value: 12, color: '#7c3aed' },
        { id: 'integration', label: 'Integration', value: 8, color: '#6d28d9' }
      ]
    }
  ];

  const sampleExperiments: ABTestExperiment[] = [
    {
      id: 'exp-1',
      name: 'Dashboard Layout Test',
      description: 'Testing new dashboard layout for better user engagement',
      status: 'running',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      targetMetric: 'User Engagement',
      variants: [
        {
          id: 'control',
          name: 'Control',
          description: 'Current dashboard layout',
          traffic: 50,
          config: { layout: 'current' },
          metrics: { conversions: 245, visitors: 1200, conversionRate: 20.4, confidence: 95.2 }
        },
        {
          id: 'variant-a',
          name: 'New Layout',
          description: 'Redesigned dashboard with better UX',
          traffic: 50,
          config: { layout: 'new' },
          metrics: { conversions: 312, visitors: 1180, conversionRate: 26.4, confidence: 97.8 }
        }
      ],
      segmentation: { criteria: ['new_users', 'mobile_users'], percentage: 100 },
      metadata: {
        createdBy: 'UX Team',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        tags: ['dashboard', 'ux', 'engagement']
      }
    }
  ];

  const sampleActivities: ActivityEvent[] = [
    {
      id: 'act-1',
      type: 'user_action',
      title: 'New requirement added',
      description: 'User authentication requirement has been created',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      user: { name: 'Alice Johnson' },
      metadata: { category: 'Requirements', priority: 'high' }
    },
    {
      id: 'act-2',
      type: 'test_result',
      title: 'Test suite completed',
      description: 'All unit tests passed successfully',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      metadata: { category: 'Testing', priority: 'medium', status: 'completed' }
    },
    {
      id: 'act-3',
      type: 'system_event',
      title: 'Deployment successful',
      description: 'Version 2.1.0 deployed to production',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      metadata: { category: 'Deployment', priority: 'high', status: 'completed' }
    }
  ];

  const sampleProgressData: ProgressData[] = [
    {
      id: 'prog-1',
      label: 'Project Completion',
      current: 67.5,
      target: 100,
      unit: '%',
      type: 'circular',
      status: 'active',
      trend: 'up',
      trendValue: 3.2,
      estimatedCompletion: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      metadata: { description: 'Overall project progress', category: 'Project Management' }
    },
    {
      id: 'prog-2',
      label: 'Test Coverage',
      current: 85,
      target: 95,
      unit: '%',
      type: 'gauge',
      status: 'active',
      trend: 'up',
      metadata: { description: 'Code coverage by tests', category: 'Quality Assurance' }
    },
    {
      id: 'prog-3',
      label: 'Feature Development',
      current: 0,
      target: 100,
      unit: '%',
      type: 'stepped',
      status: 'active',
      metadata: {
        description: 'Feature implementation progress',
        category: 'Development',
        steps: [
          { label: 'Planning', completed: true },
          { label: 'Design', completed: true },
          { label: 'Development', completed: false, current: true },
          { label: 'Testing', completed: false },
          { label: 'Deployment', completed: false }
        ]
      }
    }
  ];

  const demoSections = [
    { id: 'widgets', label: 'Interactive Widgets', icon: Zap },
    { id: 'charts', label: 'Advanced Charts', icon: BarChart3 },
    { id: 'network', label: 'Network Diagrams', icon: Network },
    { id: 'donut', label: 'Drill-Down Charts', icon: PieChart },
    { id: 'abtesting', label: 'A/B Testing', icon: FlaskConical },
    { id: 'activity', label: 'Live Activity', icon: Bell },
    { id: 'progress', label: 'Progress Tracking', icon: TrendingUp },
    { id: 'customizable', label: 'Customizable Dashboard', icon: Layout }
  ];

  const renderDemo = () => {
    switch (activeDemo) {
      case 'widgets':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleWidgets.map((widget) => (
              <InteractiveDashboardWidget
                key={widget.id}
                data={widget}
                onDrillDown={(id) => console.log('Drill down:', id)}
                onRefresh={(id) => console.log('Refresh:', id)}
              />
            ))}
          </div>
        );

      case 'charts':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedChart
              type="bar"
              title="Project Metrics"
              data={sampleChartData}
              height={300}
              animated={true}
            />
            <AnimatedChart
              type="line"
              title="Progress Over Time"
              data={[]}
              timeSeriesData={[
                { timestamp: '9 AM', values: { 'Coverage': 75, 'Quality': 80 } },
                { timestamp: '12 PM', values: { 'Coverage': 82, 'Quality': 85 } },
                { timestamp: '3 PM', values: { 'Coverage': 87, 'Quality': 88 } },
                { timestamp: 'Now', values: { 'Coverage': 92, 'Quality': 91 } }
              ]}
              height={300}
              animated={true}
              realTime={true}
            />
          </div>
        );

      case 'network':
        return (
          <NetworkDiagram
            nodes={sampleNetworkNodes}
            links={sampleNetworkLinks}
            width={800}
            height={500}
            onNodeClick={(node) => console.log('Node clicked:', node)}
            onLinkClick={(link) => console.log('Link clicked:', link)}
          />
        );

      case 'donut':
        return (
          <DrillDownDonutChart
            data={sampleDonutData}
            width={400}
            height={400}
            onSegmentClick={(segment, level) => console.log('Segment clicked:', segment, level)}
            animated={true}
          />
        );

      case 'abtesting':
        return (
          <ABTestingFramework
            experiments={sampleExperiments}
            onCreateExperiment={(exp) => console.log('Create experiment:', exp)}
            onUpdateExperiment={(id, updates) => console.log('Update experiment:', id, updates)}
            onDeleteExperiment={(id) => console.log('Delete experiment:', id)}
          />
        );

      case 'activity':
        return (
          <LiveActivityFeed
            activities={sampleActivities}
            onActivityClick={(activity) => console.log('Activity clicked:', activity)}
            autoRefresh={true}
            refreshInterval={3000}
          />
        );

      case 'progress':
        return (
          <RealTimeProgressIndicator
            progressItems={sampleProgressData}
            onProgressClick={(item) => console.log('Progress clicked:', item)}
            autoUpdate={true}
            updateInterval={2000}
            layout="grid"
          />
        );

      case 'customizable':
        return (
          <div className="text-center py-8">
            <Layout size={48} className="mx-auto mb-4 text-brand-primary" />
            <h3 className="text-xl font-semibold text-white mb-2">Customizable Dashboard</h3>
            <p className="text-gray-400 mb-4">
              Drag-and-drop widgets, resizable panels, and saved layouts
            </p>
            <p className="text-sm text-gray-500">
              This feature requires a full page implementation. Check the CustomizableDashboard component for details.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`bg-gray-900 border border-gray-800 rounded-lg hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all duration-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={24} className="text-brand-primary" />
          <h2 className="text-2xl font-bold text-white">UX Innovation Showcase</h2>
        </div>
        <p className="text-gray-400">
          Explore our advanced UX components with interactive widgets, real-time updates, and modern visualizations.
        </p>
      </div>

      {/* Navigation */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex flex-wrap gap-2">
          {demoSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveDemo(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeDemo === section.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <section.icon size={16} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Demo Content */}
      <div className="p-6">
        <motion.div
          key={activeDemo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderDemo()}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UXInnovationShowcase;
