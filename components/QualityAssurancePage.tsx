import React, { useState, useMemo } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Info, TrendingUp, Filter } from 'lucide-react';
import { ProjectData } from '../types';
import { 
  performQualityAssessment, 
  ValidationIssue, 
  qualityGates,
  validateCustomRules 
} from '../services/qualityAssuranceService';

interface QualityAssurancePageProps {
  projectData: ProjectData;
}

const QualityAssurancePage: React.FC<QualityAssurancePageProps> = ({ projectData }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const qualityAssessment = useMemo(() => {
    const assessment = performQualityAssessment(projectData);
    const customRulesResult = validateCustomRules(projectData);
    
    return {
      ...assessment,
      allIssues: [...assessment.allIssues, ...customRulesResult.issues]
    };
  }, [projectData]);

  const filteredIssues = useMemo(() => {
    return qualityAssessment.allIssues.filter(issue => {
      const severityMatch = selectedSeverity === 'all' || issue.severity === selectedSeverity;
      const categoryMatch = selectedCategory === 'all' || issue.category === selectedCategory;
      return severityMatch && categoryMatch;
    });
  }, [qualityAssessment.allIssues, selectedSeverity, selectedCategory]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="text-red-500" size={16} />;
      case 'high': return <AlertTriangle className="text-orange-500" size={16} />;
      case 'medium': return <Info className="text-yellow-500" size={16} />;
      case 'low': return <Info className="text-blue-500" size={16} />;
      default: return <Info className="text-gray-500" size={16} />;
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Shield />
          Quality Assurance Dashboard
        </h1>
        <p className="text-gray-400 mt-1">
          Comprehensive quality assessment and validation results
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Overall Quality Score</h2>
            <div className="flex items-center gap-4">
              <span className={`text-4xl font-bold ${getScoreColor(qualityAssessment.overallScore)}`}>
                {qualityAssessment.overallScore}%
              </span>
              <div className="flex items-center gap-2">
                {qualityAssessment.isReadyForRelease ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : (
                  <XCircle className="text-red-500" size={20} />
                )}
                <span className={qualityAssessment.isReadyForRelease ? 'text-green-400' : 'text-red-400'}>
                  {qualityAssessment.isReadyForRelease ? 'Ready for Release' : 'Not Ready for Release'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Total Issues</div>
            <div className="text-2xl font-bold text-white">{qualityAssessment.allIssues.length}</div>
          </div>
        </div>
      </div>

      {/* Quality Gates */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quality Gates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {qualityGates.map(gate => {
            const result = qualityAssessment.gateResults[gate.id];
            return (
              <div key={gate.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{gate.name}</h3>
                  {result.passed ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <XCircle className="text-red-500" size={20} />
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-3">{gate.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                    {result.score}%
                  </span>
                  <span className="text-sm text-gray-400">
                    Required: {gate.requiredScore}%
                  </span>
                </div>
                {gate.isBlocking && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/50 text-red-300 border border-red-700">
                      Blocking
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Issues Filter */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Quality Issues</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white text-sm"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white text-sm"
            >
              <option value="all">All Categories</option>
              <option value="completeness">Completeness</option>
              <option value="consistency">Consistency</option>
              <option value="traceability">Traceability</option>
              <option value="quality">Quality</option>
              <option value="compliance">Compliance</option>
            </select>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <p className="text-gray-400">No quality issues found with current filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map(issue => (
              <div key={issue.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getSeverityIcon(issue.severity)}
                      <h3 className="font-semibold text-white">{issue.title}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
                        {issue.category}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-2">{issue.description}</p>
                    {issue.affectedItems.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">Affected items: </span>
                        <span className="text-sm text-gray-300">{issue.affectedItems.join(', ')}</span>
                      </div>
                    )}
                    {issue.suggestedFix && (
                      <div className="bg-gray-700 border border-gray-600 rounded p-3 mt-3">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp size={14} className="text-brand-primary" />
                          <span className="text-sm font-medium text-brand-primary">Suggested Fix</span>
                        </div>
                        <p className="text-sm text-gray-300">{issue.suggestedFix}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {qualityAssessment.recommendations.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recommendations</h2>
          <ul className="space-y-2">
            {qualityAssessment.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-3">
                <TrendingUp size={16} className="text-brand-primary mt-1 flex-shrink-0" />
                <span className="text-gray-300">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QualityAssurancePage;
