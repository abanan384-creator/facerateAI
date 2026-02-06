"use client";

import React, { useState, useRef } from 'react';
import { analyzeFace, AnalysisResult } from '@/lib/analyzeFace';
import { ResultCard } from '@/components/ResultCard';
import { Upload, Camera, Loader2, AlertCircle } from 'lucide-react';

export default function Home() {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
                setResult(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = async () => {
        if (!imageRef.current) return;

        setLoading(true);
        setError(null);

        try {
            // Small delay to let the UI update
            await new Promise(resolve => setTimeout(resolve, 100));
            const analysis = await analyzeFace(imageRef.current);
            setResult(analysis);
        } catch (err: any) {
            console.error(err);
            if (err.message === 'NO_FACE_DETECTED') {
                setError('NO_FACE_DETECTED: Please upload a clear photo of a face.');
            } else {
                setError('An error occurred during analysis. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black text-white">
            <div className="z-10 w-full max-w-5xl flex flex-col items-center text-center">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    LOOKS<span className="text-blue-500 font-light italic">MAXING</span>
                </h1>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12">
                    Harness the power of AI to analyze your facial metrics and discover your potential.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start w-full">
                    {/* Left Side: Upload / Preview */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative group w-full aspect-square max-w-sm rounded-[2rem] overflow-hidden border-2 border-dashed border-white/20 bg-white/5 hover:border-blue-500/50 transition-all duration-500">
                            {image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    ref={imageRef}
                                    src={image}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="w-12 h-12 text-gray-500 mb-4 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-gray-500 group-hover:text-gray-300 transition-colors">Click to upload photo</span>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                        </div>

                        <div className="flex gap-4 w-full max-w-sm">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold transition-all border border-white/10"
                            >
                                <Camera className="w-5 h-5" />
                                REPLACE
                            </button>

                            <button
                                onClick={processImage}
                                disabled={!image || loading}
                                className={`flex-[2] py-4 rounded-2xl font-black tracking-widest transition-all shadow-lg shadow-blue-500/20 ${!image || loading
                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-blue-400 hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        ANALYZING...
                                    </div>
                                ) : 'GET RATINGS'}
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Results */}
                    <div className="flex flex-col items-center lg:items-start justify-center min-h-[400px]">
                        {result ? (
                            <div className="animate-in fade-in zoom-in-95 duration-700 w-full flex justify-center lg:justify-start">
                                <ResultCard result={result} />
                            </div>
                        ) : (
                            <div className="text-center lg:text-left space-y-4 opacity-40">
                                <div className="w-16 h-1 bg-blue-500 rounded-full mx-auto lg:mx-0"></div>
                                <h3 className="text-2xl font-bold">Waiting for Scan</h3>
                                <p className="text-gray-400 max-w-xs">
                                    Upload a front-facing photo with good lighting for the most accurate landmark detection.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer / Credits */}
            <footer className="mt-24 text-gray-600 text-xs">
                &copy; 2026 FACERATINGS AI. ALL RIGHTS RESERVED.
            </footer>
        </main>
    );
}
