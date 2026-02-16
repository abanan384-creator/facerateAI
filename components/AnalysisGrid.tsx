
import React, { useState } from 'react';
import { AnalysisScores } from '@/lib/state';
import { analyzeScores, RECOMMENDATIONS, MetricInsight } from '@/lib/recommendations';
import { generateVerdict } from '@/lib/verdict';

interface AnalysisGridProps {
    scores: AnalysisScores;
}

const MetricBox = ({ insight, type }: { insight: MetricInsight, type: 'strength' | 'improvement' }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasRecommendation = RECOMMENDATIONS[insight.metric];

    return (
        <div className="mb-3">
            <div
                onClick={() => hasRecommendation && setIsExpanded(!isExpanded)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${type === 'strength'
                    ? 'bg-green-500/5 border-green-500/10 hover:bg-green-500/10'
                    : 'bg-cyan-500/5 border-cyan-500/10 hover:bg-cyan-500/10'
                    }`}
            >
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type === 'strength' ? 'bg-green-500/10' : 'bg-cyan-500/10'}`}>
                            <span className="text-xl">{insight.emoji}</span>
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-black mb-0.5">{insight.label}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-white text-lg font-light tracking-tight">{insight.value}</span>
                                <span className="text-[10px] text-gray-600 font-bold">/ 100</span>
                            </div>
                        </div>
                    </div>
                    {hasRecommendation && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border border-white/10 transition-colors ${isExpanded ? 'bg-white/10' : ''}`}>
                            <span className={`text-[10px] text-gray-400 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && hasRecommendation && (
                <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="text-xs font-bold text-cyan-300 mb-2">{RECOMMENDATIONS[insight.metric].title}</h4>
                    <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">{RECOMMENDATIONS[insight.metric].problem}</p>
                    <div className="space-y-1.5">
                        {RECOMMENDATIONS[insight.metric].solutions.slice(0, 3).map((s, i) => (
                            <p key={i} className="text-[9px] text-gray-300 flex gap-2">
                                <span>•</span> {s.replace(/\*\*/g, '')}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const AnalysisGrid = ({ scores }: AnalysisGridProps) => {
    const { strengths, improvements } = analyzeScores(scores);
    const verdict = generateVerdict(scores);

    return (
        <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-700">
            {/* Two Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Strengths Frame */}
                <div className="p-6 rounded-[2rem] bg-black/40 border border-white/5 backdrop-blur-md relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-20" />
                    <h3 className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <span className="w-1 h-1 bg-green-400 rounded-full shadow-[0_0_5px_#4ade80]" />
                        Сильные стороны
                    </h3>
                    {strengths.map(s => <MetricBox key={s.metric} insight={s} type="strength" />)}
                </div>

                {/* Improvements Frame */}
                <div className="p-6 rounded-[2rem] bg-black/40 border border-white/5 backdrop-blur-md relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-20" />
                    <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <span className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_5px_#22d3ee]" />
                        Зоны улучшения
                    </h3>
                    {improvements.map(s => <MetricBox key={s.metric} insight={s} type="improvement" />)}
                </div>
            </div>

            {/* Verdict Frame (Now at bottom) */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <span className="text-8xl">💎</span>
                </div>
                <div className="relative z-10">
                    <h3 className="text-[8px] font-black text-cyan-400 uppercase tracking-[0.5em] mb-4 flex items-center gap-3">
                        <div className="h-[1px] w-8 bg-cyan-500/30" />
                        Итоговое заключение
                    </h3>
                    <p className="text-white text-xl md:text-2xl font-extralight leading-relaxed mb-6 max-w-2xl">
                        {verdict.summary}
                    </p>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 p-5 rounded-2xl bg-white/5 border border-white/10 group hover:border-cyan-500/30 transition-colors">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Приоритетная задача:</p>
                            <p className="text-cyan-300 text-sm font-light italic leading-relaxed group-hover:text-cyan-200 transition-colors">
                                {verdict.primaryFocus}
                            </p>
                        </div>
                        <div className="md:w-1/3 p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col justify-center items-center text-center">
                            <p className="text-[9px] text-cyan-400 uppercase tracking-widest font-black mb-1">Рейтинг</p>
                            <p className="text-2xl font-black text-white uppercase tracking-tighter">
                                {verdict.overallRating}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
