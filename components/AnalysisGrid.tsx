
import React, { useState } from 'react';
import { AnalysisScores, Mode } from '@/lib/state';
import { analyzeScores, RECOMMENDATIONS, MetricInsight } from '@/lib/recommendations';
import { generateVerdict } from '@/lib/verdict';

interface AnalysisGridProps {
    scores: AnalysisScores;
    mode: Mode;
}

const MetricBox = ({ insight, type }: { insight: MetricInsight, type: 'strength' | 'improvement' }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasRecommendation = RECOMMENDATIONS[insight.metric];

    return (
        <div className="mb-3">
            <div
                onClick={() => hasRecommendation && setIsExpanded(!isExpanded)}
                className={`p-4 rounded-md border transition-opacity duration-150 cursor-pointer ${type === 'strength'
                    ? 'bg-primary/3 border-primary/10 hover:border-primary/20'
                    : 'bg-text/3 border-text/10 hover:border-text/20'
                    }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-text/35 font-bold mb-0.5">{insight.label}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-text text-base font-semibold tracking-tight">{insight.value}</span>
                                <span className="text-[10px] text-text/20 font-semibold">/ 100</span>
                            </div>
                        </div>
                    </div>
                    {hasRecommendation && (
                        <div className={`w-5 h-5 rounded-sm flex items-center justify-center border border-text/10 transition-opacity duration-150 ${isExpanded ? 'bg-primary/5' : ''}`}>
                            <span className={`text-[9px] text-text/30 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && hasRecommendation && (
                <div className="mt-2 p-4 rounded-md bg-surface border border-text/10">
                    <h4 className="text-xs font-bold text-primary mb-2">{RECOMMENDATIONS[insight.metric].title}</h4>
                    <p className="text-[10px] text-text/40 mb-3 leading-relaxed">{RECOMMENDATIONS[insight.metric].problem}</p>
                    <div className="space-y-1.5">
                        {RECOMMENDATIONS[insight.metric].solutions.slice(0, 3).map((s, i) => (
                            <p key={i} className="text-[9px] text-text/60 flex gap-2">
                                <span className="text-text/20">•</span> {s.replace(/\*\*/g, '')}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const AnalysisGrid = ({ scores, mode }: AnalysisGridProps) => {
    const { strengths, improvements } = analyzeScores(scores, mode);
    const verdict = generateVerdict(scores, mode);

    return (
        <div className="w-full space-y-8">
            {/* Two Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Strengths */}
                <div className="p-6 rounded-lg bg-surface border border-text/10">
                    <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Strengths
                    </h3>
                    {strengths.map(s => <MetricBox key={s.metric} insight={s} type="strength" />)}
                </div>

                {/* Improvements */}
                <div className="p-6 rounded-lg bg-surface border border-text/10">
                    <h3 className="text-[10px] font-bold text-text/40 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-text/20 rounded-full" />
                        Areas for Growth
                    </h3>
                    {improvements.map(s => <MetricBox key={s.metric} insight={s} type="improvement" />)}
                </div>
            </div>

            {/* Verdict */}
            <div className="p-8 rounded-lg bg-primary text-bg border border-primary">
                <div>
                    <h3 className="text-[8px] font-bold text-bg/50 uppercase tracking-[0.5em] mb-4 flex items-center gap-3">
                        <div className="h-px w-6 bg-bg/20" />
                        Final Verdict
                    </h3>
                    <p className="text-bg text-lg md:text-xl font-light leading-relaxed mb-8 max-w-2xl">
                        {verdict.summary}
                    </p>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 p-5 rounded-md bg-bg/10 border border-bg/10">
                            <p className="text-[10px] text-bg/40 uppercase tracking-widest font-bold mb-2">Priority Focus:</p>
                            <p className="text-bg/80 text-sm font-light leading-relaxed">
                                {verdict.primaryFocus}
                            </p>
                        </div>
                        <div className="md:w-1/3 p-5 rounded-md bg-bg/10 border border-bg/10 flex flex-col justify-center items-center text-center">
                            <p className="text-[9px] text-bg/40 uppercase tracking-widest font-bold mb-1">Rating</p>
                            <p className="text-2xl font-bold text-bg uppercase tracking-tight">
                                {verdict.overallRating}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
