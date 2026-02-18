
import React from 'react';
import { AnalysisScores, Warning } from '@/lib/state';

interface ResultCardProps {
    scores: AnalysisScores;
    warnings: Warning[];
    onClear: () => void;
    onRescan: () => void;
    onShare: () => void;
}

const ProgressBar = ({ value }: { value: number }) => (
    <div className="h-1.5 w-full bg-text/5 rounded-sm overflow-hidden mt-1.5">
        <div
            className="h-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${value}%` }}
        />
    </div>
);

const Metric = ({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) => (
    <div className="flex flex-col mb-5 last:mb-0">
        <div className="flex justify-between items-end pb-1">
            <span className={`text-[10px] uppercase tracking-[0.2em] font-semibold ${highlight ? 'text-primary' : 'text-text/40'}`}>
                {label}
            </span>
            <div className={`text-lg font-semibold tracking-tight ${highlight ? 'text-primary' : 'text-text'}`}>
                {value}
            </div>
        </div>
        <ProgressBar value={value} />
    </div>
);

export const ResultCard = ({ scores, warnings, onClear, onRescan, onShare }: ResultCardProps) => {
    return (
        <div className="w-full max-w-sm bg-surface border border-text/10 rounded-lg p-8">
            {/* Header Score */}
            <div className="text-center mb-10">
                <h2 className="text-6xl font-bold tracking-tight text-primary mb-2">
                    {(scores.overall / 10).toFixed(1)}
                </h2>
                <div className="inline-block px-3 py-1 border border-primary/20 rounded-sm">
                    <p className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase">Overall Score</p>
                </div>
            </div>

            {/* Metrics */}
            <div className="space-y-1">
                <Metric label="Potential" value={scores.potential} highlight />
                <Metric label="Masculinity" value={scores.masculinity} />
                <Metric label="Jawline" value={scores.jawline} />
                <Metric label="Cheekbones" value={scores.cheekbones} />
                <Metric label="Facial Thirds" value={scores.facial_thirds} />
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="mt-8 p-4 bg-bg border border-text/10 rounded-md">
                    <p className="text-[9px] text-text/40 font-bold mb-3 tracking-widest uppercase flex items-center gap-2">
                        <span className="w-1 h-1 bg-text/30 rounded-full" />
                        Quality Notes
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {warnings.map(w => (
                            <span key={w} className="text-[9px] bg-text/5 text-text/50 px-2 py-1 rounded-sm border border-text/10 uppercase tracking-wider font-medium">
                                {w.replace('_', ' ')}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-text/10">
                <button
                    onClick={onRescan}
                    className="col-span-2 py-3 bg-primary text-bg border border-primary rounded-md text-xs font-bold uppercase tracking-widest transition-opacity duration-150 hover:opacity-90"
                >
                    Rescan
                </button>
                <button
                    onClick={onClear}
                    className="py-3 text-text/30 hover:text-text text-xs font-semibold uppercase tracking-widest transition-opacity duration-150"
                >
                    Clear
                </button>
                <button
                    onClick={onShare}
                    className="py-3 text-primary/60 hover:text-primary text-xs font-semibold uppercase tracking-widest transition-opacity duration-150"
                >
                    Share Result
                </button>
            </div>
        </div>
    );
};
