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

Additional indices for advanced metrics:
- 33: Right eye (outer corner)
- 133: Right eye (inner corner)
- 362: Left eye (inner corner)
- 263: Left eye (outer corner)
- 159: Right eye (center pupil area)
- 386: Left eye (center pupil area)
- 61: Upper lip right
- 291: Upper lip left
- 0: Nose tip
- 168: Nose bridge center
- 9: Nose base (between eyebrows)
- 197: Eyebrow ridge center
*/

export interface AnalysisResult {
    overall: number;
    potential: number;
    masculinity: number;
    skin_quality: number;
    jawline: number;
    cheekbones: number;
    symmetry: number;  // NEW: Facial symmetry score
    golden_ratio: number;  // NEW: Golden ratio compliance
    facial_thirds: number;  // NEW: Vertical face proportion (1:1:1)
    facial_fifths: number;  // NEW: Horizontal face proportion (1:1:1:1:1)
    eye_score: number;      // NEW: Eye quality (canthal tilt, spacing)
    nose_score: number;     // NEW: Nose proportion score
    warnings: string[];
    landmarks?: { x: number; y: number }[]; // NEW: Return landmarks for visualization
}

let detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;

// Helper function for symmetry calculation
function calculateSymmetry(
    centerPoint: { x: number; y: number },
    leftPoint: { x: number; y: number },
    rightPoint: { x: number; y: number }
): number {
    const leftDist = dist(centerPoint, leftPoint);
    const rightDist = dist(centerPoint, rightPoint);
    const difference = Math.abs(leftDist - rightDist);
    const average = (leftDist + rightDist) / 2;

    // Symmetry percentage (100 = perfect symmetry)
    return average > 0 ? (1 - difference / average) * 100 : 100;
}

// Helper function for Golden Ratio scoring
const PHI = 1.618; // Golden Ratio constant
function calculateGoldenRatioScore(ratio: number, idealPhi: number = PHI): number {
    // Score how close a ratio is to the golden ratio
    const difference = Math.abs(ratio - idealPhi);
    const maxDeviation = 0.5; // Allow 0.5 deviation for scoring
    const score = Math.max(0, (1 - difference / maxDeviation)) * 100;
    return clamp(score, 0, 100);
}

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

    // Additional points for advanced metrics
    const eye_right_outer = getKeypoint(33);
    const eye_right_inner = getKeypoint(133);
    const eye_left_inner = getKeypoint(362);
    const eye_left_outer = getKeypoint(263);
    const eye_right_top = getKeypoint(159);
    const eye_right_bottom = getKeypoint(145);
    const eye_left_top = getKeypoint(386);
    const eye_left_bottom = getKeypoint(374);
    const nose_center = getKeypoint(168);
    const nose_base = getKeypoint(9);  // Between eyebrows
    const nose_tip = getKeypoint(0);
    const mouth_left = getKeypoint(61);
    const mouth_right = getKeypoint(291);
    const nose_left = getKeypoint(102);  // Nose ala left
    const nose_right = getKeypoint(331); // Nose ala right

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

    // Symmetry score (analyze left/right balance)
    const eyeSymmetry = calculateSymmetry(nose_center, eye_left_outer, eye_right_outer);
    const cheekSymmetry = calculateSymmetry(nose_center, cheek_left, cheek_right);
    const jawSymmetry = calculateSymmetry(nose_center, jaw_left, jaw_right);
    const symmetry = Math.round((eyeSymmetry + cheekSymmetry + jawSymmetry) / 3);

    // Golden Ratio score (φ ≈ 1.618 divine proportion)
    // Check multiple facial proportions against golden ratio
    const faceHeightToWidth = face_height / face_width;
    const noseToTopDist = dist(forehead_top, nose_center);
    const noseToChinDist = dist(nose_center, chin_bottom);
    const upperToLowerFace = noseToTopDist / noseToChinDist;

    // Score each proportion
    const faceRatioScore = calculateGoldenRatioScore(faceHeightToWidth);
    const verticalRatioScore = calculateGoldenRatioScore(upperToLowerFace);

    const golden_ratio = Math.round((faceRatioScore + verticalRatioScore) / 2);

    // Facial Thirds (Horizontal equal thirds: Forehead, Nose, Lower Face)
    const upperThird = dist(forehead_top, nose_base);
    const midThird = dist(nose_base, nose_tip);
    const lowerThird = dist(nose_tip, chin_bottom);

    // Calculate deviation from equal thirds
    const avgThird = (upperThird + midThird + lowerThird) / 3;
    const dev1 = Math.abs(upperThird - avgThird);
    const dev2 = Math.abs(midThird - avgThird);
    const dev3 = Math.abs(lowerThird - avgThird);

    const maxDev = Math.max(dev1, dev2, dev3);
    const facial_thirds = Math.round(Math.max(0, 100 - (maxDev / avgThird) * 300)); // Strict scoring

    // Facial Fifths (Vertical equal fifths across face width)
    const fifth1 = dist(face_left, eye_right_outer);        // Reserving variable names (Right ear to Right eye)
    const fifth2 = dist(eye_right_outer, eye_right_inner);  // Right eye width
    const fifth3 = dist(eye_right_inner, eye_left_inner);   // Inter-eye distance
    const fifth4 = dist(eye_left_inner, eye_left_outer);    // Left eye width
    const fifth5 = dist(eye_left_outer, face_right);        // Left eye to Left ear

    const avgFifth = (fifth1 + fifth2 + fifth3 + fifth4 + fifth5) / 5;
    const devF1 = Math.abs(fifth1 - avgFifth);
    const devF2 = Math.abs(fifth2 - avgFifth);
    const devF3 = Math.abs(fifth3 - avgFifth);
    const devF4 = Math.abs(fifth4 - avgFifth);
    const devF5 = Math.abs(fifth5 - avgFifth);

    const maxFifthDev = Math.max(devF1, devF2, devF3, devF4, devF5);
    const facial_fifths = Math.round(Math.max(0, 100 - (maxFifthDev / avgFifth) * 300));

    // Eye Score (Canthal Tilt + Spacing)
    // 1. Canthal Tilt: Positive angle is generally preferred (outer corner higher than inner)
    const leftTilt = (eye_left_outer.y - eye_left_inner.y); // Note: Y increases downwards in canvas!
    // If outer.y < inner.y (smaller Y is higher), then tilt is positive (upwards).
    // Let's compute slope normally: -dy (visual up) / dx
    const leftTiltAngle = -1 * (eye_left_outer.y - eye_left_inner.y) / (eye_left_outer.x - eye_left_inner.x);
    const rightTiltAngle = -1 * (eye_right_outer.y - eye_right_inner.y) / (eye_right_outer.x - eye_right_inner.x); // Right eye dx is negative? No, x coords are global.
    // Right eye: outer(33) is rightmost? No, anatomical right is visual left.
    // Right Eye (visual left): Inner(133, right) > Outer(33, left). 
    // Wait, let's verify logic.
    // Dist is safe. For angle, just check if Outer Y is less than (higher) Inner Y.
    const leftTiltGood = eye_left_outer.y < eye_left_inner.y; // Visual right eye outer higher
    const rightTiltGood = eye_right_outer.y < eye_right_inner.y; // Visual left eye outer higher

    // Spacing
    const eyeSpacingRatio = fifth3 / ((fifth2 + fifth4) / 2); // Space / AvgEyeWidth. Ideal ~1.0
    const spacingScore = norm(eyeSpacingRatio, 0.8, 1.2); // Penalize if too far/close

    const eye_score = Math.round(
        0.5 * spacingScore +
        0.5 * (leftTiltGood && rightTiltGood ? 100 : 70) // Simple boolean score for tilt for now
    );

    // Nose Score
    const nose_width = dist(nose_left, nose_right);
    const mouth_width = dist(mouth_left, mouth_right);
    const noseWidthRatio = nose_width / mouth_width; // Ideal ~ 0.7-0.8 (nose narrower than mouth)
    const noseFaceRatio = nose_width / face_width;   // Ideal ~ 0.25 (1/4 of face)

    // Nose scoring
    const nose_score = Math.round(
        0.5 * norm(noseWidthRatio, 0.6, 0.9) +
        0.5 * norm(noseFaceRatio, 0.20, 0.30)
    );

    // Overall score
    const overall = Math.round(
        0.15 * jawline + 0.15 * cheekbones + 0.15 * skin_quality + 0.15 * masculinity +
        0.10 * symmetry + 0.05 * golden_ratio + 0.05 * facial_thirds + 0.05 * facial_fifths +
        0.10 * eye_score + 0.05 * nose_score
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
        symmetry,
        golden_ratio,
        facial_thirds,
        facial_fifths,
        eye_score,
        nose_score,
        warnings,
        landmarks: keypoints
    };
}
