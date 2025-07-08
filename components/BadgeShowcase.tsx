
import React from 'react';
import { BADGE_DATA } from '../constants';

const BadgeShowcase: React.FC = () => {
  const createBadgeUrl = (label: string, message: string, color: string) => {
    const encodedLabel = encodeURIComponent(label);
    const encodedMessage = encodeURIComponent(message);
    return `https://img.shields.io/badge/${encodedLabel}-${encodedMessage}-${color}.svg?style=for-the-badge`;
  };

  return (
    <div className="space-y-4">
      {BADGE_DATA.map((badge, index) => (
        <div key={index}>
            <p className="text-sm font-medium text-gray-400 mb-1">{badge.category}: <span className="text-white">{badge.label}</span></p>
            <img 
                src={createBadgeUrl(badge.label, badge.message, badge.color)} 
                alt={`${badge.label} badge`}
            />
        </div>
      ))}
    </div>
  );
};

export default BadgeShowcase;
