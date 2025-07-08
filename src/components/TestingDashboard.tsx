/**
 * Testing Dashboard Component
 * 
 * Comprehensive testing dashboard displaying test results,
 * coverage metrics, performance data, and quality insights.
 */

import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Code,
  FileText,
  Play,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { usePerformanceMonitor } from '../utils/performanceMonitor';

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'running';
  duration: number;
  timestamp: string;
  category: 'unit' | 'integration' | 'e2e' | 'performance';
  coverage?: number;
  errors?: string[];
}

interface CoverageData {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

interface PerformanceMetrics {
  averageLoadTime: number;
  averageRenderTime: number;
  memoryUsage: number;
  slowestOperations: Array<{ name: string; duration: number }>;
}

const TestingDashboard: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [coverage, setCoverage] = useState<CoverageData>({
    statements: 85,
    branches: 78,
    functions: 92,
    lines: 87,
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    averageLoadTime: 1200,
    averageRenderTime: 150,
    memoryUsage: 45,
    slowestOperations: [],
  });
  const [isRunningTests, setIsRunningTests] = useState(false);

  const { getPerformanceReport } = usePerformanceMonitor();

  useEffect(() => {
    // Load test results from localStorage or API
    loadTestResults();
    loadPerformanceMetrics();
  }, []);

  const loadTestResults = () => {
    // Mock test results - in real implementation, this would come from test runners
    const mockResults: TestResult[] = [
      {
        id: '1',
        name: 'Dashboard Component Tests',
        status: 'passed',
        duration: 245,
        timestamp: new Date().toISOString(),
        category: 'unit',
        coverage: 92,
      },
      {
        id: '2',
        name: 'Enhanced Dashboard Tests',
        status: 'passed',
        duration: 189,
        timestamp: new Date().toISOString(),
        category: 'unit',
        coverage: 88,
      },
      {
        id: '3',
        name: 'Gemini Service Integration Tests',
        status: 'passed',
        duration: 1234,
        timestamp: new Date().toISOString(),
        category: 'integration',
        coverage: 76,
      },
      {
        id: '4',
        name: 'Requirements Workflow E2E',
        status: 'passed',
        duration: 3456,
        timestamp: new Date().toISOString(),
        category: 'e2e',
      },
      {
        id: '5',
        name: 'Performance Tests',
        status: 'passed',
        duration: 2100,
        timestamp: new Date().toISOString(),
        category: 'performance',
      },
    ];
    setTestResults(mockResults);
  };

  const loadPerformanceMetrics = () => {
    const report = getPerformanceReport();
    setPerformanceMetrics({
      averageLoadTime: report.summary.averagePageLoad || 1200,
      averageRenderTime: report.summary.averageComponentRender || 150,
      memoryUsage: 45, // Mock value
      slowestOperations: report.slowestOperations.slice(0, 5).map(op => ({
        name: op.name,
        duration: op.value,
      })),
    });
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    
    // Simulate running tests
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update test results
    loadTestResults();
    setIsRunningTests(false);
  };

  const getTestStatusCounts = () => {
    return testResults.reduce(
      (acc, test) => {
        acc[test.status]++;
        return acc;
      },
      { passed: 0, failed: 0, skipped: 0, running: 0 }
    );
  };

  const getCoverageChartData = () => ({
    labels: ['Statements', 'Branches', 'Functions', 'Lines'],
    datasets: [
      {
        label: 'Coverage %',
        data: [coverage.statements, coverage.branches, coverage.functions, coverage.lines],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 2,
      },
    ],
  });

  const getTestTrendsData = () => ({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tests Passed',
        data: [45, 52, 48, 61, 55, 67, 58],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Tests Failed',
        data: [2, 1, 3, 0, 2, 1, 0],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  });

  const statusCounts = getTestStatusCounts();
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? Math.round((statusCounts.passed / totalTests) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Testing Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Comprehensive testing metrics and quality insights
          </p>
        </div>
        <motion.button
          onClick={runAllTests}
          disabled={isRunningTests}
          className="flex items-center gap-2 bg-brand-primary text-black px-6 py-3 rounded-lg font-semibold hover:bg-brand-secondary transition-colors disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isRunningTests ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Run All Tests
            </>
          )}
        </motion.button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="bg-gray-900 border border-gray-800 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Tests</p>
              <p className="text-2xl font-bold text-white">{totalTests}</p>
            </div>
            <FileText className="w-8 h-8 text-brand-primary" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-900 border border-gray-800 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pass Rate</p>
              <p className="text-2xl font-bold text-green-400">{passRate}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-900 border border-gray-800 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Coverage</p>
              <p className="text-2xl font-bold text-blue-400">{coverage.statements}%</p>
            </div>
            <Target className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-900 border border-gray-800 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Load Time</p>
              <p className="text-2xl font-bold text-purple-400">{performanceMetrics.averageLoadTime}ms</p>
            </div>
            <Zap className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coverage Chart */}
        <motion.div
          className="bg-gray-900 border border-gray-800 rounded-lg p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Code Coverage</h3>
          <div className="h-64">
            <Bar
              data={getCoverageChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' },
                  },
                  x: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' },
                  },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Test Trends Chart */}
        <motion.div
          className="bg-gray-900 border border-gray-800 rounded-lg p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Test Trends</h3>
          <div className="h-64">
            <Line
              data={getTestTrendsData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: { color: '#9CA3AF' },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' },
                  },
                  x: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' },
                  },
                },
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Test Results Table */}
      <motion.div
        className="bg-gray-900 border border-gray-800 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-xl font-semibold text-white mb-4">Recent Test Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-3 text-gray-400">Test Name</th>
                <th className="pb-3 text-gray-400">Status</th>
                <th className="pb-3 text-gray-400">Duration</th>
                <th className="pb-3 text-gray-400">Category</th>
                <th className="pb-3 text-gray-400">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((test) => (
                <tr key={test.id} className="border-b border-gray-800">
                  <td className="py-3 text-white">{test.name}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        test.status === 'passed'
                          ? 'bg-green-900 text-green-300'
                          : test.status === 'failed'
                          ? 'bg-red-900 text-red-300'
                          : 'bg-yellow-900 text-yellow-300'
                      }`}
                    >
                      {test.status === 'passed' && <CheckCircle className="w-3 h-3" />}
                      {test.status === 'failed' && <AlertTriangle className="w-3 h-3" />}
                      {test.status === 'running' && <Activity className="w-3 h-3" />}
                      {test.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-300">{test.duration}ms</td>
                  <td className="py-3 text-gray-300">{test.category}</td>
                  <td className="py-3 text-gray-300">
                    {test.coverage ? `${test.coverage}%` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default TestingDashboard;
