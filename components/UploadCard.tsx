
import React, { useRef, useState } from 'react';
import { Mode } from '@/lib/state';
import { Upload, Camera, X, RefreshCcw } from 'lucide-react';
import { drawAnalysis } from '@/lib/visualize';

interface UploadCardProps {
    mode: Mode;
    previewUrl?: string;
    showCamera: boolean;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCameraCapture: (img: string) => void;
    onClear: () => void;
    setShowCamera: (show: boolean) => void;
    landmarks?: { x: number; y: number }[];
}

export const UploadCard = ({
    mode,
    previewUrl,
    showCamera,
    onUpload,
    onCameraCapture,
    setShowCamera,
    onClear,
    landmarks
}: UploadCardProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

    const startCamera = async () => {
        stopCamera();
        try {
            const constraints = {
                video: { facingMode: facingMode }
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error", err);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            const imgUrl = canvas.toDataURL('image/jpeg');
            onCameraCapture(imgUrl);
            setShowCamera(false);
            stopCamera();
        }
    };

    React.useEffect(() => {
        if (showCamera) startCamera();
        else stopCamera();
        return () => stopCamera();
    }, [showCamera, facingMode]);

    React.useEffect(() => {
        if (landmarks && overlayRef.current && previewUrl) {
            const canvas = overlayRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const img = new Image();
                img.src = previewUrl;
                img.onload = () => {
                    // Set canvas size to match displayed container size
                    const rect = canvas.getBoundingClientRect();
                    canvas.width = rect.width;
                    canvas.height = rect.height;

                    // Calculate scaling to match object-cover behavior
                    const imgRatio = img.naturalWidth / img.naturalHeight;
                    const canvasRatio = canvas.width / canvas.height;

                    let scale, offsetX = 0, offsetY = 0;
                    if (imgRatio > canvasRatio) {
                        // Image is wider than canvas
                        scale = canvas.height / img.naturalHeight;
                        offsetX = (canvas.width - img.naturalWidth * scale) / 2;
                    } else {
                        // Image is taller or same
                        scale = canvas.width / img.naturalWidth;
                        offsetY = (canvas.height - img.naturalHeight * scale) / 2;
                    }

                    const scaledLandmarks = landmarks.map(l => ({
                        x: l.x * scale + offsetX,
                        y: l.y * scale + offsetY
                    }));

                    drawAnalysis(ctx, scaledLandmarks, canvas.width, canvas.height, mode);
                };
            }
        }
    }, [landmarks, previewUrl]);


    return (
        <div className="relative w-full aspect-square max-w-sm rounded-lg overflow-hidden border border-text/10 bg-surface flex items-center justify-center">
            {showCamera ? (
                <div className="absolute inset-0 bg-text flex flex-col items-center justify-center p-4">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-md mb-4" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-3">
                        <button
                            onClick={takePhoto}
                            className="bg-primary text-bg px-6 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest transition-opacity duration-150 hover:opacity-90"
                        >
                            Capture
                        </button>
                        <button
                            onClick={toggleCamera}
                            className="bg-bg/20 text-bg px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest transition-opacity duration-150 hover:bg-bg/30"
                            title="Switch Camera"
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setShowCamera(false)}
                            className="bg-transparent text-bg/70 px-6 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest border border-bg/20 transition-opacity duration-150 hover:text-bg"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : previewUrl ? (
                <div className="relative w-full h-full group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                    {landmarks && (
                        <canvas
                            ref={overlayRef}
                            className="absolute inset-0 w-full h-full pointer-events-none"
                        />
                    )}
                    <button
                        onClick={onClear}
                        className="absolute top-3 right-3 p-2 bg-bg/80 rounded-md text-text/50 hover:text-text transition-opacity duration-150 opacity-0 group-hover:opacity-100"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center group"
                    >
                        <div className="w-16 h-16 rounded-md bg-primary/5 flex items-center justify-center mb-4 border border-text/10 group-hover:border-primary/30 transition-opacity duration-150">
                            <Upload className="w-6 h-6 text-text/30 group-hover:text-primary transition-opacity duration-150" />
                        </div>
                        <span className="text-xs text-text/40 font-medium tracking-widest uppercase group-hover:text-text/70 transition-opacity duration-150">
                            Upload {mode} Photo
                        </span>
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="h-px w-10 bg-text/10"></div>
                        <span className="text-[10px] uppercase tracking-widest text-text/20 font-medium">or</span>
                        <div className="h-px w-10 bg-text/10"></div>
                    </div>

                    <button
                        onClick={() => setShowCamera(true)}
                        className="flex items-center gap-2 text-text/30 hover:text-primary text-xs font-semibold uppercase tracking-wider transition-opacity duration-150"
                    >
                        <Camera className="w-4 h-4" />
                        Open Camera
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={onUpload}
                    />
                </div>
            )}
        </div>
    );
};
