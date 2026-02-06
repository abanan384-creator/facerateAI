import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import { getQualityMetrics, QualityMetrics } from './quality';

// Utility functions
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(x, b));
const norm = (x: number, min: number, max: number) => clamp(((x - min) / (max - min)) * 100, 0, 100);
const dist = (p1: { x: number; y: number }, p2: { x: number; y: number }) =>
    Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

/* 
FaceMesh Indices Documentation:
- 10: Forehead top center
- 152: Chin bottom center
- 234: Right face edge (anatomical right)
- 454: Left face edge (anatomical left)
- 123: Right cheekbone highest point
- 352: Left cheekbone highest point
- 172: Right jaw corner
- 397: Left jaw corner
- 14: Bottom of the lower lip (useful for chin length)
*/

export interface AnalysisResult {
    overall: number;
    potential: number;
    masculinity: number;
    skin_quality: number;
    jawline: number;
    cheekbones: number;
    warnings: string[];
}

let detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;

async function getDetector() {
    if (detector) return detector;
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    detector = await faceLandmarksDetection.createDetector(model, {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        refineLandmarks: true
    });
    return detector;
}

export async function analyzeFace(img: HTMLImageElement): Promise<AnalysisResult> {
    const det = await getDetector();
    const faces = await det.estimateFaces(img);

    if (faces.length === 0) {
        throw new Error('NO_FACE_DETECTED');
    }

    const face = faces[0];
    const keypoints = face.keypoints;

    // Map landmarks
    const getKeypoint = (idx: number) => ({ x: keypoints[idx].x, y: keypoints[idx].y });

    const forehead_top = getKeypoint(10);
    const chin_bottom = getKeypoint(152);
    const face_left = getKeypoint(234);
    const face_right = getKeypoint(454);
    const cheek_left = getKeypoint(123);
    const cheek_right = getKeypoint(352);
    const jaw_left = getKeypoint(172);
    const jaw_right = getKeypoint(397);
    const mouth_bottom = getKeypoint(14);

    // Extract features
    const face_width = dist(face_left, face_right);
    const face_height = dist(forehead_top, chin_bottom);
    const jaw_width = dist(jaw_left, jaw_right);
    const cheek_width = dist(cheek_left, cheek_right);
    const chin_length = dist(mouth_bottom, chin_bottom);

    // Quality metrics
    const q = getQualityMetrics(img);

    // Formulas
    const jaw_ratio = jaw_width / face_width;
    const chin_ratio = chin_length / face_height;
    const cheek_ratio = cheek_width / jaw_width;
    const face_ratio = face_width / face_height;

    // Jawline score
    const jawline = Math.round(
        0.7 * norm(jaw_ratio, 0.60, 0.85) +
        0.3 * norm(chin_ratio, 0.08, 0.14)
    );

    // Cheekbones score
    const cheekbones = Math.round(norm(cheek_ratio, 0.95, 1.25));

    // Skin Quality score
    const sharp = norm(q.sharpness, 50, 250);
    const contr = norm(q.contrast, 20, 70);
    const brightCenter = norm(q.brightness, 80, 170);
    const brightScore = 100 - Math.abs(brightCenter - 50) * 2;
    const skin_quality = Math.round(0.5 * sharp + 0.3 * contr + 0.2 * clamp(brightScore, 0, 100));

    // Masculinity score
    const masculinity = Math.round(
        0.6 * norm(jaw_ratio, 0.60, 0.85) +
        0.4 * norm(face_ratio, 0.65, 0.90)
    );

    // Overall score
    const overall = Math.round(
        0.30 * jawline + 0.25 * cheekbones + 0.20 * skin_quality + 0.25 * masculinity
    );

    // Potential and warnings
    let photo_penalty = 0;
    const warnings: string[] = [];

    if (q.sharpness <= 150) {
        photo_penalty += 15;
        warnings.push("low_sharpness");
    }
    if (q.brightness < 90 || q.brightness > 160) {
        photo_penalty += 10;
        warnings.push("bad_brightness");
    }
    if (q.contrast <= 35) {
        photo_penalty += 10;
        warnings.push("low_contrast");
    }

    const potential = Math.round(clamp(overall + photo_penalty, 0, 100));

    return {
        overall,
        potential,
        masculinity,
        skin_quality,
        jawline,
        cheekbones,
        warnings
    };
}
