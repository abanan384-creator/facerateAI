import React from 'react';
import { AnalysisResult } from '@/lib/analyzeFace';

interface MetricProps {
    label: string;
    value: number;
    color?: string;
}

const ProgressBar = ({ value, color = 'bg-blue-500' }: { value: number; color?: string }) => (
    <div className="w-full bg-gray-800 rounded-full h-2.5 mt-1 overflow-hidden">
        <div
            className={`h-full rounded-full transition-all duration-1000 ${color}`}
            style={{ width: `${value}%` }}
        />
    </div>
);

const Metric = ({ label, value, color }: MetricProps) => (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</span>
            <span className="text-lg font-bold text-white">{value}</span>
        </div>
        <ProgressBar value={value} color={color} />
    </div>
);

export const ResultCard = ({ result }: { result: AnalysisResult }) => {
    return (
        <div className="w-full max-w-md bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    {result.overall}
                </h2>
                <p className="text-gray-500 text-sm mt-1">OVERALL SCORE</p>
            </div>

            <div className="space-y-2">
                <Metric label="Potential" value={result.potential} color="bg-green-500" />
                <Metric label="Masculinity" value={result.masculinity} color="bg-blue-600" />
                <Metric label="Skin Quality" value={result.skin_quality} color="bg-yellow-500" />
                <Metric label="Jawline" value={result.jawline} color="bg-purple-500" />
                <Metric label="Cheekbones" value={result.cheekbones} color="bg-pink-500" />
            </div>

            {result.warnings.length > 0 && (
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p className="text-xs text-yellow-500 font-bold mb-1">PHOTO QUALITY WARNINGS:</p>
                    <div className="flex flex-wrap gap-2">
                        {result.warnings.map(w => (
                            <span key={w} className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full uppercase">
                                {w.replace('_', ' ')}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <p className="mt-8 text-[10px] text-gray-600 text-center leading-relaxed">
                DISCLAIMER: Scores are approximate, depend on photo quality and angle.
                This is an MVP based on client-side face landmark analysis.
            </p>
        </div>
    );
};
