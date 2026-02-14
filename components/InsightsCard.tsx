import React, { useState } from 'react';
import { AnalysisScores } from '@/lib/state';
import { analyzeScores, RECOMMENDATIONS, MetricInsight } from '@/lib/recommendations';

interface InsightsCardProps {
    scores: AnalysisScores;
}

const StatusBadge = ({ status }: { status: MetricInsight['status'] }) => {
    const colors = {
        excellent: 'bg-green-500/10 text-green-400 border-green-500/30',
        good: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        average: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
        needs_improvement: 'bg-red-500/10 text-red-400 border-red-500/30'
    };

    const labels = {
        excellent: 'Отлично',
        good: 'Хорошо',
        average: 'Средне',
        needs_improvement: 'Требует внимания'
    };

    return (
        <span className={`text-[8px] px-2 py-0.5 rounded border ${colors[status]} uppercase tracking-wider font-bold`}>
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
                className={`flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all ${hasRecommendation && shouldShowTip ? 'cursor-pointer' : ''
                    }`}
                onClick={hasRecommendation && shouldShowTip ? onClick : undefined}
            >
                <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{insight.emoji}</span>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-white">{insight.label}</span>
                            <StatusBadge status={insight.status} />
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${insight.status === 'excellent' ? 'bg-green-400' :
                                        insight.status === 'good' ? 'bg-blue-400' :
                                            insight.status === 'average' ? 'bg-yellow-400' :
                                                'bg-red-400'
                                    }`}
                                style={{ width: `${insight.value}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-lg font-light text-white/80">{insight.value}</span>
                </div>

                {hasRecommendation && shouldShowTip && (
                    <div className="ml-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                            <span className={`text-cyan-400 text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Expanded Recommendations */}
            {isExpanded && hasRecommendation && (
                <div className="mt-2 p-4 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-2 mb-3">
                        <span className="text-cyan-400 text-lg">💡</span>
                        <div>
                            <h4 className="text-sm font-bold text-cyan-300 mb-1">
                                {RECOMMENDATIONS[insight.metric].title}
                            </h4>
                            <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
                                {RECOMMENDATIONS[insight.metric].problem}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 mb-3">
                        <p className="text-[9px] text-cyan-500/80 font-bold uppercase tracking-wider mb-2">
                            Рекомендации:
                        </p>
                        {RECOMMENDATIONS[insight.metric].solutions.map((solution, idx) => (
                            <div key={idx} className="text-[10px] text-gray-300 leading-relaxed pl-2">
                                {solution}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] text-gray-500 uppercase tracking-wider">Сложность:</span>
                            <span className={`text-[8px] px-2 py-0.5 rounded ${RECOMMENDATIONS[insight.metric].difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                    RECOMMENDATIONS[insight.metric].difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                }`}>
                                {RECOMMENDATIONS[insight.metric].difficulty === 'easy' ? 'Легко' :
                                    RECOMMENDATIONS[insight.metric].difficulty === 'medium' ? 'Средне' :
                                        'Сложно'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] text-gray-500 uppercase tracking-wider">Срок:</span>
                            <span className="text-[8px] text-cyan-400">
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
        <div className="w-full max-w-sm bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500 delay-100">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎯</span>
                    <h3 className="text-xl font-light text-white">Анализ & Рекомендации</h3>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                    Персонализированные советы по улучшению внешности
                </p>
            </div>

            {/* Strengths */}
            {strengths.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-1 h-1 bg-green-400 rounded-full" />
                        <h4 className="text-[10px] text-green-400/80 font-bold uppercase tracking-widest">
                            Сильные стороны
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
                        <span className="w-1 h-1 bg-cyan-400 rounded-full" />
                        <h4 className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-widest">
                            Зоны роста
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
            <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-[9px] text-gray-500 text-center leading-relaxed">
                    💡 Нажмите на метрику с ярлыком для получения рекомендаций
                </p>
            </div>
        </div>
    );
};
