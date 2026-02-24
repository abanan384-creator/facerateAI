
export type Mode = 'front' | 'side';
export type Warning = 'low_sharpness' | 'bad_brightness' | 'low_contrast' | 'not_front' | 'not_side' | 'face_too_small';
export type ErrCode = 'NO_IMAGE' | 'NO_FACE_DETECTED' | 'BAD_POSE' | 'IMAGE_TOO_LARGE' | 'INTERNAL';

export interface AnalysisScores {
    jawline: number;
    cheekbones: number;
    masculinity: number;
    eyes: number;
    facial_thirds: number;
    nose: number;
    forehead: number;
    symmetry: number;
    harmony: number;
    overall: number;
    potential: number;
    landmarks?: { x: number; y: number }[];
}

// State Machine States
export type ScanState =
    | { status: 'idle'; mode: Mode }
    | { status: 'image_selected'; mode: Mode; previewUrl: string }
    | { status: 'detecting'; mode: Mode; previewUrl: string }
    | { status: 'ready'; mode: Mode; previewUrl: string; warnings: Warning[] }
    | { status: 'scoring'; mode: Mode; previewUrl: string; warnings: Warning[] }
    | { status: 'result'; mode: Mode; previewUrl: string; scores: AnalysisScores; warnings: Warning[] }
    | { status: 'error'; mode: Mode; previewUrl?: string; code: ErrCode; tips: string[] };
