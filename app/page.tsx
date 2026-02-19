
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mode, ScanState, ErrCode, Warning } from '@/lib/state';
import { detectFace, scoreFace } from '@/lib/analyzeFace';
import { UploadCard } from '@/components/UploadCard';
import { StatusPanel } from '@/components/StatusPanel';
import { ResultCard } from '@/components/ResultCard';
import { AnalysisGrid } from '@/components/AnalysisGrid';
import { ScoreRing } from '@/components/ScoreRing';



import { useScan } from '@/context/ScanContext';

// ----- Main Page -----
export default function Home() {
    const { state, setState } = useScan();
    const [showCamera, setShowCamera] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    const setMode = (mode: Mode) => {
        setState({ status: 'idle', mode });
        setShowCamera(false);
    };


    const handleImageSelect = useCallback((url: string) => {
        setState(prev => ({ status: 'image_selected', mode: prev.mode, previewUrl: url }));
    }, []);

    // Auto-Detect Effect
    useEffect(() => {
        if (state.status === 'image_selected') {
            const startDetection = async () => {
                setState(prev => ({
                    status: 'detecting',
                    mode: prev.mode,
                    previewUrl: (prev as any).previewUrl
                }));

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

            if (imgRef.current && imgRef.current.complete) {
                startDetection();
            } else if (imgRef.current) {
                imgRef.current.onload = startDetection;
            }
        }
    }, [state.status, state.mode]);

    // Score
    const handleGetRatings = useCallback(async () => {
        if (state.status !== 'ready') return;
        const { mode, previewUrl, warnings } = state;

        setState({ status: 'scoring', mode, previewUrl, warnings });

        setTimeout(async () => {
            try {
                if (!imgRef.current) throw new Error("No image ref");
                const analysis = await scoreFace(imgRef.current);
                setState({
                    status: 'result',
                    mode,
                    previewUrl,
                    scores: analysis,
                    warnings: analysis.warnings
                });
            } catch (error) {
                setState({
                    status: 'error',
                    mode,
                    previewUrl,
                    code: 'INTERNAL',
                    tips: ["Scoring failed. Please retry."]
                });
            }
        }, 1500);
    }, [state]);

    // Auto-Score Effect
    useEffect(() => {
        if (state.status === 'ready') {
            handleGetRatings();
        }
    }, [state.status, handleGetRatings]);
    const handleClear = () => {
        setMode(state.mode);
    };

    return (
        <main className="min-h-screen bg-bg text-text flex flex-col">
            {/* Header */}
            <header className="w-full px-8 py-10 flex justify-center border-b border-text/5">
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
                        FACERATE<span className="font-light text-text/40">.AI</span>
                    </h1>
                    <p className="text-text/40 text-xs tracking-[0.3em] uppercase mt-2 font-medium">
                        Precision AI Engine
                    </p>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center p-6 md:p-16 w-full max-w-6xl mx-auto">

                {/* Mode Tabs */}
                <div className="flex border border-text/10 rounded-md mb-16">
                    <button
                        onClick={() => setMode('front')}
                        className={`px-8 py-2.5 text-xs font-semibold tracking-widest uppercase transition-opacity duration-150 ${state.mode === 'front'
                            ? 'bg-primary text-bg'
                            : 'bg-transparent text-text/40 hover:text-text/70'
                            }`}
                    >
                        Front
                    </button>
                    <button
                        onClick={() => setMode('side')}
                        className={`px-8 py-2.5 text-xs font-semibold tracking-widest uppercase transition-opacity duration-150 ${state.mode === 'side'
                            ? 'bg-primary text-bg'
                            : 'bg-transparent text-text/40 hover:text-text/70'
                            }`}
                    >
                        Side
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 w-full items-start mb-20">

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

                        {/* Action Button */}
                        <div className="w-full max-w-sm">
                            <button
                                onClick={handleGetRatings}
                                disabled={state.status !== 'ready'}
                                className={`w-full py-4 rounded-md text-xs font-bold tracking-widest uppercase transition-opacity duration-150 ${state.status === 'ready'
                                    ? 'bg-primary text-bg cursor-pointer hover:opacity-90'
                                    : 'bg-text/5 text-text/20 cursor-not-allowed border border-text/5'
                                    }`}
                            >
                                {state.status === 'scoring' ? 'Analyzing...' : 'Get Ratings'}
                            </button>

                            {state.status !== 'ready' && state.status !== 'scoring' && state.status !== 'result' && state.status !== 'idle' && (
                                <p className="text-center text-[10px] text-text/30 uppercase tracking-wider mt-3 font-medium">
                                    {state.status === 'image_selected' || state.status === 'detecting'
                                        ? "Wait for detection..."
                                        : state.status === 'error'
                                            ? "Fix errors to proceed"
                                            : "Upload photo to unlock"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Status & Result Card */}
                    <div className="flex flex-col items-center lg:items-start w-full min-h-[400px] gap-6">
                        {state.status === 'result' ? (
                            <>
                                <ScoreRing scores={state.scores} />
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
                            </>
                        ) : (
                            <StatusPanel state={state} />
                        )}
                    </div>
                </div>

                {/* DETAILED ANALYSIS SECTION */}
                {state.status === 'result' && (
                    <div className="w-full max-w-4xl mx-auto border-t border-text/10 pt-16">
                        <div className="text-center mb-12">
                            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-primary mb-2">
                                Detailed Report
                            </h2>
                            <div className="h-px w-16 bg-primary/20 mx-auto" />
                        </div>
                        <AnalysisGrid scores={state.scores} />
                    </div>
                )}
            </div>

            <footer className="w-full py-8 text-center text-[10px] text-text/25 uppercase tracking-widest font-medium border-t border-text/5">
                &copy; 2026 FaceRate AI &middot; Client-Side Secure Processing
            </footer>
        </main>
    );
}
