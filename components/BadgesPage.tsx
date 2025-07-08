
import { Award, Check, Clipboard } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { calculateCmmiAssessment } from '../services/cmmiService';
import { Badge, DocumentSectionData, ProjectData } from '../types';

const createBadgeUrl = (label: string, message: string, color: string) => {
    const encodedLabel = encodeURIComponent(label);
    const encodedMessage = encodeURIComponent(message);
    return `https://img.shields.io/badge/${encodedLabel}-${encodedMessage}-${color}.svg?style=for-the-badge`;
};

const BadgeCard: React.FC<{ badge: Badge }> = ({ badge }) => {
    const [copiedType, setCopiedType] = useState<'md' | 'html' | null>(null);

    const handleCopy = (type: 'md' | 'html') => {
        const badgeUrl = createBadgeUrl(badge.label, badge.message, badge.color);
        const textToCopy = type === 'md'
            ? `![${badge.label}](${badgeUrl})`
            : `<img src="${badgeUrl}" alt="${badge.label}">`;

        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedType(type);
            setTimeout(() => setCopiedType(null), 2000);
        });
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-brand-primary transition-colors">
            <img
                src={createBadgeUrl(badge.label, badge.message, badge.color)}
                alt={`${badge.label} badge`}
                className="flex-shrink-0"
            />
            <div className="flex-grow w-full">
                <p className="text-base font-semibold text-white">{badge.label}</p>
                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={() => handleCopy('md')}
                        className="flex items-center gap-1.5 w-full justify-center px-3 py-1.5 text-xs font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                    >
                        {copiedType === 'md' ? <Check size={14} className="text-green-400"/> : <Clipboard size={14} />}
                        <span>Markdown</span>
                    </button>
                    <button
                        onClick={() => handleCopy('html')}
                        className="flex items-center gap-1.5 w-full justify-center px-3 py-1.5 text-xs font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                    >
                        {copiedType === 'html' ? <Check size={14} className="text-green-400"/> : <Clipboard size={14} />}
                        <span>HTML</span>
                    </button>
                </div>
            </div>
        </div>
    );
};


const BadgesPage: React.FC<{ projectData: ProjectData }> = ({ projectData }) => {
    const { requirements = [], documents = {}, links = {}, testCases = [] } = projectData;

    // --- Metric Calculations ---
    const totalReqs = requirements.length;
    const linkedReqsToTests = requirements.filter(r => links[r.id] && links[r.id].tests.length > 0).length;
    const reqTestCoverage = totalReqs > 0 ? Math.round((linkedReqsToTests / totalReqs) * 100) : 0;

    const linkedReqsToCis = requirements.filter(r => links[r.id] && links[r.id].cis.length > 0).length;
    const ciCoverage = totalReqs > 0 ? Math.round((linkedReqsToCis / totalReqs) * 100) : 0;

    let totalSections = 0;
    let filledSections = 0;
    Object.values(documents).forEach(doc => {
        const countSections = (sections: DocumentSectionData[]) => {
            sections.forEach(s => {
                totalSections++;
                if (s.description && s.description.trim().length > 10) filledSections++;
                if (s.children) countSections(s.children);
            });
        };
        if (doc.content) countSections(doc.content);
    });
    const docCompleteness = totalSections > 0 ? Math.round((filledSections / totalSections) * 100) : 0;

    const totalTests = testCases.length;
    const passedTests = testCases.filter(tc => tc.status === 'Passed').length;
    const testCoverage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    const healthReqTestCoverage = totalReqs > 0 ? (linkedReqsToTests / totalReqs) : 0;
    const healthCiCoverage = totalReqs > 0 ? (linkedReqsToCis / totalReqs) : 0;
    const healthDocCompleteness = totalSections > 0 ? (filledSections / totalSections) : 0;
    const healthTestCoverage = totalTests > 0 ? (passedTests / totalTests) : 0;
    const projectHealth = Math.round(((healthReqTestCoverage + healthCiCoverage + healthDocCompleteness + healthTestCoverage) / 4) * 100);

    const cmmiAssessment = useMemo(() => calculateCmmiAssessment(projectData), [projectData]);
    const cmmiLevel = cmmiAssessment.maturityLevel;

    // --- Dynamic Badge Generation ---
    const getBadgeColor = (value: number, thresholds = [50, 80]) => {
        if (value >= thresholds[1]) return 'brightgreen';
        if (value >= thresholds[0]) return 'yellow';
        return 'red';
    };

    const badges: Badge[] = [
        // Project Status
        { category: 'Project Status', label: 'Health', message: `${projectHealth}/100`, color: getBadgeColor(projectHealth) },
        { category: 'Project Status', label: 'Docs', message: `${docCompleteness}%`, color: getBadgeColor(docCompleteness) },
        { category: 'Project Status', label: 'Reqs Test Coverage', message: `${reqTestCoverage}%`, color: getBadgeColor(reqTestCoverage) },
        { category: 'Project Status', label: 'Test Pass Rate', message: `${testCoverage}%`, color: getBadgeColor(testCoverage) },
        { category: 'Project Status', label: 'CMMI Level', message: `${cmmiLevel}`, color: 'blue' },
        
        // Achievement
        { category: 'Achievement', label: 'Ignition', message: 'Powered', color: 'orange' },
    ];
    
    if (docCompleteness === 100) {
        badges.push({ category: 'Achievement', label: 'Documentation', message: 'Master', color: 'gold' });
    }
    if (reqTestCoverage === 100) {
        badges.push({ category: 'Achievement', label: 'Traceability', message: 'Expert', color: '9cf' });
    }
    if (cmmiLevel >= 3) {
        badges.push({ category: 'Achievement', label: 'Process', message: 'Champion', color: 'blueviolet' });
    }

    // 🎯 META-COMPLIANCE BADGE - World's First! 🏆
    // This badge appears when Ignition manages its own deployment process
    const isMetaCompliant = projectData.projectName?.toLowerCase().includes('ignition') &&
                           projectHealth >= 85 &&
                           cmmiLevel >= 3;

    if (isMetaCompliant) {
        badges.push({
            category: 'Meta-Compliance',
            label: 'Meta-Compliance',
            message: 'Certified',
            color: 'ff6b35' // Epic orange-red gradient color
        });
        badges.push({
            category: 'Meta-Compliance',
            label: 'Self-Managing',
            message: 'AI Platform',
            color: 'ff1744' // Bright red for ultimate achievement
        });
        badges.push({
            category: 'Meta-Compliance',
            label: 'World First',
            message: 'Meta-Compliance',
            color: 'ffd700' // Gold for legendary status
        });
    }

    // Group badges for rendering
    const groupedBadges = badges.reduce((acc, badge) => {
        if (!acc[badge.category]) {
            acc[badge.category] = [];
        }
        acc[badge.category].push(badge);
        return acc;
    }, {} as Record<string, Badge[]>);
    
    const categoryOrder = ['Project Status', 'Achievement'];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Award /> Project Badges</h1>
                <p className="text-gray-400 mt-1">Live-generated badges reflecting your project's status. Copy the snippets to use in your READMEs.</p>
            </div>

            <div className="space-y-10">
                {categoryOrder.map(category => groupedBadges[category] && (
                    <div key={category}>
                        <h2 className="text-2xl font-semibold text-white mb-4 border-b-2 border-gray-800 pb-2">{category}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groupedBadges[category].map(badge => (
                                <BadgeCard key={badge.label} badge={badge} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BadgesPage;
