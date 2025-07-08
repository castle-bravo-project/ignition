import React from 'react';
import { Library, X, Loader, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { ProcessAsset } from '../types';

interface AiSuggestionCardProps {
  isLoading: boolean;
  suggestedAsset: ProcessAsset | null;
  onApply: () => void;
  onDismiss: () => void;
  context?: 'requirement' | 'risk' | 'test' | 'ci';
  className?: string;
}

const AiSuggestionCard: React.FC<AiSuggestionCardProps> = ({
  isLoading,
  suggestedAsset,
  onApply,
  onDismiss,
  context = 'requirement',
  className = ''
}) => {
  if (!isLoading && !suggestedAsset) return null;

  const contextConfig = {
    requirement: {
      color: 'purple',
      icon: Library,
      title: 'Requirement Archetype',
      description: 'Similar requirement pattern found'
    },
    risk: {
      color: 'orange',
      icon: Library,
      title: 'Risk Playbook',
      description: 'Similar risk scenario found'
    },
    test: {
      color: 'blue',
      icon: Library,
      title: 'Test Strategy',
      description: 'Similar test approach found'
    },
    ci: {
      color: 'green',
      icon: Library,
      title: 'Solution Blueprint',
      description: 'Similar component pattern found'
    }
  };

  const config = contextConfig[context];
  const IconComponent = config.icon;

  return (
    <div className={`mt-3 p-4 bg-gradient-to-r from-${config.color}-900/20 to-${config.color}-800/10 border border-${config.color}-700/50 rounded-lg backdrop-blur-sm ${className}`}>
      {isLoading ? (
        <div className="flex items-center gap-3 text-gray-300">
          <div className="relative">
            <Loader size={18} className="animate-spin text-brand-primary" />
            <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-200">AI is analyzing your input...</div>
            <div className="text-xs text-gray-400 mt-1">Looking for similar process assets</div>
          </div>
        </div>
      ) : suggestedAsset ? (
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md bg-${config.color}-600/20`}>
                <IconComponent size={16} className={`text-${config.color}-400`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold text-${config.color}-300`}>
                    AI Suggestion
                  </span>
                  <Sparkles size={12} className="text-yellow-400" />
                </div>
                <div className="text-xs text-gray-400">{config.description}</div>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700/50"
              title="Dismiss suggestion"
            >
              <X size={16} />
            </button>
          </div>

          {/* Asset Info */}
          <div className="bg-gray-800/30 rounded-md p-3 border border-gray-700/30">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-white text-sm">{suggestedAsset.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{suggestedAsset.description}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 ml-3">
                <TrendingUp size={12} />
                <span>High Match</span>
              </div>
            </div>
            
            {/* Preview of content */}
            <div className="text-xs text-gray-300 bg-gray-900/50 rounded p-2 mt-2 border-l-2 border-brand-primary/50">
              <div className="font-mono">
                {suggestedAsset.content.length > 120 
                  ? `${suggestedAsset.content.substring(0, 120)}...`
                  : suggestedAsset.content
                }
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={12} />
              <span>Last used {new Date(suggestedAsset.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDismiss}
                className="text-xs px-3 py-1.5 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700/50"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={onApply}
                className={`text-xs px-4 py-1.5 bg-${config.color}-600 text-white rounded-md hover:bg-${config.color}-700 transition-colors font-medium flex items-center gap-1.5`}
              >
                <Sparkles size={12} />
                Apply Template
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AiSuggestionCard;
