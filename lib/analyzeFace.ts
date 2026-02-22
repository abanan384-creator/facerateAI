
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import { getQualityMetrics } from './quality';
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

// Landmark Indices (MediaPipe Face Mesh 468 points)
const INDICES = {
    // Face outline
    forehead_top: 10,
    chin_bottom: 152,
    face_left: 234,
    face_right: 454,

    // Jaw
    jaw_left: 172,
    jaw_right: 397,

    // Cheekbones (zygomatic)
    cheek_left: 123,
    cheek_right: 352,

    // Mouth
    mouth_bottom: 14,
    mouth_left: 61,
    mouth_right: 291,

    // Nose
    nose_tip: 1,
    nose_bridge: 168,     // nasion
    nose_left_ala: 218,   // left ala base
    nose_right_ala: 438,  // right ala base

    // Facial thirds
    nasion: 168,
    subnasale: 2,

    // Forehead width (temples)
    temple_left: 54,
    temple_right: 284,

    // Eyes
    eye_left_inner: 133,
    eye_left_outer: 33,
    eye_left_top: 159,
    eye_left_bottom: 145,
    eye_right_inner: 362,
    eye_right_outer: 263,
    eye_right_top: 386,
    eye_right_bottom: 374,

    // Symmetry reference points
    brow_left: 70,
    brow_right: 300,
    eye_center_left: 468,   // refined iris center left (if available, else fallback)
    eye_center_right: 473,  // refined iris center right
};

export interface DetectionResult {
    valid: boolean;
    warnings: Warning[];
    code?: ErrCode;
}

export interface FullAnalysisResult extends AnalysisScores {
    warnings: Warning[];
}

export type AnalysisResult = FullAnalysisResult;

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

    const nose = getKeypoint(INDICES.nose_tip);
    const leftFace = getKeypoint(INDICES.face_left);
    const rightFace = getKeypoint(INDICES.face_right);

    const leftDist = dist(nose, leftFace);
    const rightDist = dist(nose, rightFace);
    const totalWidth = leftDist + rightDist;

    const yawRatio = leftDist / totalWidth;

    const warnings: Warning[] = [];

    const faceSizeRatio = totalWidth / img.naturalWidth;
    if (faceSizeRatio < 0.1) {
        warnings.push('face_too_small');
    }

    if (mode === 'front') {
        if (yawRatio < 0.35 || yawRatio > 0.65) {
            return { valid: false, warnings: ['not_front'], code: 'BAD_POSE' };
        }
    } else {
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
    const face = faces[0];
    const keypoints = face.keypoints;
    const getKeypoint = (idx: number) => ({ x: keypoints[idx]?.x ?? 0, y: keypoints[idx]?.y ?? 0 });

    // ── Base measurements ──────────────────────────────────────────────────────
    const face_width = dist(getKeypoint(INDICES.face_left), getKeypoint(INDICES.face_right));
    const face_height = dist(getKeypoint(INDICES.forehead_top), getKeypoint(INDICES.chin_bottom));

    // ── Facial Thirds ──────────────────────────────────────────────────────────
    const p_hairline = getKeypoint(INDICES.forehead_top);
    const p_glabella = getKeypoint(INDICES.nasion);
    const p_subnasale = getKeypoint(INDICES.subnasale);
    const p_menton = getKeypoint(INDICES.chin_bottom);

    const upper_third = dist(p_hairline, p_glabella);
    const middle_third = dist(p_glabella, p_subnasale);
    const lower_third = dist(p_subnasale, p_menton);

    const total_height = upper_third + middle_third + lower_third;
    const ideal_third = total_height / 3;

    const upper_dev = Math.abs(upper_third - ideal_third) / ideal_third;
    const middle_dev = Math.abs(middle_third - ideal_third) / ideal_third;
    const lower_dev = Math.abs(lower_third - ideal_third) / ideal_third;
    const avg_dev = (upper_dev + middle_dev + lower_dev) / 3;

    const thirds_score = Math.max(0, 100 - avg_dev * 500);

    // ── Jaw & Cheek ────────────────────────────────────────────────────────────
    const jaw_width = dist(getKeypoint(INDICES.jaw_left), getKeypoint(INDICES.jaw_right));
    const cheek_width = dist(getKeypoint(INDICES.cheek_left), getKeypoint(INDICES.cheek_right));
    const chin_length = dist(getKeypoint(INDICES.mouth_bottom), getKeypoint(INDICES.chin_bottom));

    const jaw_ratio = jaw_width / face_width;
    const chin_ratio = chin_length / face_height;
    const cheek_ratio = cheek_width / jaw_width;
    const face_ratio = face_width / face_height;

    // ── Eyes ───────────────────────────────────────────────────────────────────
    const p_l_inner = getKeypoint(INDICES.eye_left_inner);
    const p_l_outer = getKeypoint(INDICES.eye_left_outer);
    const p_l_top = getKeypoint(INDICES.eye_left_top);
    const p_l_bottom = getKeypoint(INDICES.eye_left_bottom);

    const p_r_inner = getKeypoint(INDICES.eye_right_inner);
    const p_r_outer = getKeypoint(INDICES.eye_right_outer);
    const p_r_top = getKeypoint(INDICES.eye_right_top);
    const p_r_bottom = getKeypoint(INDICES.eye_right_bottom);

    const eye_l_width = dist(p_l_inner, p_l_outer);
    const eye_l_height = dist(p_l_top, p_l_bottom);
    const eye_r_width = dist(p_r_inner, p_r_outer);
    const eye_r_height = dist(p_r_top, p_r_bottom);

    const inter_eye_dist = dist(p_l_inner, p_r_inner);
    const avg_eye_width = (eye_l_width + eye_r_width) / 2;
    const avg_eye_height = (eye_l_height + eye_r_height) / 2;

    const l_tilt = (p_l_inner.y - p_l_outer.y) / eye_l_width;
    const r_tilt = (p_r_inner.y - p_r_outer.y) / eye_r_width;
    const avg_tilt = (l_tilt + r_tilt) / 2;

    const spacing_ratio = inter_eye_dist / avg_eye_width;
    const compactness = avg_eye_height / avg_eye_width;

    const tilt_score = norm(avg_tilt, -0.05, 0.15);
    const spacing_score = clamp(100 - Math.abs(spacing_ratio - 1.0) * 200, 0, 100);
    const compactness_score = norm(compactness, 0.6, 0.35);

    const eyes = Math.round(
        clamp(0.4 * tilt_score + 0.3 * spacing_score + 0.3 * compactness_score, 0, 100)
    );

    // ── NOSE ───────────────────────────────────────────────────────────────────
    // Nose width: distance between ala bases
    // Nose length: nasion to subnasale
    // Ideal: nose width ≈ inter-eye distance (the "1 eye width" rule)
    const nose_left_ala = getKeypoint(INDICES.nose_left_ala);
    const nose_right_ala = getKeypoint(INDICES.nose_right_ala);
    const nose_width = dist(nose_left_ala, nose_right_ala);
    const nose_length = dist(getKeypoint(INDICES.nose_bridge), getKeypoint(INDICES.subnasale));

    // Width ratio: ideal = 1.0 (nose width equals inter-eye dist)
    const nose_width_ratio = nose_width / inter_eye_dist;
    // Length ratio: ideal nose length ≈ 0.30–0.36 of face height
    const nose_length_ratio = nose_length / face_height;

    // Width score: penalise deviations > 15% from ideal ratio of 1.0
    const nose_width_score = clamp(100 - Math.abs(nose_width_ratio - 1.0) * 300, 0, 100);
    // Length score: ideal range 0.30–0.36
    const nose_length_score = norm(nose_length_ratio, 0.25, 0.38);

    const nose = Math.round(0.6 * nose_width_score + 0.4 * nose_length_score);

    // ── FOREHEAD ───────────────────────────────────────────────────────────────
    // Forehead width measured at temples
    // Ideal: forehead width ≈ 0.9–1.0 × cheek width
    const forehead_width = dist(getKeypoint(INDICES.temple_left), getKeypoint(INDICES.temple_right));
    const forehead_cheek_ratio = forehead_width / cheek_width;

    // Ideal ratio is ~0.95 (slightly narrower than cheeks)
    const forehead_score = clamp(100 - Math.abs(forehead_cheek_ratio - 0.95) * 400, 0, 100);
    const forehead = Math.round(forehead_score);

    // ── SYMMETRY ───────────────────────────────────────────────────────────────
    // Compare left vs right halves using 5 paired landmarks
    // Face center = midpoint between face_left and face_right (x-axis)
    const face_center_x = (getKeypoint(INDICES.face_left).x + getKeypoint(INDICES.face_right).x) / 2;

    function symmetryDelta(leftPt: { x: number; y: number }, rightPt: { x: number; y: number }): number {
        const leftDist = Math.abs(leftPt.x - face_center_x);
        const rightDist = Math.abs(rightPt.x - face_center_x);
        const avg = (leftDist + rightDist) / 2;
        if (avg === 0) return 0;
        return Math.abs(leftDist - rightDist) / avg;
    }

    const sym_eyes = symmetryDelta(p_l_outer, p_r_outer);
    const sym_cheeks = symmetryDelta(getKeypoint(INDICES.cheek_left), getKeypoint(INDICES.cheek_right));
    const sym_jaw = symmetryDelta(getKeypoint(INDICES.jaw_left), getKeypoint(INDICES.jaw_right));
    const sym_mouth = symmetryDelta(getKeypoint(INDICES.mouth_left), getKeypoint(INDICES.mouth_right));
    const sym_nose_ala = symmetryDelta(nose_left_ala, nose_right_ala);

    const avg_sym_delta = (sym_eyes + sym_cheeks + sym_jaw + sym_mouth + sym_nose_ala) / 5;
    // 0% asymmetry → 100, 10% asymmetry → ~50, 20%+ → 0
    const symmetry = Math.round(clamp(100 - avg_sym_delta * 500, 0, 100));

    // ── JAWLINE ────────────────────────────────────────────────────────────────
    const jawline = Math.round(
        0.7 * norm(jaw_ratio, 0.60, 0.85) +
        0.3 * norm(chin_ratio, 0.08, 0.14)
    );

    // ── CHEEKBONES ─────────────────────────────────────────────────────────────
    const cheekbones = Math.round(norm(cheek_ratio, 0.95, 1.25));

    // ── MASCULINITY ────────────────────────────────────────────────────────────
    const masculinity = Math.round(
        0.6 * norm(jaw_ratio, 0.60, 0.85) +
        0.4 * norm(face_ratio, 0.65, 0.90)
    );

    // ── HARMONY ────────────────────────────────────────────────────────────────
    // Weighted average of structural metrics (excluding masculinity/potential)
    const harmony = Math.round(
        0.20 * jawline +
        0.15 * cheekbones +
        0.20 * eyes +
        0.15 * nose +
        0.15 * clamp(thirds_score, 0, 100) +
        0.15 * symmetry
    );

    // ── OVERALL ────────────────────────────────────────────────────────────────
    const overall = Math.round(
        0.14 * jawline +
        0.11 * cheekbones +
        0.11 * masculinity +
        0.14 * eyes +
        0.11 * clamp(thirds_score, 0, 100) +
        0.12 * nose +
        0.10 * forehead +
        0.13 * symmetry +
        0.04 * harmony   // harmony is derived, small weight to avoid double-counting
    );

    // ── QUALITY / POTENTIAL ────────────────────────────────────────────────────
    const q = getQualityMetrics(img);
    const warnings: Warning[] = [];

    if (q.sharpness <= 150) { warnings.push('low_sharpness'); }
    if (q.brightness < 90 || q.brightness > 160) { warnings.push('bad_brightness'); }
    if (q.contrast <= 35) { warnings.push('low_contrast'); }

    let potentialBonus = 0;
    if (q.sharpness <= 150) potentialBonus += 15;
    if (q.brightness < 90 || q.brightness > 160) potentialBonus += 10;
    if (q.contrast <= 35) potentialBonus += 10;

    const finalPotential = Math.round(clamp(overall + potentialBonus, 0, 100));

    return {
        jawline,
        cheekbones,
        masculinity,
        eyes,
        facial_thirds: Math.round(clamp(thirds_score, 0, 100)),
        nose,
        forehead,
        symmetry,
        harmony,
        overall,
        potential: finalPotential,
        warnings,
    };
}
