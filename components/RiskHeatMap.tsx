
import React from 'react';
import { Risk } from '../types';

type Level = 'Low' | 'Medium' | 'High';

interface RiskHeatMapProps {
  risks: Risk[];
  onCellClick?: (risks: Risk[], title: string) => void;
  isInteractive?: boolean;
}

const PROBABILITY_LEVELS: Level[] = ['Low', 'Medium', 'High'];
const IMPACT_LEVELS: Level[] = ['High', 'Medium', 'Low']; // Reversed for visual layout (High at top)

const CELL_COLORS = [
    'bg-green-500/10 hover:bg-green-500/20', // Low/Low
    'bg-yellow-500/10 hover:bg-yellow-500/20', // Low/Med, Med/Low
    'bg-yellow-500/20 hover:bg-yellow-500/30', // Low/High, Med/Med, High/Low
    'bg-orange-500/20 hover:bg-orange-500/30', // Med/High, High/Med
    'bg-red-500/30 hover:bg-red-500/40', // High/High
];

const BUBBLE_COLORS = [
    'bg-green-500',
    'bg-yellow-500',
    'bg-yellow-400',
    'bg-orange-500',
    'bg-red-500',
];


const RiskHeatMap: React.FC<RiskHeatMapProps> = ({ risks, onCellClick = () => {}, isInteractive = true }) => {
    const riskMatrix: { [key: string]: Risk[] } = {};

    PROBABILITY_LEVELS.forEach(prob => {
        IMPACT_LEVELS.forEach(impact => {
            riskMatrix[`${prob}-${impact}`] = [];
        });
    });

    risks.forEach(risk => {
        if(risk.probability && risk.impact) {
            riskMatrix[`${risk.probability}-${risk.impact}`].push(risk);
        }
    });

    const getSeverityIndex = (prob: Level, impact: Level): number => {
        const probIndex = PROBABILITY_LEVELS.indexOf(prob);
        const impactIndex = PROBABILITY_LEVELS.indexOf(impact); // Use same order as prob for index
        return probIndex + impactIndex;
    }

    return (
        <div className="flex items-stretch w-full">
            <div className="flex flex-col justify-between text-xs font-bold text-gray-400 py-4 pr-2 text-right">
                <span className="h-1/3 flex items-start pt-2">High</span>
                <span className="h-1/3 flex items-center">Impact</span>
                <span className="h-1/3 flex items-end pb-2">Low</span>
            </div>
            <div className="flex-1">
                <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full aspect-square">
                {IMPACT_LEVELS.map((impact) => (
                    PROBABILITY_LEVELS.map((prob) => {
                        const cellRisks = riskMatrix[`${prob}-${impact}`];
                        const count = cellRisks.length;
                        const severityIndex = getSeverityIndex(prob, impact);
                        const cellColor = CELL_COLORS[severityIndex];
                        const bubbleColor = BUBBLE_COLORS[severityIndex];
                        const cursorClass = isInteractive && count > 0 ? 'cursor-pointer' : 'cursor-default';
                        
                        const scale = count > 0 ? Math.min(1, 0.4 + (count / 5) * 0.6) : 0;
                        
                        return (
                            <div
                                key={`${prob}-${impact}`}
                                className={`relative flex items-center justify-center rounded-lg transition-colors duration-200 ${cellColor} ${cursorClass}`}
                                onClick={() => isInteractive && count > 0 && onCellClick(cellRisks, `${prob} Probability / ${impact} Impact Risks`)}
                                title={`${count} risk(s)`}
                            >
                                {count > 0 && (
                                    <div 
                                        className={`absolute flex items-center justify-center rounded-full text-white font-bold text-lg shadow-lg ${bubbleColor}`}
                                        style={{
                                            width: `${scale * 100}%`,
                                            height: `${scale * 100}%`,
                                            minWidth: '24px',
                                            minHeight: '24px',
                                            transition: 'transform 0.2s ease-out, width 0.2s, height 0.2s'
                                        }}
                                    >
                                        {count}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ))}
                </div>
                 <div className="flex justify-between text-xs font-bold text-gray-400 px-2 pt-2">
                    <span>Low</span>
                    <span>Probability</span>
                    <span>High</span>
                </div>
            </div>
        </div>
    );
};

export default RiskHeatMap;
