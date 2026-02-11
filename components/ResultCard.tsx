
import React from 'react';
import { AnalysisScores, Warning } from '@/lib/state';

interface ResultCardProps {
    scores: AnalysisScores;
    warnings: Warning[];
    onClear: () => void;
    onRescan: () => void;
    onShare: () => void;
}

const ProgressBar = ({ value, color = 'bg-white/80' }: { value: number; color?: string }) => (
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mt-1.5 backdrop-blur-sm border border-white/5">
        <div
            className={`h-full ${color} transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]`}
            style={{ width: `${value}%` }}
        />
    </div>
);

const Metric = ({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) => (
    <div className="flex flex-col mb-4 last:mb-0 group">
        <div className="flex justify-between items-end pb-1">
            <span className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${highlight ? 'text-cyan-300' : 'text-gray-400 group-hover:text-gray-300'}`}>
                {label}
            </span>
            <div className={`text-xl font-light tracking-wide ${highlight ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-white'}`}>
                {value}
            </div>
        </div>
        <ProgressBar value={value} color={highlight ? "bg-cyan-400" : "bg-white/80"} />
    </div>
);

export const ResultCard = ({ scores, warnings, onClear, onRescan, onShare }: ResultCardProps) => {
    return (
        <div className="w-full max-w-sm bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
            {/* Header Score */}
            <div className="text-center mb-8 relative">
                <div className="absolute inset-0 bg-cyan-400/5 blur-3xl rounded-full" />
                <h2 className="text-7xl font-thin tracking-tighter text-white mb-2 relative z-10">
                    {(scores.overall / 10).toFixed(1)}
                </h2>
                <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-cyan-400 text-[10px] font-bold tracking-[0.3em] uppercase">Overall Score</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="space-y-5">
                <Metric label="Potential" value={scores.potential} highlight />
                <Metric label="Masculinity" value={scores.masculinity} />
                <Metric label="Jawline" value={scores.jawline} />
                <Metric label="Cheekbones" value={scores.cheekbones} />
                <Metric label="Facial Thirds" value={scores.facial_thirds} />
                <Metric label="Skin Quality" value={scores.skin_quality} />
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="mt-8 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl backdrop-blur-sm">
                    <p className="text-[9px] text-yellow-500/80 font-bold mb-3 tracking-widest uppercase flex items-center gap-2">
                        <span className="w-1 h-1 bg-yellow-500 rounded-full" />
                        Quality Notes
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {warnings.map(w => (
                            <span key={w} className="text-[9px] bg-yellow-500/10 text-yellow-200/80 px-2 py-1 rounded border border-yellow-500/20 uppercase tracking-wider">
                                {w.replace('_', ' ')}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-white/10">
                <button
                    onClick={onRescan}
                    className="col-span-2 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02]"
                >
                    Rescan
                </button>
                <button
                    onClick={onClear}
                    className="py-3 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                >
                    Clear
                </button>
                <button
                    onClick={onShare}
                    className="py-3 text-cyan-400/80 hover:text-cyan-400 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                    Share Result
                </button>
            </div>
        </div>
    );
};
