
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import { getQualityMetrics, analyzeSkin } from './quality';
import { Mode, Warning, ErrCode, AnalysisScores } from './state';

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

// Utility Math
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
const norm = (val: number, min: number, max: number) => clamp(((val - min) / (max - min)) * 100, 0, 100);
const dist = (p1: { x: number; y: number }, p2: { x: number; y: number }) =>
    Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

// Landmark Indices (MediaPipe Face Mesh)
const INDICES = {
    forehead_top: 10,
    chin_bottom: 152,
    face_left: 234,   // Leftmost point
    face_right: 454,  // Rightmost point
    jaw_left: 172,
    jaw_right: 397,
    cheek_left: 123,  // Zygomatic
    cheek_right: 352, // Zygomatic
    mouth_bottom: 14,
    nose_tip: 1,
    nose_bridge: 168,
    glabella: 10,       // Top of forehead (Hairline) -> Actually 10 is top. 
    // Wait. Facial thirds: Hairline-Glabella, Glabella-Subnasale, Subnasale-Menton.
    // 10 is Top. 
    // 168 is between eyes (Glabella/Nasion approx).
    // 2 is Subnasale (under nose). 
    // 152 is Chin (Menton).
    nasion: 168,
    subnasale: 2
};

export interface DetectionResult {
    valid: boolean;
    warnings: Warning[];
    code?: ErrCode;
}

export interface FullAnalysisResult extends AnalysisScores {
    warnings: Warning[];
}

/**
 * 1. DETECT (Pose Check + Warnings)
 */
export async function detectFace(img: HTMLImageElement, mode: Mode): Promise<DetectionResult> {
    const det = await getDetector();
    const faces = await det.estimateFaces(img);

    if (faces.length === 0) {
        return { valid: false, warnings: [], code: 'NO_FACE_DETECTED' };
    }

    const face = faces[0];
    const k = face.keypoints;
    const getKeypoint = (idx: number) => ({ x: k[idx].x, y: k[idx].y, z: (k[idx].z || 0) });

    // Pose Check (Simple Heuristic: Yaw based on width ratios)
    const nose = getKeypoint(INDICES.nose_tip);
    const leftFace = getKeypoint(INDICES.face_left);
    const rightFace = getKeypoint(INDICES.face_right);

    const leftDist = dist(nose, leftFace);
    const rightDist = dist(nose, rightFace);
    const totalWidth = leftDist + rightDist;

    // Yaw estimation: Ratio ~0.5 means front, ~0.1 or ~0.9 means side
    const yawRatio = leftDist / totalWidth; // Left side proportion vs total

    const warnings: Warning[] = [];

    // Check if face is too small
    const faceSizeRatio = totalWidth / img.naturalWidth;
    if (faceSizeRatio < 0.1) {
        warnings.push('face_too_small');
    }

    // Pose Validation
    if (mode === 'front') {
        // Front: Ratio should be close to 0.5 (0.4 - 0.6)
        if (yawRatio < 0.35 || yawRatio > 0.65) {
            return { valid: false, warnings: ['not_front'], code: 'BAD_POSE' };
        }
    } else {
        // Side: Ratio should be extreme (< 0.3 or > 0.7)
        // If it's too balanced (0.4-0.6), it's definitely not side
        if (yawRatio > 0.4 && yawRatio < 0.6) {
            return { valid: false, warnings: ['not_side'], code: 'BAD_POSE' };
        }
    }

    return { valid: true, warnings };
}

/**
 * 2. SCORE (Calculate Ratios + Quality)
 */
export async function scoreFace(img: HTMLImageElement): Promise<FullAnalysisResult> {
    const det = await getDetector();
    const faces = await det.estimateFaces(img);
    // Assume face exists since detectFace passed
    const face = faces[0];
    const keypoints = face.keypoints;
    const getKeypoint = (idx: number) => ({ x: keypoints[idx].x, y: keypoints[idx].y });

    // Features
    const face_width = dist(getKeypoint(INDICES.face_left), getKeypoint(INDICES.face_right));
    const face_height = dist(getKeypoint(INDICES.forehead_top), getKeypoint(INDICES.chin_bottom));

    // Facial Thirds Analysis
    // Ideal face is divided into 3 equal vertical sections:
    // 1. Upper third: Hairline (forehead top) to Glabella (between eyebrows)
    // 2. Middle third: Glabella to Subnasale (under nose)
    // 3. Lower third: Subnasale to Menton (chin bottom)

    const p_hairline = getKeypoint(INDICES.forehead_top);  // Top of forehead (10)
    const p_glabella = getKeypoint(INDICES.nasion);         // Between eyes (168)
    const p_subnasale = getKeypoint(INDICES.subnasale);     // Under nose (2)
    const p_menton = getKeypoint(INDICES.chin_bottom);      // Chin (152)

    // Calculate distances for each third
    const upper_third = dist(p_hairline, p_glabella);
    const middle_third = dist(p_glabella, p_subnasale);
    const lower_third = dist(p_subnasale, p_menton);

    const total_height = upper_third + middle_third + lower_third;
    const ideal_third = total_height / 3;

    // Calculate deviation from ideal for each section
    const upper_deviation = Math.abs(upper_third - ideal_third) / ideal_third;
    const middle_deviation = Math.abs(middle_third - ideal_third) / ideal_third;
    const lower_deviation = Math.abs(lower_third - ideal_third) / ideal_third;

    // Average deviation
    const avg_deviation = (upper_deviation + middle_deviation + lower_deviation) / 3;

    // Convert to score (0% deviation = 100 points, 20% deviation = 0 points)
    // Formula: score = 100 - (deviation_percent * 500)
    const thirds_score = Math.max(0, 100 - (avg_deviation * 500));


    const jaw_width = dist(getKeypoint(INDICES.jaw_left), getKeypoint(INDICES.jaw_right));
    const cheek_width = dist(getKeypoint(INDICES.cheek_left), getKeypoint(INDICES.cheek_right));
    const chin_length = dist(getKeypoint(INDICES.mouth_bottom), getKeypoint(INDICES.chin_bottom));

    // Ratios
    const jaw_ratio = jaw_width / face_width;
    const chin_ratio = chin_length / face_height;
    const cheek_ratio = cheek_width / jaw_width;
    const face_ratio = (face_width / face_height);

    // Quality Metrics
    const q = getQualityMetrics(img);

    // Initial Scores Logic
    // 1. Jawline
    const jawline = Math.round(
        0.7 * norm(jaw_ratio, 0.60, 0.85) +
        0.3 * norm(chin_ratio, 0.08, 0.14)
    );

    // 2. Cheekbones
    const cheekbones = Math.round(norm(cheek_ratio, 0.95, 1.25));

    // 3. Skin Quality logic
    // We use local texture variance (smoothness) on cheeks/forehead
    const rawSkinScore = analyzeSkin(img, keypoints);

    // Penalty for bad lighting/blur (if image is too blurry, smooth skin score is unreliable)
    // If sharpness is very low, we can't be sure it's good skin, so we dampen the score.
    const blurPenalty = q.sharpness < 100 ? (100 - q.sharpness) * 0.2 : 0;

    const skin_quality = Math.round(clamp(rawSkinScore - blurPenalty, 0, 100));

    // 4. Masculinity
    const masculinity = Math.round(
        0.6 * norm(jaw_ratio, 0.60, 0.85) +
        0.4 * norm(face_ratio, 0.65, 0.90)
    );

    // 5. Overall
    const overall = Math.round(
        0.25 * jawline + 0.20 * cheekbones + 0.15 * skin_quality + 0.20 * masculinity + 0.20 * clamp(thirds_score, 0, 100)
    );

    // 6. Potential & Warnings
    let photo_penalty = 0;
    const warnings: Warning[] = [];

    if (q.sharpness <= 150) {
        photo_penalty -= 15;
        warnings.push('low_sharpness');
    }
    if (q.brightness < 90 || q.brightness > 160) {
        photo_penalty -= 10;
        warnings.push('bad_brightness');
    }
    if (q.contrast <= 35) {
        photo_penalty -= 10;
        warnings.push('low_contrast');
    }

    const potential = Math.round(clamp(overall - photo_penalty, 0, 100)); // Note: penalty is negative, so subtracting makes it positive if logic implies "potential is higher if improved"? 
    // Wait, prompt says: "if sharpness <= 150: +15 warning".
    // Prompt: "potential = clamp(overall + photo_penalty, 0, 100)"
    // Let's re-read carefully: "if sharpness <= 150: +15 warning". This implies potential score is HIGHER than current overall, because it COULD be better.
    // So YES, add to potential.

    let potentialBonus = 0;
    if (q.sharpness <= 150) potentialBonus += 15;
    if (q.brightness < 90 || q.brightness > 160) potentialBonus += 10;
    if (q.contrast <= 35) potentialBonus += 10;

    const finalPotential = Math.round(clamp(overall + potentialBonus, 0, 100));

    return {
        jawline,
        cheekbones,
        skin_quality,
        masculinity,
        facial_thirds: Math.round(clamp(thirds_score, 0, 100)),
        overall,
        potential: finalPotential,
        warnings
    };
}
