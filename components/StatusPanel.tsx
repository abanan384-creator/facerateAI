
import React from 'react';
import { ScanState } from '@/lib/state';

interface StatusPanelProps {
    state: ScanState;
}

export const StatusPanel = ({ state }: StatusPanelProps) => {
    const { status, mode } = state;

    let content: { title: string; subtitle: string; tip?: string } = {
        title: "",
        subtitle: "",
    };

    switch (status) {
        case 'idle':
            if (mode === 'front') {
                content = {
                    title: "Waiting for Front Scan",
                    subtitle: "Upload a front-facing photo. Good lighting, no tilt.",
                    tip: "Tip: camera at eye level, arm's length away.",
                };
            } else {
                content = {
                    title: "Waiting for Side Scan",
                    subtitle: "Upload a true side profile (90°). Ear and jawline visible.",
                    tip: "Tip: turn head fully to the side, keep chin neutral.",
                };
            }
            break;
        case 'image_selected':
            content = {
                title: "Photo Loaded",
                subtitle: "Checking face position...",
            };
            break;
        case 'detecting':
            content = {
                title: "Detecting Face...",
                subtitle: "Analyzing landmarks",
            };
            break;
        case 'ready':
            content = {
                title: "Face Detected",
                subtitle: "Ready to generate ratings.",
            };
            break;
        case 'scoring':
            content = {
                title: "Generating Ratings...",
                subtitle: "This takes a few seconds",
            };
            break;
        case 'result':
            content = {
                title: "Ratings",
                subtitle: "Approximate scores based on landmarks + photo quality.",
            };
            break;
        case 'error':
            content = {
                title: "Error",
                subtitle: state.tips[0] || "Something went wrong",
            };
            break;
    }

    const isLoading = status === 'image_selected' || status === 'detecting' || status === 'scoring';
    const isError = status === 'error';
    const isReady = status === 'ready';

    return (
        <div className="w-full max-w-md mb-8 lg:mb-0 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                {/* Minimal status indicator dot */}
                <div className={`w-2 h-2 rounded-full ${isError ? 'bg-text/60' : isReady ? 'bg-primary' : isLoading ? 'bg-text/20' : 'bg-text/10'
                    }`} />
                <h2 className="text-xl font-semibold tracking-tight text-primary">
                    {content.title}
                </h2>
            </div>

            <p className="text-text/40 text-sm font-medium mb-4 leading-relaxed">
                {content.subtitle}
            </p>

            {content.tip && (
                <div className="inline-block bg-surface px-4 py-2.5 rounded-md border border-text/10 text-xs text-text/40 tracking-wide font-medium">
                    {content.tip}
                </div>
            )}

            {/* Progress Steps */}
            <div className="flex items-center gap-2 mt-10 justify-center lg:justify-start">
                <div className={`h-0.5 w-12 rounded-full transition-all duration-150 ${status !== 'idle' ? 'bg-primary' : 'bg-text/10'}`} />
                <div className={`h-0.5 w-12 rounded-full transition-all duration-150 ${['ready', 'scoring', 'result'].includes(status) ? 'bg-primary' : 'bg-text/10'}`} />
                <div className={`h-0.5 w-12 rounded-full transition-all duration-150 ${status === 'result' ? 'bg-primary' : 'bg-text/10'}`} />
            </div>
            <div className="flex justify-between w-[160px] text-[9px] uppercase tracking-widest text-text/25 mt-2 mx-auto lg:mx-0 font-medium">
                <span>Upload</span>
                <span>Scan</span>
                <span>Score</span>
            </div>
        </div>
    );
};
