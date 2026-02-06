
/**
 * Utility to visualize facial analysis metrics on a canvas
 */

// Indices for drawing
const INDICES = {
    JAWLINE: [234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323, 454],
    EYEBROW_LEFT: [276, 283, 282, 295, 285, 300, 293, 334, 296, 336],
    EYEBROW_RIGHT: [46, 53, 52, 65, 55, 70, 63, 105, 66, 107],
    NOSE_BRIDGE: [10, 151, 9, 8, 168, 6, 197, 195, 5, 4],
    NOSE_BOTTOM: [102, 219, 218, 237, 48, 49, 279, 420, 438, 457, 331],
    EYE_LEFT: [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466, 263],
    EYE_RIGHT: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33],
    LIPS_OUTER: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 61],

    // Feature points
    FOREHEAD_TOP: 10,
    CHIN_BOTTOM: 152,
    NOSE_BASE: 2, // Similar to 9 or 19
    NOSE_TIP: 0,
    FACE_LEFT: 234,
    FACE_RIGHT: 454,
    EYE_LEFT_OUTER: 263,
    EYE_RIGHT_OUTER: 33,
    EYE_LEFT_INNER: 362,
    EYE_RIGHT_INNER: 133,
};

export function drawAnalysis(
    ctx: CanvasRenderingContext2D,
    landmarks: { x: number; y: number }[],
    width: number,
    height: number
) {
    if (!landmarks || landmarks.length === 0) return;

    // Helper to get point
    const p = (idx: number) => landmarks[idx];

    // Clear previous
    ctx.clearRect(0, 0, width, height);

    // Set styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Draw Mesh Contours (Subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    const drawPath = (indices: number[], close = false) => {
        ctx.beginPath();
        const first = p(indices[0]);
        ctx.moveTo(first.x, first.y);
        for (let i = 1; i < indices.length; i++) {
            const pt = p(indices[i]);
            ctx.lineTo(pt.x, pt.y);
        }
        if (close) ctx.closePath();
        ctx.stroke();
    };

    drawPath(INDICES.JAWLINE);
    drawPath(INDICES.EYEBROW_LEFT);
    drawPath(INDICES.EYEBROW_RIGHT);
    drawPath(INDICES.NOSE_BRIDGE);
    drawPath(INDICES.NOSE_BOTTOM);
    drawPath(INDICES.EYE_LEFT, true);
    drawPath(INDICES.EYE_RIGHT, true);
    drawPath(INDICES.LIPS_OUTER, true);

    // 2. Draw Facial Thirds (Teal Lines)
    // Horizontal lines at: Forehead, Eyebrows (Nose Base), Nose Bottom, Chin
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.8)'; // Teal-500
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    const yForehead = p(INDICES.FOREHEAD_TOP).y;
    const yBrows = p(9).y; // Between brows
    const yNose = p(2).y; // Nose tip/base (actually 0 or 2)
    const yChin = p(INDICES.CHIN_BOTTOM).y;

    const xLeft = p(INDICES.FACE_LEFT).x;
    const xRight = p(INDICES.FACE_RIGHT).x;

    // Draw horizontal lines
    const drawHLine = (y: number) => {
        ctx.beginPath();
        ctx.moveTo(xLeft, y);
        ctx.lineTo(xRight, y);
        ctx.stroke();
    };

    // Thirds
    drawHLine(yForehead);
    drawHLine(yBrows);
    drawHLine(yNose);
    drawHLine(yChin);

    // 3. Draw Facial Fifths (Indigo Lines)
    // Vertical lines separating: Ear-Eye, Eye, Inter-eye, Eye, Eye-Ear
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)'; // Indigo-500
    ctx.setLineDash([2, 2]);

    const drawVLine = (x: number) => {
        ctx.beginPath();
        ctx.moveTo(x, yForehead);
        ctx.lineTo(x, yChin);
        ctx.stroke();
    };

    drawVLine(p(INDICES.FACE_LEFT).x);
    drawVLine(p(INDICES.EYE_RIGHT_OUTER).x);
    drawVLine(p(INDICES.EYE_RIGHT_INNER).x);
    drawVLine(p(INDICES.EYE_LEFT_INNER).x);
    drawVLine(p(INDICES.EYE_LEFT_OUTER).x);
    drawVLine(p(INDICES.FACE_RIGHT).x);

    // 4. Symmetry Line (Cyan)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)'; // Cyan-500
    ctx.lineWidth = 3;
    ctx.setLineDash([]); // Solid

    const top = p(INDICES.FOREHEAD_TOP);
    const bottom = p(INDICES.CHIN_BOTTOM);

    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.stroke();

    // 5. Highlights (Golden Ratio Points) - Orange dots
    ctx.fillStyle = 'rgba(249, 115, 22, 1)'; // Orange-500
    const drawDot = (idx: number) => {
        const pt = p(idx);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
        ctx.fill();
    };

    drawDot(INDICES.FOREHEAD_TOP);
    drawDot(INDICES.CHIN_BOTTOM);
    drawDot(INDICES.NOSE_TIP);
    drawDot(INDICES.EYE_LEFT_OUTER);
    drawDot(INDICES.EYE_RIGHT_OUTER);
    drawDot(61); // Mouth corners
    drawDot(291);
}
