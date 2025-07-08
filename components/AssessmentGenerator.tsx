/**
 * Assessment Generator Component
 * 
 * AI-powered assessment generation interface for creating comprehensive
 * project assessments with requirements, tests, risks, and configuration items.
 */

import { Brain, FileText, Lightbulb, Target, Zap } from 'lucide-react';
import React, { useState } from 'react';
import AssessmentGenerator, { AssessmentRequest, GeneratedAssessment } from '../services/assessmentGenerator';
import { ProjectData } from '../types';

interface AssessmentGeneratorProps {
  onAssessmentGenerated: (assessment: ProjectData) => void;
  existingProject?: ProjectData;
}

const AssessmentGeneratorComponent: React.FC<AssessmentGeneratorProps> = ({
  onAssessmentGenerated,
  existingProject
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<Partial<AssessmentRequest>>({
    title: '',
    description: '',
    scope: '',
    assessmentType: 'feature_impact',
    focusAreas: [],
    riskTolerance: 'medium',
    detailLevel: 'detailed',
    context: {
      stakeholders: [],
      timeline: '',
      budget: '',
      constraints: [],
      standards: []
    }
  });

  const assessmentTypes = [
    { value: 'feature_impact', label: 'Feature Impact Analysis', icon: Target },
    { value: 'ui_ux_analysis', label: 'UI/UX Impact Assessment', icon: Lightbulb },
    { value: 'security_assessment', label: 'Security Assessment', icon: Zap },
    { value: 'compliance_review', label: 'Compliance Review', icon: FileText },
    { value: 'integration_analysis', label: 'Integration Analysis', icon: Brain },
    { value: 'custom', label: 'Custom Assessment', icon: Target }
  ];

  const focusAreaOptions = [
    'User Interface', 'User Experience', 'Security', 'Performance', 
    'Integration', 'Accessibility', 'Compliance', 'Data Management',
    'API Design', 'Testing Strategy', 'Deployment', 'Monitoring'
  ];

  const complianceStandards = [
    'ISO 27001', 'SOC 2', 'HIPAA', 'GDPR', 'FDA 21 CFR Part 11',
    'PCI DSS', 'FedRAMP', 'NIST', 'CMMI', 'Agile'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContextChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      context: {
        ...prev.context,
        [field]: value
      }
    }));
  };

  const handleFocusAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas?.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...(prev.focusAreas || []), area]
    }));
  };

  const handleStandardToggle = (standard: string) => {
    setFormData(prev => ({
      ...prev,
      context: {
        ...prev.context,
        standards: prev.context?.standards?.includes(standard)
          ? prev.context.standards.filter(s => s !== standard)
          : [...(prev.context?.standards || []), standard]
      }
    }));
  };

  const handleGenerate = async () => {
    if (!formData.title || !formData.description || !formData.scope) {
      alert('Please fill in all required fields (Title, Description, Scope)');
      return;
    }

    if (!formData.focusAreas?.length) {
      alert('Please select at least one focus area');
      return;
    }

    setIsGenerating(true);

    try {
      const generator = new AssessmentGenerator();
      const request: AssessmentRequest = {
        title: formData.title!,
        description: formData.description!,
        scope: formData.scope!,
        assessmentType: formData.assessmentType!,
        focusAreas: formData.focusAreas!,
        riskTolerance: formData.riskTolerance!,
        detailLevel: formData.detailLevel!,
        context: {
          existingProject,
          stakeholders: formData.context?.stakeholders || [],
          timeline: formData.context?.timeline || '',
          budget: formData.context?.budget || '',
          constraints: formData.context?.constraints || [],
          standards: formData.context?.standards || []
        }
      };

      const assessment = await generator.generateAssessment(request);
      onAssessmentGenerated(assessment as ProjectData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        scope: '',
        assessmentType: 'feature_impact',
        focusAreas: [],
        riskTolerance: 'medium',
        detailLevel: 'detailed',
        context: {
          stakeholders: [],
          timeline: '',
          budget: '',
          constraints: [],
          standards: []
        }
      });

    } catch (error) {
      console.error('Assessment generation failed:', error);
      alert('Failed to generate assessment. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Brain className="text-brand-primary" size={32} />
          AI Assessment Generator
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Generate comprehensive project assessments with AI-powered requirements, test cases, 
          risk analysis, and configuration management. Perfect for impact analysis and compliance reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assessment Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., GitHub App UI Integration Impact"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what you're assessing and why..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scope *
              </label>
              <input
                type="text"
                value={formData.scope || ''}
                onChange={(e) => handleInputChange('scope', e.target.value)}
                placeholder="e.g., Authentication system, UI components, API integration"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>
        </div>

        {/* Assessment Configuration */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Assessment Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assessment Type
              </label>
              <select
                value={formData.assessmentType || 'feature_impact'}
                onChange={(e) => handleInputChange('assessmentType', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {assessmentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Detail Level
              </label>
              <select
                value={formData.detailLevel || 'detailed'}
                onChange={(e) => handleInputChange('detailLevel', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="basic">Basic (1 test per requirement)</option>
                <option value="detailed">Detailed (2 tests per requirement)</option>
                <option value="comprehensive">Comprehensive (3 tests per requirement)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Risk Tolerance
              </label>
              <select
                value={formData.riskTolerance || 'medium'}
                onChange={(e) => handleInputChange('riskTolerance', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="low">Low (Conservative approach)</option>
                <option value="medium">Medium (Balanced approach)</option>
                <option value="high">High (Aggressive approach)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Areas */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Focus Areas *</h2>
        <p className="text-gray-400 text-sm mb-4">Select the areas you want to assess (choose at least one)</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {focusAreaOptions.map(area => (
            <label key={area} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.focusAreas?.includes(area) || false}
                onChange={() => handleFocusAreaToggle(area)}
                className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-gray-300">{area}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Compliance Standards */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Compliance Standards</h2>
        <p className="text-gray-400 text-sm mb-4">Select applicable compliance standards (optional)</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {complianceStandards.map(standard => (
            <label key={standard} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.context?.standards?.includes(standard) || false}
                onChange={() => handleStandardToggle(standard)}
                className="rounded border-gray-600 text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-gray-300">{standard}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-3 bg-brand-primary text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              Generating Assessment...
            </>
          ) : (
            <>
              <Brain size={20} />
              Generate AI Assessment
            </>
          )}
        </button>
        
        {isGenerating && (
          <p className="text-gray-400 text-sm mt-2">
            This may take a few moments while AI analyzes your requirements...
          </p>
        )}
      </div>
    </div>
  );
};

export default AssessmentGeneratorComponent;
