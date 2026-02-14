
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mode, ScanState, ErrCode, Warning } from '@/lib/state';
import { detectFace, scoreFace } from '@/lib/analyzeFace';
import { UploadCard } from '@/components/UploadCard';
import { StatusPanel } from '@/components/StatusPanel';
import { ResultCard } from '@/components/ResultCard';
import { InsightsCard } from '@/components/InsightsCard';

// ----- Initial State -----
const INITIAL_STATE = (mode: Mode = 'front'): ScanState => ({
    status: 'idle',
    mode
});

// ----- Main Page -----
export default function Home() {
    // We lift state up here, strictly following the union types
    const [state, setState] = useState<ScanState>(INITIAL_STATE('front'));
    const [showCamera, setShowCamera] = useState(false);

    // Persist refs for raw elements
    const imgRef = useRef<HTMLImageElement>(null);

    // --- State Transitions ---

    // 1. Switch Mode (Idle -> Idle)
    const setMode = (mode: Mode) => {
        setState(INITIAL_STATE(mode));
        setShowCamera(false);
    };

    // 2. Image Selected (Idle -> ImageSelected -> auto Detect)
    const handleImageSelect = useCallback((url: string) => {
        setState(prev => ({ status: 'image_selected', mode: prev.mode, previewUrl: url }));
    }, []);

    // 3. Auto-Detect Effect
    useEffect(() => {
        if (state.status === 'image_selected') {
            const startDetection = async () => {
                // Transition to Detecting
                setState(prev => ({ ...prev, status: 'detecting' }));

                // Small delay to allow UI to render 'Detecting...'
                await new Promise(r => setTimeout(r, 600));

                if (!imgRef.current) {
                    setState(prev => ({
                        status: 'error',
                        mode: prev.mode,
                        previewUrl: (prev as any).previewUrl,
                        code: 'INTERNAL',
                        tips: ["Image load failed. Try another file."]
                    }));
                    return;
                }

                try {
                    const result = await detectFace(imgRef.current, state.mode);

                    if (!result.valid) {
                        // Error State
                        let tips: string[] = [];
                        if (result.code === 'NO_FACE_DETECTED') tips = ["Ensure good lighting", "Face camera directly"];
                        if (result.code === 'BAD_POSE') {
                            tips = state.mode === 'front'
                                ? ["This isn't a front-facing photo"]
                                : ["This isn't a true side profile"];
                        }

                        setState(prev => ({
                            status: 'error',
                            mode: prev.mode,
                            previewUrl: (prev as any).previewUrl,
                            code: result.code || 'INTERNAL',
                            tips
                        }));
                    } else {
                        // Ready State
                        setState(prev => ({
                            status: 'ready',
                            mode: prev.mode,
                            previewUrl: (prev as any).previewUrl,
                            warnings: result.warnings
                        }));
                    }
                } catch (e) {
                    console.error(e);
                    setState(prev => ({
                        status: 'error',
                        mode: prev.mode,
                        previewUrl: (prev as any).previewUrl,
                        code: 'INTERNAL',
                        tips: ["Detection engine failed."]
                    }));
                }
            };

            // Trigger detection when image is actually loaded in DOM
            if (imgRef.current && imgRef.current.complete) {
                startDetection();
            } else if (imgRef.current) {
                imgRef.current.onload = startDetection;
            }
        }
    }, [state.status, state.mode]);


    // 4. Score (Ready -> Scoring -> Result)
    const handleGetRatings = async () => {
        if (state.status !== 'ready') return;
        const currentUrl = state.previewUrl;
        const currentWarnings = state.warnings;

        setState({ status: 'scoring', mode: state.mode, previewUrl: currentUrl, warnings: currentWarnings });

        // Simulate "Crunching numbers" feel + actual computation
        setTimeout(async () => {
            try {
                if (!imgRef.current) throw new Error("No image ref");

                const analysis = await scoreFace(imgRef.current);

                setState({
                    status: 'result',
                    mode: state.mode,
                    previewUrl: currentUrl,
                    scores: analysis,
                    warnings: analysis.warnings // could accumulate
                });

            } catch (error) {
                setState({
                    status: 'error',
                    mode: state.mode,
                    previewUrl: currentUrl,
                    code: 'INTERNAL',
                    tips: ["Scoring failed. Please retry."]
                });
            }
        }, 1500); // 1.5s delay for UX "Scanning" effect
    };

    // 5. Clear / Reset
    const handleClear = () => {
        setMode(state.mode); // Reset to idle
    };

    return (
        <main className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden selection:bg-cyan-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-900/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[100px] rounded-full" />
            </div>

            {/* Header */}
            <header className="z-10 w-full p-8 flex justify-center">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-thin tracking-tighter">
                        LOOKS<span className="text-cyan-400 font-light italic">MAXING</span>
                    </h1>
                    <p className="text-gray-500 text-xs tracking-[0.4em] uppercase mt-2">Precision AI Engine</p>
                </div>
            </header>

            {/* Content Actions */}
            <div className="z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-12 w-full max-w-7xl mx-auto">

                {/* Tabs */}
                <div className="flex bg-white/5 p-1 rounded-full mb-12 border border-white/5 backdrop-blur-md">
                    <button
                        onClick={() => setMode('front')}
                        className={`px-8 py-2 rounded-full text-xs font-bold tracking-widest transition-all ${state.mode === 'front' ? 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        FRONT
                    </button>
                    <button
                        onClick={() => setMode('side')}
                        className={`px-8 py-2 rounded-full text-xs font-bold tracking-widest transition-all ${state.mode === 'side' ? 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        SIDE
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 w-full items-start">

                    {/* LEFT COLUMN: Upload & Preview */}
                    <div className="flex flex-col items-center gap-8">

                        <UploadCard
                            mode={state.mode}
                            previewUrl={(state as any).previewUrl}
                            showCamera={showCamera}
                            setShowCamera={setShowCamera}
                            onUpload={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const url = URL.createObjectURL(file);
                                    handleImageSelect(url);
                                }
                            }}
                            onCameraCapture={(url) => handleImageSelect(url)}
                            onClear={handleClear}
                        />

                        {/* Hidden Image for Processing */}
                        {(state as any).previewUrl && (
                            <img
                                ref={imgRef}
                                src={(state as any).previewUrl}
                                className="hidden"
                                alt="analysis-source"
                            />
                        )}

                        {/* Action Buttons Block */}
                        <div className="w-full max-w-sm">
                            <button
                                onClick={handleGetRatings}
                                disabled={state.status !== 'ready'}
                                className={`w-full py-4 rounded-2xl font-black tracking-widest transition-all shadow-lg ${state.status === 'ready'
                                    ? 'bg-cyan-400 text-black hover:scale-[1.02] hover:shadow-cyan-400/20 cursor-pointer'
                                    : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                                    }`}
                            >
                                {state.status === 'scoring' ? 'ANALYZING...' : 'GET RATINGS'}
                            </button>

                            {/* Disabled Reason Hint */}
                            {state.status !== 'ready' && state.status !== 'scoring' && state.status !== 'result' && state.status !== 'idle' && (
                                <p className="text-center text-[10px] text-gray-500 uppercase tracking-wider mt-3">
                                    {state.status === 'image_selected' || state.status === 'detecting'
                                        ? "Wait for detection..."
                                        : state.status === 'error'
                                            ? "Fix errors to proceed"
                                            : "Upload photo to unlock"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Status & Results */}
                    <div className="flex flex-col items-center lg:items-start w-full min-h-[400px] gap-6">

                        {state.status === 'result' ? (
                            <>
                                <ResultCard
                                    scores={state.scores}
                                    warnings={state.warnings}
                                    onClear={handleClear}
                                    onRescan={handleGetRatings}
                                    onShare={() => {
                                        navigator.clipboard.writeText(JSON.stringify(state.scores, null, 2));
                                        alert("Results copied to clipboard!");
                                    }}
                                />
                                <InsightsCard scores={state.scores} />
                            </>
                        ) : (
                            <StatusPanel state={state} />
                        )}

                    </div>
                </div>
            </div>

            <footer className="w-full p-6 text-center text-[10px] text-gray-700 uppercase tracking-widest">
                &copy; 2026 FaceRatings AI • Client-Side Secure Processing
            </footer>
        </main>
    );
}
