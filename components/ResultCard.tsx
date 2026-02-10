import React from 'react';
import { AnalysisResult } from '@/lib/analyzeFace';

interface MetricProps {
    label: string;
    value: number;
    color?: string;
    highlight?: boolean;
}

const ProgressBar = ({ value, color = 'bg-white/80' }: { value: number; color?: string }) => (
    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-1.5">
        <div
            className={`h-full ${color} transition-all duration-1000 ease-out`}
            style={{ width: `${value}%` }}
        />
    </div>
);

const Metric = ({ label, value, color, highlight }: MetricProps) => (
    <div className="flex flex-col mb-4 last:mb-0">
        <div className="flex justify-between items-end pb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">{label}</span>
            <div className={`text-lg font-light tracking-wide ${highlight ? 'text-cyan-400' : 'text-white'}`}>
                {value}
            </div>
        </div>
        <ProgressBar value={value} color={color || (highlight ? "bg-cyan-400" : "bg-white/80")} />
    </div>
);

export const ResultCard = ({ result }: { result: AnalysisResult }) => {
    return (
        <div className="w-full max-w-md bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
                <h2 className="text-6xl font-thin tracking-tighter text-white mb-2">
                    {(result.overall / 10).toFixed(1)}
                </h2>
                <p className="text-cyan-400 text-xs font-bold tracking-[0.3em] uppercase">Overall Score</p>
            </div>

            <div className="space-y-4">
                <Metric label="Potential" value={result.potential} highlight />
                <Metric label="Masculinity" value={result.masculinity} />
                <Metric label="Jawline" value={result.jawline} />
                <Metric label="Cheekbones" value={result.cheekbones} />

                <div className="h-px bg-white/10 my-6" />

                <Metric label="Symmetry" value={result.symmetry} />
                <Metric label="Golden Ratio" value={result.golden_ratio} highlight />
                <Metric label="Skin Quality" value={result.skin_quality} />
            </div>

            {/* Detailed Breakdown */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <Metric label="Facial Thirds" value={result.facial_thirds} />
                    <Metric label="Facial Fifths" value={result.facial_fifths} />
                </div>
                <div className="space-y-3">
                    <Metric label="Eye Score" value={result.eye_score} />
                    <Metric label="Nose Score" value={result.nose_score} />
                </div>
            </div>

            {result.warnings.length > 0 && (
                <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                    <p className="text-[10px] text-yellow-500 font-bold mb-2 tracking-widest uppercase">Photo Quality Warnings</p>
                    <div className="flex flex-wrap gap-2">
                        {result.warnings.map(w => (
                            <span key={w} className="text-[9px] bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20 uppercase tracking-wider">
                                {w.replace('_', ' ')}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <p className="mt-8 text-[9px] text-gray-600 text-center uppercase tracking-widest">
                AI Estimation • Results may vary based on lighting
            </p>
        </div>
    );
};
