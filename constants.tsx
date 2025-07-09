

import { AlertCircle, Award, BarChart3, CheckSquare, ClipboardCheck, FileText, GitPullRequestArrow, History, LayoutDashboard, Library, Network, Package, Settings, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import React from 'react';
import { Badge, Metric, Page } from './types';

export const NAV_ITEMS: { name: Page; icon: React.ReactNode }[] = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Documents', icon: <FileText size={20} /> },
  { name: 'Requirements', icon: <CheckSquare size={20} /> },
  { name: 'Test Cases', icon: <ClipboardCheck size={20} /> },
  { name: 'Configuration', icon: <Package size={20} /> },
  { name: 'Architecture', icon: <Network size={20} /> },
  { name: 'Organizational Intelligence', icon: <BarChart3 size={20} /> },
  { name: 'Process Assets', icon: <Library size={20} /> },
  { name: 'Pull Requests', icon: <GitPullRequestArrow size={20}/>},
  { name: 'Issues', icon: <AlertCircle size={20}/> },
  { name: 'Risks', icon: <ShieldAlert size={20} /> },
  { name: 'CMMI', icon: <Award size={20} /> },
  { name: 'Quality Assurance', icon: <Shield size={20} /> },
  { name: 'Compliance', icon: <ShieldAlert size={20} /> },
  { name: 'Compliance Dashboard', icon: <Shield size={20} /> },
  { name: 'Security', icon: <ShieldCheck size={20} /> },
  { name: 'AI Assessment', icon: <BarChart3 size={20} /> },
  { name: 'Badges', icon: <Award size={20} /> },
  { name: 'Audit Log', icon: <History size={20} /> },
  { name: 'Settings', icon: <Settings size={20} /> },
];

export const PROJECT_METRICS: Metric[] = [
  { title: 'Project Health', value: 92, unit: '/ 100', description: 'Overall project score', change: '+5%', changeType: 'increase' },
  { title: 'Doc Completeness', value: 85, unit: '%', description: 'Status of all project documents', change: '+2%', changeType: 'increase' },
  { title: 'Requirements Coverage', value: 95, unit: '%', description: 'Linked requirements to test cases', change: '0%', },
  { title: 'Test Coverage', value: 88, unit: '%', description: 'Automated and manual test coverage', change: '-1%', changeType: 'decrease' },
];

export const BADGE_DATA: Badge[] = [
    { category: 'Project Status', label: 'Health', message: '92', color: 'brightgreen' },
    { category: 'Project Status', label: 'Docs', message: '85%', color: 'green' },
    { category: 'Project Status', label: 'Tests', message: '88%', color: 'green' },
    { category: 'Project Status', label: 'CMMI Level', message: '3', color: 'blue' },
    { category: 'Achievement', label: 'Ignition', message: 'Powered', color: 'orange' },
    { category: 'Achievement', label: 'Traceability', message: 'Expert', color: 'purple' },
    { category: 'Time-Based', label: 'Maintainer', message: '6+ months', color: 'informational' },
    { category: 'Methodology', label: 'DevOps', message: 'Integrated', color: 'blueviolet' },
];

export const CMMI_PA_FULL_NAMES: { [key: string]: string } = {
  PP: 'Project Planning',
  REQM: 'Requirements Management',
  CM: 'Configuration Management',
  IPM: 'Integrated Project Management',
  TS: 'Technical Solution',
  VAL: 'Validation',
  VER: 'Verification',
  RSKM: 'Risk Management',
  PPQA: 'Process and Product Quality Assurance',
  MA: 'Measurement and Analysis',
  RD: 'Requirements Development',
  PMC: 'Project Monitoring and Control',
  OT: 'Organizational Training',
  OPD: 'Organizational Process Definition',
  QPM: 'Quantitative Project Management',
  CAR: 'Causal Analysis and Resolution',
  OPP: 'Organizational Process Performance',
  SAM: 'Supplier Agreement Management',
  DAR: 'Decision Analysis and Resolution',
  OID: 'Organizational Innovation and Deployment',
};

export const CMMI_LEVELS: { [level: number]: string[] } = {
  2: ['PP', 'REQM', 'CM', 'MA', 'PPQA', 'SAM'],
  3: ['RD', 'TS', 'VER', 'VAL', 'RSKM', 'IPM', 'PMC', 'OPD', 'OT', 'DAR'],
};

export const ASSESSABLE_PA_IDS: string[] = Array.from(new Set(Object.values(CMMI_LEVELS).flat()));