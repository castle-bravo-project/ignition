import { AlertTriangle, CheckCircle, FileText, Info, Lock, Shield, Users, XCircle, Zap } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
    assessCompliance,
    COMPLIANCE_STANDARDS,
    ComplianceAssessment
} from '../services/complianceService';
import { ProjectData } from '../types';

interface CompliancePageProps {
  projectData: ProjectData;
}

const CompliancePage: React.FC<CompliancePageProps> = ({ projectData }) => {
  const [selectedStandard, setSelectedStandard] = useState<string>('iso27001');
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  const assessments = useMemo(() => {
    const results: { [standardId: string]: ComplianceAssessment } = {};
    COMPLIANCE_STANDARDS.forEach(standard => {
      results[standard.id] = assessCompliance(projectData, standard.id);
    });
    return results;
  }, [projectData]);

  const currentStandard = COMPLIANCE_STANDARDS.find(s => s.id === selectedStandard);
  const currentAssessment = assessments[selectedStandard];

  const getStandardIcon = (standardId: string) => {
    switch (standardId) {
      case 'iso27001': return <Shield className="text-blue-500" size={20} />;
      case 'soc2': return <Lock className="text-green-500" size={20} />;
      case 'hipaa': return <Users className="text-purple-500" size={20} />;
      case 'fda-cfr-11': return <FileText className="text-orange-500" size={20} />;
      case 'fre-legal': return <Zap className="text-red-500" size={20} />;
      default: return <Shield className="text-gray-500" size={20} />;
    }
  };

  const getComplianceStatusIcon = (isCompliant: boolean) => {
    return isCompliant ? 
      <CheckCircle className="text-green-500" size={20} /> : 
      <XCircle className="text-red-500" size={20} />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900/50 text-red-300 border-red-700';
      case 'high': return 'bg-orange-900/50 text-orange-300 border-orange-700';
      case 'medium': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      case 'low': return 'bg-blue-900/50 text-blue-300 border-blue-700';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-700';
    }
  };

  const getControlStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="text-green-500" size={16} />;
      case 'partial': return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'non-compliant': return <XCircle className="text-red-500" size={16} />;
      case 'not-applicable': return <Info className="text-gray-500" size={16} />;
      default: return <Info className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Shield />
          Compliance Dashboard
        </h1>
        <p className="text-gray-400 mt-1">
          Multi-standard compliance assessment and gap analysis
        </p>
      </div>

      {/* Standards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COMPLIANCE_STANDARDS.map(standard => {
          const assessment = assessments[standard.id];
          return (
            <div 
              key={standard.id}
              className={`bg-gray-900 border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedStandard === standard.id ? 'border-brand-primary' : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => setSelectedStandard(standard.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStandardIcon(standard.id)}
                  <h3 className="font-semibold text-white">{standard.name}</h3>
                </div>
                {getComplianceStatusIcon(assessment.isCompliant)}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${getScoreColor(assessment.overallScore)}`}>
                  {assessment.overallScore}%
                </span>
                <span className="text-sm text-gray-400">
                  {assessment.gaps.length} gaps
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Standard Details */}
      {currentStandard && currentAssessment && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                {getStandardIcon(selectedStandard)}
                {currentStandard.name}
              </h2>
              <p className="text-gray-400 mt-1">{currentStandard.description}</p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(currentAssessment.overallScore)}`}>
                {currentAssessment.overallScore}%
              </div>
              <div className="flex items-center gap-2 mt-1">
                {getComplianceStatusIcon(currentAssessment.isCompliant)}
                <span className={currentAssessment.isCompliant ? 'text-green-400' : 'text-red-400'}>
                  {currentAssessment.isCompliant ? 'Compliant' : 'Non-Compliant'}
                </span>
              </div>
            </div>
          </div>

          {/* Domain Scores */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Domain Scores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentStandard.domains.map(domain => {
                const score = currentAssessment.domainScores[domain.id] || 0;
                return (
                  <div key={domain.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">{domain.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className={`text-xl font-bold ${getScoreColor(score)}`}>
                        {score}%
                      </span>
                      <button
                        onClick={() => setSelectedDomain(selectedDomain === domain.id ? '' : domain.id)}
                        className="text-brand-primary hover:text-brand-secondary text-sm"
                      >
                        {selectedDomain === domain.id ? 'Hide' : 'Details'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Domain Details */}
          {selectedDomain && (
            <div className="mb-6">
              {currentStandard.domains
                .filter(domain => domain.id === selectedDomain)
                .map(domain => (
                  <div key={domain.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3">{domain.name}</h4>
                    <p className="text-gray-400 mb-4">{domain.description}</p>
                    
                    <div className="space-y-3">
                      {domain.controls.map(control => {
                        const result = currentAssessment.controlResults[control.id];
                        return (
                          <div key={control.id} className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {getControlStatusIcon(result.status)}
                                  <h5 className="font-semibold text-white">{control.id} - {control.name}</h5>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(control.severity)}`}>
                                    {control.severity}
                                  </span>
                                </div>
                                <p className="text-gray-400 text-sm mb-2">{control.description}</p>
                                <div className="text-sm">
                                  <span className="text-gray-500">Score: </span>
                                  <span className={`font-semibold ${getScoreColor(result.score)}`}>
                                    {result.score}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {result.evidence.length > 0 && (
                              <div className="mt-3">
                                <h6 className="text-sm font-medium text-green-400 mb-1">Evidence:</h6>
                                <ul className="text-sm text-gray-300 space-y-1">
                                  {result.evidence.map((evidence, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <CheckCircle size={12} className="text-green-500 mt-1 flex-shrink-0" />
                                      {evidence}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {result.gaps.length > 0 && (
                              <div className="mt-3">
                                <h6 className="text-sm font-medium text-red-400 mb-1">Gaps:</h6>
                                <ul className="text-sm text-gray-300 space-y-1">
                                  {result.gaps.map((gap, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <XCircle size={12} className="text-red-500 mt-1 flex-shrink-0" />
                                      {gap}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Critical Gaps */}
          {currentAssessment.gaps.filter(gap => gap.severity === 'critical').length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-500" />
                Critical Gaps
              </h3>
              <div className="space-y-3">
                {currentAssessment.gaps
                  .filter(gap => gap.severity === 'critical')
                  .map(gap => (
                    <div key={gap.id} className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                      <h4 className="font-semibold text-red-300 mb-2">{gap.title}</h4>
                      <p className="text-gray-300 text-sm mb-2">{gap.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Impact: </span>
                          <span className="text-gray-300">{gap.impact}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Estimated Effort: </span>
                          <span className="text-gray-300">{gap.estimatedEffort}</span>
                        </div>
                      </div>
                      <div className="mt-3 bg-gray-800 border border-gray-600 rounded p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap size={14} className="text-brand-primary" />
                          <span className="text-sm font-medium text-brand-primary">Remediation</span>
                        </div>
                        <p className="text-sm text-gray-300">{gap.remediation}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {currentAssessment.recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
              <ul className="space-y-2">
                {currentAssessment.recommendations.slice(0, 10).map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Zap size={16} className="text-brand-primary mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompliancePage;
