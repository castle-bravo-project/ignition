/**
 * Enhanced Dashboard - UX Innovation Implementation
 * 
 * Advanced dashboard with interactive widgets, animated charts, real-time notifications,
 * and modern UX patterns using Framer Motion and advanced visualization libraries.
 */

import { motion } from 'framer-motion';
import {
    Activity,
    CheckCircle,
    LayoutDashboard,
    Target,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ProjectData } from '../types';
import AiChat from './AiChat';
import AnimatedChart, { ChartDataPoint } from './AnimatedChart';
import BadgeShowcase from './BadgeShowcase';
import InteractiveDashboardWidget, { WidgetData } from './InteractiveDashboardWidget';
import NotificationSystem, { NotificationData, createNotification, showSuccessNotification } from './NotificationSystem';
import RelationshipGraphDashboard from './RelationshipGraphDashboard';
import RiskHeatMap from './RiskHeatMap';
import RtmView from './RtmView';

interface EnhancedDashboardProps {
  projectData: ProjectData;
  onDocumentUpdate: (documentId: string, sectionId: string, newDescription: string, actor: 'User' | 'AI') => void;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ projectData, onDocumentUpdate }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { requirements = [], documents = {}, links = {}, testCases = [], risks = [] } = projectData || {};

  // Calculate metrics with safety checks
  const totalReqs = (requirements || []).length;
  const linkedReqsToTests = (requirements || []).filter(r =>
    links && links[r.id] && links[r.id].tests && links[r.id].tests.length > 0
  ).length;
  const reqTestCoverage = totalReqs > 0 ? Math.round((linkedReqsToTests / totalReqs) * 100) : 0;

  const linkedReqsToCis = (requirements || []).filter(r =>
    links && links[r.id] && links[r.id].cis && links[r.id].cis.length > 0
  ).length;
  const ciCoverage = totalReqs > 0 ? Math.round((linkedReqsToCis / totalReqs) * 100) : 0;
  
  const totalSections = Object.values(documents || {}).reduce((acc, doc) =>
    acc + (doc?.sections?.length || 0), 0
  );
  const filledSections = Object.values(documents || {}).reduce((acc, doc) =>
    acc + (doc?.sections?.filter(section => section?.description?.trim().length > 0).length || 0), 0
  );
  const docCompleteness = totalSections > 0 ? Math.round((filledSections / totalSections) * 100) : 0;
  
  const totalTests = (testCases || []).length;
  const passedTests = (testCases || []).filter(tc => tc.status === 'Passed').length;
  const testPassRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  const openRisks = (risks || []).filter(r => r.status === 'Open').length;
  const projectHealth = Math.round(((reqTestCoverage + ciCoverage + docCompleteness + testPassRate) / 4));

  // Create interactive widget data
  const widgetData: WidgetData[] = [
    {
      id: 'req-test-coverage',
      title: 'Requirements Test Coverage',
      value: `${reqTestCoverage}%`,
      trend: reqTestCoverage >= 80 ? 'up' : reqTestCoverage >= 60 ? 'stable' : 'down',
      trendPercentage: 5,
      status: reqTestCoverage >= 80 ? 'success' : reqTestCoverage >= 60 ? 'warning' : 'error',
      description: `${linkedReqsToTests} of ${totalReqs} requirements covered`,
      lastUpdated: new Date(),
      drillDownData: [
        { label: 'Covered Requirements', value: linkedReqsToTests, trend: 'up' },
        { label: 'Uncovered Requirements', value: totalReqs - linkedReqsToTests, trend: 'down' },
        { label: 'Total Requirements', value: totalReqs, trend: 'stable' }
      ]
    },
    {
      id: 'ci-coverage',
      title: 'Configuration Item Coverage',
      value: `${ciCoverage}%`,
      trend: ciCoverage >= 70 ? 'up' : 'stable',
      trendPercentage: 3,
      status: ciCoverage >= 70 ? 'success' : 'warning',
      description: `${linkedReqsToCis} requirements have CIs`,
      lastUpdated: new Date()
    },
    {
      id: 'doc-completeness',
      title: 'Documentation Completeness',
      value: `${docCompleteness}%`,
      trend: docCompleteness >= 75 ? 'up' : 'stable',
      trendPercentage: 8,
      status: docCompleteness >= 75 ? 'success' : 'warning',
      description: `${filledSections} of ${totalSections} sections completed`,
      lastUpdated: new Date()
    },
    {
      id: 'test-pass-rate',
      title: 'Test Pass Rate',
      value: `${testPassRate}%`,
      trend: testPassRate >= 90 ? 'up' : testPassRate >= 70 ? 'stable' : 'down',
      trendPercentage: 12,
      status: testPassRate >= 90 ? 'success' : testPassRate >= 70 ? 'warning' : 'error',
      description: `${passedTests} of ${totalTests} tests passing`,
      lastUpdated: new Date()
    },
    {
      id: 'project-health',
      title: 'Overall Project Health',
      value: `${projectHealth}%`,
      trend: projectHealth >= 80 ? 'up' : projectHealth >= 60 ? 'stable' : 'down',
      trendPercentage: 7,
      status: projectHealth >= 80 ? 'success' : projectHealth >= 60 ? 'warning' : 'error',
      description: 'Composite health score',
      lastUpdated: new Date()
    },
    {
      id: 'open-risks',
      title: 'Open Risks',
      value: openRisks,
      trend: openRisks <= 3 ? 'up' : openRisks <= 6 ? 'stable' : 'down',
      trendPercentage: 2,
      status: openRisks <= 3 ? 'success' : openRisks <= 6 ? 'warning' : 'error',
      description: 'Risks requiring attention',
      lastUpdated: new Date()
    }
  ];

  // Create chart data
  const coverageChartData: ChartDataPoint[] = [
    { label: 'Test Coverage', value: reqTestCoverage, color: '#10b981' },
    { label: 'CI Coverage', value: ciCoverage, color: '#3b82f6' },
    { label: 'Documentation', value: docCompleteness, color: '#8b5cf6' },
    { label: 'Test Pass Rate', value: testPassRate, color: '#f59e0b' }
  ];

  const timeSeriesData = [
    { timestamp: '9 AM', values: { 'Test Coverage': 75, 'CI Coverage': 60, 'Documentation': 65 } },
    { timestamp: '10 AM', values: { 'Test Coverage': 78, 'CI Coverage': 65, 'Documentation': 68 } },
    { timestamp: '11 AM', values: { 'Test Coverage': 80, 'CI Coverage': 68, 'Documentation': 70 } },
    { timestamp: '12 PM', values: { 'Test Coverage': reqTestCoverage, 'CI Coverage': ciCoverage, 'Documentation': docCompleteness } }
  ];

  // Initialize notifications
  useEffect(() => {
    const initialNotifications: NotificationData[] = [];
    
    if (reqTestCoverage < 60) {
      initialNotifications.push(createNotification(
        'warning',
        'Low Test Coverage',
        `Requirements test coverage is at ${reqTestCoverage}%. Consider adding more test cases.`,
        { metadata: { priority: 'high', category: 'Quality' } }
      ));
    }
    
    if (openRisks > 5) {
      initialNotifications.push(createNotification(
        'error',
        'High Risk Count',
        `${openRisks} open risks detected. Review and mitigate critical risks.`,
        { metadata: { priority: 'critical', category: 'Risk Management' } }
      ));
    }
    
    if (projectHealth >= 80) {
      initialNotifications.push(createNotification(
        'success',
        'Excellent Project Health',
        `Project health score is ${projectHealth}%. Keep up the great work!`,
        { metadata: { priority: 'low', category: 'Achievement' } }
      ));
    }

    setNotifications(initialNotifications);
  }, [reqTestCoverage, openRisks, projectHealth]);

  const handleWidgetDrillDown = (widgetId: string) => {
    showSuccessNotification('Widget Interaction', `Drilling down into ${widgetId} data`);
  };

  const handleWidgetRefresh = (widgetId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showSuccessNotification('Data Refreshed', `${widgetId} data has been updated`);
    }, 1000);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications([]);
    showSuccessNotification('Notifications', 'All notifications marked as read');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onDismiss={handleDismissNotification}
        onMarkAllRead={handleMarkAllRead}
        maxVisible={5}
        position="top-right"
      />

      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard size={32} className="text-brand-primary" />
          <h1 className="text-3xl font-bold text-white">Enhanced Project Dashboard</h1>
        </div>
        <p className="text-gray-400">Real-time insights with interactive visualizations and intelligent notifications.</p>
      </motion.div>

      {/* Interactive Widgets Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        {widgetData.map((widget) => (
          <InteractiveDashboardWidget
            key={widget.id}
            data={widget}
            onDrillDown={handleWidgetDrillDown}
            onRefresh={handleWidgetRefresh}
            isLoading={isLoading}
          />
        ))}
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={itemVariants}
      >
        <AnimatedChart
          type="bar"
          title="Coverage Metrics"
          data={coverageChartData}
          height={300}
          animated={true}
          onDataPointClick={(dataPoint, index) => {
            showSuccessNotification('Chart Interaction', `Clicked on ${dataPoint.label}: ${dataPoint.value}%`);
          }}
        />
        
        <AnimatedChart
          type="line"
          title="Progress Over Time"
          data={[]}
          timeSeriesData={timeSeriesData}
          height={300}
          animated={true}
          realTime={true}
        />
      </motion.div>

      {/* Main Content Grid */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all duration-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="text-brand-primary" size={20} />
            Live Traceability View
          </h2>
          <p className="text-sm text-gray-400 mb-4">Interactive view of requirements coverage and implementation status.</p>
          <RtmView projectData={projectData} />
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all duration-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="text-brand-primary" size={20} />
            Risk Heat Map
          </h2>
          <p className="text-sm text-gray-400 mt-1 mb-6">Interactive risk visualization by probability and impact.</p>
          <div className="flex-grow flex items-center justify-center">
            <div className="w-full max-w-xs mx-auto">
              <RiskHeatMap risks={projectData.risks} isInteractive={false} />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Relationship Graph Dashboard */}
      <motion.div variants={itemVariants}>
        <RelationshipGraphDashboard projectData={projectData} />
      </motion.div>

      {/* AI Assistant and Badges */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all duration-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="text-brand-primary" size={20} />
            AI Assistant
          </h2>
          <AiChat projectData={projectData} onDocumentUpdate={onDocumentUpdate} />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all duration-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="text-brand-primary" size={20} />
            Project Badges
          </h2>
          <BadgeShowcase />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedDashboard;
