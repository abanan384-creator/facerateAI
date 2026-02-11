
import React from 'react';
import { ScanState } from '@/lib/state';
import { AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';

interface StatusPanelProps {
    state: ScanState;
}

export const StatusPanel = ({ state }: StatusPanelProps) => {
    const { status, mode } = state;

    let content: { title: string; subtitle: string; icon?: React.ReactNode; tip?: string } = {
        title: "",
        subtitle: "",
    };

    switch (status) {
        case 'idle':
            if (mode === 'front') {
                content = {
                    title: "Waiting for Front Scan",
                    subtitle: "Upload a front-facing photo. Good lighting, no tilt.",
                    tip: "Tip: camera at eye level, arm’s length away.",
                    icon: <Info className="w-5 h-5 text-cyan-400" />
                };
            } else {
                content = {
                    title: "Waiting for Side Scan",
                    subtitle: "Upload a true side profile (90°). Ear and jawline visible.",
                    tip: "Tip: turn head fully to the side, keep chin neutral.",
                    icon: <Info className="w-5 h-5 text-cyan-400" />
                };
            }
            break;
        case 'image_selected':
            content = {
                title: "Photo Loaded",
                subtitle: "Checking face position...",
                icon: <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            };
            break;
        case 'detecting':
            content = {
                title: "Detecting Face...",
                subtitle: "Analyzing landmarks",
                icon: <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            };
            break;
        case 'ready':
            content = {
                title: "Face Detected ✅",
                subtitle: "Ready to generate ratings.",
                icon: <CheckCircle2 className="w-5 h-5 text-green-400" />
            };
            break;
        case 'scoring':
            content = {
                title: "Generating Ratings...",
                subtitle: "This takes a few seconds",
                icon: <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            };
            break;
        case 'result':
            content = {
                title: "Ratings",
                subtitle: "Approximate scores based on landmarks + photo quality.",
                icon: <CheckCircle2 className="w-5 h-5 text-green-400" />
            };
            break;
        case 'error':
            content = {
                title: "Error",
                subtitle: state.tips[0] || "Something went wrong",
                icon: <AlertCircle className="w-5 h-5 text-red-400" />
            };
            break;
    }

    return (
        <div className="w-full max-w-md mb-8 lg:mb-0 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                {content.icon}
                <h2 className="text-2xl font-light tracking-wide text-white uppercase animate-in fade-in slide-in-from-bottom-2">
                    {content.title}
                </h2>
            </div>

            <p className="text-gray-400 text-sm uppercase tracking-widest font-medium mb-4">
                {content.subtitle}
            </p>

            {content.tip && (
                <div className="inline-block bg-white/5 px-4 py-2 rounded-lg border border-white/5 text-xs text-cyan-400/80 tracking-wide">
                    {content.tip}
                </div>
            )}

            {/* Progress Indicator */}
            <div className="flex items-center gap-2 mt-8 opacity-40 justify-center lg:justify-start">
                <div className={`h-1 w-12 rounded-full transition-colors ${status !== 'idle' ? 'bg-cyan-400' : 'bg-white/20'}`} />
                <div className={`h-1 w-12 rounded-full transition-colors ${['ready', 'scoring', 'result'].includes(status) ? 'bg-cyan-400' : 'bg-white/20'}`} />
                <div className={`h-1 w-12 rounded-full transition-colors ${status === 'result' ? 'bg-cyan-400' : 'bg-white/20'}`} />
            </div>
            <div className="flex justify-between w-[160px] text-[9px] uppercase tracking-widest text-gray-500 mt-2 mx-auto lg:mx-0">
                <span>Upload</span>
                <span>Scan</span>
                <span>Score</span>
            </div>
        </div>
    );
};
