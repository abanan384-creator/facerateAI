
import React, { useRef, useState } from 'react';
import { Mode } from '@/lib/state';
import { Upload, Camera, Loader2, X } from 'lucide-react';

interface UploadCardProps {
    mode: Mode;
    previewUrl?: string;
    showCamera: boolean;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCameraCapture: (img: string) => void;
    onClear: () => void;
    setShowCamera: (show: boolean) => void;
}

export const UploadCard = ({
    mode,
    previewUrl,
    showCamera,
    onUpload,
    onCameraCapture,
    setShowCamera,
    onClear
}: UploadCardProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
    }, [showCamera]);

    return (
        <div className="relative group w-full aspect-square max-w-sm rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 hover:border-cyan-400/30 transition-all duration-500 flex items-center justify-center shadow-2xl">
            {showCamera ? (
                <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-4">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-xl mb-4" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-4">
                        <button
                            onClick={takePhoto}
                            className="bg-cyan-400 text-black px-6 py-2 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                        >
                            Capture
                        </button>
                        <button
                            onClick={() => setShowCamera(false)}
                            className="bg-red-500/20 text-red-400 px-6 py-2 rounded-full font-bold uppercase tracking-widest hover:bg-red-500/30 transition-colors"
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
                    <button
                        onClick={onClear}
                        className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white/70 hover:text-white hover:bg-red-500/80 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center group/btn"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover/btn:bg-cyan-400/10 transition-colors border border-white/10 group-hover/btn:border-cyan-400/50">
                            <Upload className="w-8 h-8 text-gray-400 group-hover/btn:text-cyan-400 transition-colors" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium tracking-widest uppercase group-hover/btn:text-gray-300 transition-colors">
                            Upload {mode} Photo
                        </span>
                    </button>

                    <div className="flex items-center gap-3 opacity-30">
                        <div className="h-px w-12 bg-white"></div>
                        <span className="text-[10px] uppercase tracking-widest">OR</span>
                        <div className="h-px w-12 bg-white"></div>
                    </div>

                    <button
                        onClick={() => setShowCamera(true)}
                        className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm font-bold uppercase tracking-wider"
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
