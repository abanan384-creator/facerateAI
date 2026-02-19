import React, { useState } from 'react';
import { AnalysisScores } from '@/lib/state';
import { analyzeScores, RECOMMENDATIONS, MetricInsight } from '@/lib/recommendations';

interface InsightsCardProps {
    scores: AnalysisScores;
}

const StatusBadge = ({ status }: { status: MetricInsight['status'] }) => {
    const styles: Record<string, string> = {
        excellent: 'bg-primary/10 text-primary border-primary/20',
        good: 'bg-primary/5 text-primary/70 border-primary/10',
        average: 'bg-text/5 text-text/50 border-text/10',
        needs_improvement: 'bg-text/5 text-text/40 border-text/10'
    };

    const labels: Record<string, string> = {
        excellent: 'Excellent',
        good: 'Good',
        average: 'Average',
        needs_improvement: 'Needs Work'
    };

    return (
        <span className={`text-[8px] px-2 py-0.5 rounded-sm border ${styles[status]} uppercase tracking-wider font-bold`}>
            {labels[status]}
        </span>
    );
};

const MetricRow = ({ insight, onClick, isExpanded }: {
    insight: MetricInsight;
    onClick: () => void;
    isExpanded: boolean;
}) => {
    const hasRecommendation = RECOMMENDATIONS[insight.metric];
    const shouldShowTip = insight.status === 'needs_improvement' || insight.status === 'average';

    return (
        <div className="mb-3 last:mb-0">
            <div
                className={`flex items-center justify-between p-3 rounded-md bg-surface border border-text/10 hover:border-text/15 transition-opacity duration-150 ${hasRecommendation && shouldShowTip ? 'cursor-pointer' : ''
                    }`}
                onClick={hasRecommendation && shouldShowTip ? onClick : undefined}
            >
                <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-text">{insight.label}</span>
                            <StatusBadge status={insight.status} />
                        </div>
                        {/* Progress bar */}
                        <div className="h-1 w-full bg-text/5 rounded-sm overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-700"
                                style={{ width: `${insight.value}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-base font-semibold text-text/70">{insight.value}</span>
                </div>

                {hasRecommendation && shouldShowTip && (
                    <div className="ml-3 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-sm border border-text/10 flex items-center justify-center">
                            <span className={`text-text/25 text-[9px] transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Expanded Recommendations */}
            {isExpanded && hasRecommendation && (
                <div className="mt-2 p-4 bg-bg border border-text/10 rounded-md">
                    <div className="flex items-start gap-2 mb-3">
                        <div>
                            <h4 className="text-sm font-semibold text-primary mb-1">
                                {RECOMMENDATIONS[insight.metric].title}
                            </h4>
                            <p className="text-[10px] text-text/40 leading-relaxed mb-3">
                                {RECOMMENDATIONS[insight.metric].problem}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 mb-3">
                        <p className="text-[9px] text-primary/60 font-bold uppercase tracking-wider mb-2">
                            Recommendations:
                        </p>
                        {RECOMMENDATIONS[insight.metric].solutions.map((solution, idx) => (
                            <div key={idx} className="text-[10px] text-text/50 leading-relaxed pl-2 flex gap-2">
                                <span className="text-text/20">•</span>
                                <span>{solution}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 pt-3 border-t border-text/10">
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] text-text/25 uppercase tracking-wider font-medium">Difficulty:</span>
                            <span className={`text-[8px] px-2 py-0.5 rounded-sm border font-bold ${RECOMMENDATIONS[insight.metric].difficulty === 'easy' ? 'bg-primary/5 text-primary/60 border-primary/10' :
                                RECOMMENDATIONS[insight.metric].difficulty === 'medium' ? 'bg-text/5 text-text/40 border-text/10' :
                                    'bg-text/5 text-text/50 border-text/15'
                                }`}>
                                {RECOMMENDATIONS[insight.metric].difficulty === 'easy' ? 'Easy' :
                                    RECOMMENDATIONS[insight.metric].difficulty === 'medium' ? 'Medium' :
                                        'Hard'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] text-text/25 uppercase tracking-wider font-medium">Timeframe:</span>
                            <span className="text-[8px] text-primary/60 font-medium">
                                {RECOMMENDATIONS[insight.metric].timeframe}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const InsightsCard = ({ scores }: InsightsCardProps) => {
    const { strengths, improvements } = analyzeScores(scores);
    const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

    const toggleMetric = (metric: string) => {
        setExpandedMetric(expandedMetric === metric ? null : metric);
    };

    return (
        <div className="w-full max-w-sm bg-surface border border-text/10 rounded-lg p-8">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-primary mb-1">Analysis & Recommendations</h3>
                <p className="text-[10px] text-text/35 leading-relaxed font-medium">
                    Personalized improvement suggestions
                </p>
            </div>

            {/* Strengths */}
            {strengths.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <h4 className="text-[10px] text-primary font-bold uppercase tracking-widest">
                            Strengths
                        </h4>
                    </div>
                    <div>
                        {strengths.map((insight) => (
                            <MetricRow
                                key={insight.metric}
                                insight={insight}
                                onClick={() => toggleMetric(insight.metric)}
                                isExpanded={expandedMetric === insight.metric}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Improvements */}
            {improvements.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-1.5 h-1.5 bg-text/20 rounded-full" />
                        <h4 className="text-[10px] text-text/40 font-bold uppercase tracking-widest">
                            Areas for Growth
                        </h4>
                    </div>
                    <div>
                        {improvements.map((insight) => (
                            <MetricRow
                                key={insight.metric}
                                insight={insight}
                                onClick={() => toggleMetric(insight.metric)}
                                isExpanded={expandedMetric === insight.metric}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Footer tip */}
            <div className="mt-6 pt-6 border-t border-text/10">
                <p className="text-[9px] text-text/25 text-center leading-relaxed font-medium">
                    Click on a metric with a label for recommendations
                </p>
            </div>
        </div>
    );
};
