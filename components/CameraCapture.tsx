import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
    onCapture: (imageSrc: string) => void;
    onClose: () => void;
}

export const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access error:", err);
                setError("Could not access camera. Please allow permissions.");
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [facingMode]);

    const toggleCamera = () => {
        setFacingMode((prev: 'user' | 'environment') => prev === 'user' ? 'environment' : 'user');
    };

    const capture = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);

            const imageSrc = canvas.toDataURL('image/jpeg');
            onCapture(imageSrc);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text/80 p-4">
            <div className="relative w-full max-w-2xl bg-bg rounded-lg overflow-hidden border border-text/10">
                <div className="absolute top-4 right-4 z-10">
                    <button onClick={onClose} className="p-2 bg-surface rounded-md hover:bg-text/5 transition-opacity duration-150 text-text/50 hover:text-text">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative aspect-video bg-text flex items-center justify-center">
                    {error ? (
                        <p className="text-bg/60 text-sm font-medium">{error}</p>
                    ) : (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                <div className="p-6 flex justify-center gap-4 bg-bg">
                    <button
                        onClick={capture}
                        disabled={!!error}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-bg rounded-md text-xs font-bold uppercase tracking-widest transition-opacity duration-150 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Camera className="w-4 h-4" />
                        Take Photo
                    </button>
                    <button
                        onClick={toggleCamera}
                        disabled={!!error}
                        className="flex items-center gap-2 px-4 py-3 bg-surface text-text rounded-md text-xs font-bold uppercase tracking-widest transition-opacity duration-150 hover:bg-text/5 disabled:opacity-30 disabled:cursor-not-allowed border border-text/10"
                        title="Switch Camera"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
