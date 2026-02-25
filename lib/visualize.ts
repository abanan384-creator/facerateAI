import { Mode } from './state';

/**
 * Facial skeleton visualization using verified MediaPipe Face Mesh 468 landmark indices.
 * 
 * References:
 * - Official MediaPipe Face Mesh connections:
 *   https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/src/constants.ts
 * - FACE_OVAL: [10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109,10]
 * - LEFT_EYE: [263,249,390,373,374,380,381,382,362,466,388,387,386,385,384,398,362] (closed loop via 263)
 * - RIGHT_EYE: [33,7,163,144,145,153,154,155,133,246,161,160,159,158,157,173,133] (closed loop via 33)
 * - LEFT_EYEBROW: [276,283,282,295,285] + [300,293,334,296,336]
 * - RIGHT_EYEBROW: [46,53,52,65,55] + [70,63,105,66,107]
 * - LIPS_OUTER: [61,146,91,181,84,17,314,405,321,375,291,409,270,269,267,0,37,39,40,185,61]
 * - NOSE: bridge [168,6,197,195,5,4] + bottom [48,115,220,237,44,1,274,457,438,399,278]
 */

// ── Verified contour indices (from MediaPipe official connections) ──────────

const CONTOURS = {
    // Face oval — official FACE_OVAL_CONNECTIONS path
    FACE_OVAL: [
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
        397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
        172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10
    ],

    // Jawline — lower portion of face oval (from right ear to chin to left ear)
    JAWLINE: [
        234, 93, 132, 58, 172, 136, 150, 149, 176, 148,
        152,
        377, 400, 378, 379, 365, 397, 288, 361, 323, 454
    ],

    // Right eye — official RIGHT_EYE_CONNECTIONS
    // Lower lid: 33→7→163→144→145→153→154→155→133
    // Upper lid: 33→246→161→160→159→158→157→173→133
    EYE_RIGHT_LOWER: [33, 7, 163, 144, 145, 153, 154, 155, 133],
    EYE_RIGHT_UPPER: [33, 246, 161, 160, 159, 158, 157, 173, 133],

    // Left eye — official LEFT_EYE_CONNECTIONS
    // Lower lid: 263→249→390→373→374→380→381→382→362
    // Upper lid: 263→466→388→387→386→385→384→398→362
    EYE_LEFT_LOWER: [263, 249, 390, 373, 374, 380, 381, 382, 362],
    EYE_LEFT_UPPER: [263, 466, 388, 387, 386, 385, 384, 398, 362],

    // Right eyebrow — official RIGHT_EYEBROW_CONNECTIONS
    EYEBROW_RIGHT_UPPER: [46, 53, 52, 65, 55],
    EYEBROW_RIGHT_LOWER: [70, 63, 105, 66, 107],

    // Left eyebrow — official LEFT_EYEBROW_CONNECTIONS
    EYEBROW_LEFT_UPPER: [276, 283, 282, 295, 285],
    EYEBROW_LEFT_LOWER: [300, 293, 334, 296, 336],

    // Nose bridge (nasion → nose tip) — verified central nose spine
    NOSE_BRIDGE: [168, 6, 197, 195, 5, 4],

    // Nose bottom contour (nostrils and ala) — verified indices
    // Right ala → septum → left ala
    NOSE_BOTTOM: [102, 49, 48, 115, 220, 237, 44, 1, 274, 457, 438, 399, 456, 420, 279, 331],

    // Outer lip contour — official LIPS outer connections
    LIPS_OUTER: [
        61, 146, 91, 181, 84, 17, 314, 405, 321, 375,
        291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 61
    ],

    // Inner lip contour — official LIPS inner connections
    LIPS_INNER: [
        78, 95, 88, 178, 87, 14, 317, 402, 318, 324,
        308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78
    ],
};

// ── Key anatomical landmark indices (verified) ────────────────────────────

const LANDMARKS = {
    // Mid-sagittal (center line)
    FOREHEAD_TOP: 151,       // Top of forehead / hairline (Trichion)
    GLABELLA: 9,            // Between eyebrows (similar to 168 nasion but slightly higher)
    NASION: 168,            // Root of nose between eyes
    NOSE_TIP: 1,            // Tip of nose (pronasale)
    SUBNASALE: 2,           // Base of nose / columella
    CHIN_BOTTOM: 152,       // Lowest point of chin (menton/gnathion)

    // Lateral face boundaries
    FACE_LEFT: 234,         // Left ear / widest point left
    FACE_RIGHT: 454,        // Right ear / widest point right

    // Eye corners
    EYE_RIGHT_OUTER: 33,    // Right eye lateral canthus
    EYE_RIGHT_INNER: 133,   // Right eye medial canthus
    EYE_LEFT_INNER: 362,    // Left eye medial canthus
    EYE_LEFT_OUTER: 263,    // Left eye lateral canthus

    // Mouth corners
    MOUTH_LEFT: 61,
    MOUTH_RIGHT: 291,

    // Nose ala (wings)
    NOSE_LEFT_ALA: 218,
    NOSE_RIGHT_ALA: 438,
    // Forehead width (temples)
    TEMPLE_LEFT: 103,
    TEMPLE_RIGHT: 332,

    // Skeletal (Bony) points
    CHEEKBONE_LEFT: 227,   // Zygion
    CHEEKBONE_RIGHT: 447,
    JAW_ANGLE_LEFT: 132,   // Gonion
    JAW_ANGLE_RIGHT: 361,
};

export function drawAnalysis(
    ctx: CanvasRenderingContext2D,
    landmarks: { x: number; y: number }[],
    width: number,
    height: number,
    mode: Mode = 'front'
) {
    if (!landmarks || landmarks.length < 468) return;

    const p = (idx: number) => landmarks[idx];

    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // ── Helper functions ─────────────────────────────────────────────────────

    const drawPath = (indices: number[], close = false) => {
        if (indices.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(p(indices[0]).x, p(indices[0]).y);
        for (let i = 1; i < indices.length; i++) {
            ctx.lineTo(p(indices[i]).x, p(indices[i]).y);
        }
        if (close) ctx.closePath();
        ctx.stroke();
    };

    const drawHLine = (y: number, xL: number, xR: number) => {
        ctx.beginPath();
        ctx.moveTo(xL, y);
        ctx.lineTo(xR, y);
        ctx.stroke();
    };

    const drawVLine = (x: number, yT: number, yB: number) => {
        ctx.beginPath();
        ctx.moveTo(x, yT);
        ctx.lineTo(x, yB);
        ctx.stroke();
    };

    const drawDot = (idx: number, radius = 3) => {
        const pt = p(idx);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, 2 * Math.PI);
        ctx.fill();
    };

    // ── 1. Mesh contour lines (subtle white) ─────────────────────────────────
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // Face oval
    drawPath(CONTOURS.FACE_OVAL);

    // Eyebrows
    drawPath(CONTOURS.EYEBROW_LEFT_UPPER);
    drawPath(CONTOURS.EYEBROW_LEFT_LOWER);
    drawPath(CONTOURS.EYEBROW_RIGHT_UPPER);
    drawPath(CONTOURS.EYEBROW_RIGHT_LOWER);

    // Nose
    drawPath(CONTOURS.NOSE_BRIDGE);
    drawPath(CONTOURS.NOSE_BOTTOM);

    // Eyes (draw upper + lower as closed shapes)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.30)';
    // Right eye
    ctx.beginPath();
    const reL = CONTOURS.EYE_RIGHT_LOWER;
    const reU = CONTOURS.EYE_RIGHT_UPPER;
    ctx.moveTo(p(reL[0]).x, p(reL[0]).y);
    for (let i = 1; i < reL.length; i++) ctx.lineTo(p(reL[i]).x, p(reL[i]).y);
    for (let i = reU.length - 2; i >= 0; i--) ctx.lineTo(p(reU[i]).x, p(reU[i]).y);
    ctx.closePath();
    ctx.stroke();

    // Left eye
    ctx.beginPath();
    const leL = CONTOURS.EYE_LEFT_LOWER;
    const leU = CONTOURS.EYE_LEFT_UPPER;
    ctx.moveTo(p(leL[0]).x, p(leL[0]).y);
    for (let i = 1; i < leL.length; i++) ctx.lineTo(p(leL[i]).x, p(leL[i]).y);
    for (let i = leU.length - 2; i >= 0; i--) ctx.lineTo(p(leU[i]).x, p(leU[i]).y);
    ctx.closePath();
    ctx.stroke();

    // Lips
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.20)';
    drawPath(CONTOURS.LIPS_OUTER, true);

    // ── 2. Facial Thirds (teal dashed lines) ─────────────────────────────────
    //   Line 1: Trichion (hairline / forehead top) — index 10
    //   Line 2: Nasion (root of nose / glabella) — index 168
    //   Line 3: Subnasale (base of nose) — index 2
    //   Line 4: Menton (chin bottom) — index 152

    const yForehead = p(LANDMARKS.FOREHEAD_TOP).y;
    const yNasion = p(LANDMARKS.NASION).y;
    const ySubnasale = p(LANDMARKS.SUBNASALE).y;
    const yChin = p(LANDMARKS.CHIN_BOTTOM).y;

    // Extend lines slightly beyond the face for clarity
    const xLeft = p(LANDMARKS.FACE_LEFT).x;
    const xRight = p(LANDMARKS.FACE_RIGHT).x;
    const margin = (xRight - xLeft) * 0.08;

    ctx.strokeStyle = 'rgba(20, 184, 166, 0.7)'; // Teal
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);

    drawHLine(yForehead, xLeft - margin, xRight + margin);
    drawHLine(yNasion, xLeft - margin, xRight + margin);
    drawHLine(ySubnasale, xLeft - margin, xRight + margin);
    drawHLine(yChin, xLeft - margin, xRight + margin);

    // Small labels for thirds
    ctx.fillStyle = 'rgba(20, 184, 166, 0.6)';
    ctx.font = `${Math.max(10, (xRight - xLeft) * 0.035)}px sans-serif`;
    ctx.textAlign = 'left';
    const labelX = xRight + margin + 4;
    ctx.fillText('Upper ⅓', labelX, (yForehead + yNasion) / 2 + 4);
    ctx.fillText('Middle ⅓', labelX, (yNasion + ySubnasale) / 2 + 4);
    ctx.fillText('Lower ⅓', labelX, (ySubnasale + yChin) / 2 + 4);

    if (mode === 'side') return;

    // ── 3. Facial Fifths (indigo dashed vertical lines) ──────────────────────
    //   5 equal vertical segments: ear-to-eye, eye, inter-eye, eye, eye-to-ear
    //   Boundaries: face_left | right_eye_outer | right_eye_inner | left_eye_inner | left_eye_outer | face_right

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)'; // Indigo
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    const fifthXs = [
        p(LANDMARKS.FACE_LEFT).x,
        p(LANDMARKS.EYE_RIGHT_OUTER).x,
        p(LANDMARKS.EYE_RIGHT_INNER).x,
        p(LANDMARKS.EYE_LEFT_INNER).x,
        p(LANDMARKS.EYE_LEFT_OUTER).x,
        p(LANDMARKS.FACE_RIGHT).x,
    ];

    for (const x of fifthXs) {
        drawVLine(x, yForehead - margin, yChin + margin);
    }

    // ── 4. Symmetry center line (cyan, solid) ────────────────────────────────
    // Use the midpoint of paired landmarks for a more accurate vertical center
    const centerTop = {
        x: (p(LANDMARKS.FACE_LEFT).x + p(LANDMARKS.FACE_RIGHT).x) / 2,
        y: yForehead
    };
    const centerBottom = {
        x: (p(LANDMARKS.FACE_LEFT).x + p(LANDMARKS.FACE_RIGHT).x) / 2,
        y: yChin
    };

    // Cross-check with nasion and nose tip for better alignment
    const midNasion = p(LANDMARKS.NASION).x;
    const midNoseTip = p(LANDMARKS.NOSE_TIP).x;
    const midChin = p(LANDMARKS.CHIN_BOTTOM).x;
    const avgCenterX = (centerTop.x + midNasion + midNoseTip + midChin) / 4;

    ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)'; // Cyan
    ctx.lineWidth = 2;
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(avgCenterX, yForehead - margin * 0.5);
    ctx.lineTo(avgCenterX, yChin + margin * 0.5);
    ctx.stroke();

    // ── 5. Key feature points (orange dots) ──────────────────────────────────
    ctx.fillStyle = 'rgba(249, 115, 22, 0.9)'; // Orange
    ctx.setLineDash([]);

    // Anatomical landmarks for clear visualization
    drawDot(LANDMARKS.FOREHEAD_TOP, 3);
    drawDot(LANDMARKS.CHIN_BOTTOM, 3);
    drawDot(LANDMARKS.NASION, 3);
    drawDot(LANDMARKS.NOSE_TIP, 3);
    drawDot(LANDMARKS.SUBNASALE, 3);

    // Eye corners
    drawDot(LANDMARKS.EYE_RIGHT_OUTER, 2.5);
    drawDot(LANDMARKS.EYE_RIGHT_INNER, 2.5);
    drawDot(LANDMARKS.EYE_LEFT_INNER, 2.5);
    drawDot(LANDMARKS.EYE_LEFT_OUTER, 2.5);

    // Mouth corners
    drawDot(LANDMARKS.MOUTH_LEFT, 2.5);
    drawDot(LANDMARKS.MOUTH_RIGHT, 2.5);

    // Nose ala
    drawDot(LANDMARKS.NOSE_LEFT_ALA, 2.5);
    drawDot(LANDMARKS.NOSE_RIGHT_ALA, 2.5);

    // Face boundaries
    drawDot(LANDMARKS.FACE_LEFT, 2.5);
    drawDot(LANDMARKS.FACE_RIGHT, 2.5);

    // Forehead/Temple points
    ctx.fillStyle = 'rgba(249, 115, 22, 0.6)'; // Slightly more transparent orange
    drawDot(LANDMARKS.TEMPLE_LEFT, 2.5);
    drawDot(LANDMARKS.TEMPLE_RIGHT, 2.5);

    // Bony skeletal points
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'; // Reddish for bone landmarks
    drawDot(LANDMARKS.CHEEKBONE_LEFT, 3);
    drawDot(LANDMARKS.CHEEKBONE_RIGHT, 3);
    drawDot(LANDMARKS.JAW_ANGLE_LEFT, 3);
    drawDot(LANDMARKS.JAW_ANGLE_RIGHT, 3);
}
