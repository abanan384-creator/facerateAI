
/**
 * Image Quality Analysis
 * Computes brightness (mean luma), contrast (stddev luma),
 * and sharpness (laplacian variance approximation).
 */
export interface QualityMetrics {
    brightness: number;
    contrast: number;
    sharpness: number;
}


export function getQualityMetrics(img: HTMLImageElement): QualityMetrics {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return { brightness: 0, contrast: 0, sharpness: 0 };

    // Resize for performance (keeping aspect ratio)
    const MAX_WIDTH = 512;
    const scale = Math.min(1, MAX_WIDTH / img.naturalWidth);
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let sum = 0;
    let serveral = 0;
    const lumaData: number[] = [];

    // Calculate Brightness (Mean Luma)
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Rec. 601 luma formula
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        lumaData.push(luma);
        sum += luma;
    }

    const brightness = sum / lumaData.length;

    // Calculate Contrast (Standard Deviation of Luma)
    let sumSqDiff = 0;
    for (let i = 0; i < lumaData.length; i++) {
        sumSqDiff += Math.pow(lumaData[i] - brightness, 2);
    }
    const variance = sumSqDiff / lumaData.length;
    const contrast = Math.sqrt(variance);

    // Calculate Sharpness (Laplacian Variance Approximation)
    // Using a simplified edge detection kernel
    //  0  1  0
    //  1 -4  1
    //  0  1  0
    const w = canvas.width;
    const h = canvas.height;
    let edgeSum = 0;
    let edgeSumSq = 0;
    let edgeCount = 0;

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const i = (y * w + x);
            const val = lumaData[i];

            // Neighbors: top, bottom, left, right
            const top = lumaData[((y - 1) * w + x)];
            const bottom = lumaData[((y + 1) * w + x)];
            const left = lumaData[(y * w + (x - 1))];
            const right = lumaData[(y * w + (x + 1))];

            const laplacian = top + bottom + left + right - 4 * val;
            edgeSum += laplacian;
            edgeSumSq += laplacian * laplacian;
            edgeCount++;
        }
    }


    const meanLaplacian = edgeSum / edgeCount;
    const varianceLaplacian = (edgeSumSq / edgeCount) - (meanLaplacian * meanLaplacian);

    // Scale sharpness to roughly match expected range (0-250+) 
    // Laplacian variance tends to be smaller, so we boost it
    const sharpness = Math.sqrt(varianceLaplacian) * 2;

    return {
        brightness: brightness, // 0-255
        contrast: contrast,     // 0-128 appx
        sharpness: sharpness    // 0-300+ appx
    };
}

/**
 * Skin Analysis
 * Multi-factor analysis:
 * 1. Texture smoothness (variance)
 * 2. Skin tone evenness (color uniformity)
 * 3. Pore visibility (high-frequency details)
 * 4. Wrinkles (gradient analysis)
 * 5. Blemishes/Acne (color anomalies)
 */
export function analyzeSkin(
    img: HTMLImageElement,
    landmarks: { x: number; y: number }[]
): number {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || !landmarks || landmarks.length === 0) return 70; // Fallback

    const MAX_DIM = 1000;
    const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));

    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Helpers to access landmarks (scaled)
    const getPoint = (idx: number) => ({
        x: landmarks[idx].x * scale,
        y: landmarks[idx].y * scale
    });

    // Regions: Left Cheek (117), Right Cheek (346), Forehead (151)
    const regionIndices = [117, 346, 151];

    const patchSize = Math.max(16, Math.floor(canvas.width * 0.04));
    const half = patchSize / 2;

    // Storage for multi-factor analysis
    const textureVariances: number[] = [];
    const colorStdDevs: number[] = [];
    const poreScores: number[] = [];
    const patches: ImageData[] = [];

    // Extract patches from skin regions
    for (const idx of regionIndices) {
        const center = getPoint(idx);

        const offsets = [
            { dx: 0, dy: 0 },
            { dx: -half, dy: -half },
            { dx: half, dy: -half },
            { dx: -half, dy: half },
            { dx: half, dy: half }
        ];

        for (const o of offsets) {
            const x = Math.floor(center.x + o.dx - half / 2);
            const y = Math.floor(center.y + o.dy - half / 2);
            const w = Math.floor(half);
            const h = Math.floor(half);

            if (x < 0 || y < 0 || x + w > canvas.width || y + h > canvas.height) continue;

            const data = ctx.getImageData(x, y, w, h);
            patches.push(data);

            // 1. Texture Analysis (Luma Variance)
            let lumaSum = 0, lumaSqSum = 0, n = 0;
            let rSum = 0, gSum = 0, bSum = 0;

            for (let i = 0; i < data.data.length; i += 4) {
                const r = data.data[i];
                const g = data.data[i + 1];
                const b = data.data[i + 2];
                const luma = 0.299 * r + 0.587 * g + 0.114 * b;

                lumaSum += luma;
                lumaSqSum += luma * luma;
                rSum += r;
                gSum += g;
                bSum += b;
                n++;
            }

            if (n > 10) {
                // Texture smoothness
                const lumaMean = lumaSum / n;
                const textureVariance = (lumaSqSum / n) - (lumaMean * lumaMean);
                textureVariances.push(textureVariance);

                // 2. Color Uniformity (RGB standard deviation)
                const rMean = rSum / n;
                const gMean = gSum / n;
                const bMean = bSum / n;

                let rSqDiff = 0, gSqDiff = 0, bSqDiff = 0;
                for (let i = 0; i < data.data.length; i += 4) {
                    rSqDiff += Math.pow(data.data[i] - rMean, 2);
                    gSqDiff += Math.pow(data.data[i + 1] - gMean, 2);
                    bSqDiff += Math.pow(data.data[i + 2] - bMean, 2);
                }

                const colorStdDev = Math.sqrt((rSqDiff + gSqDiff + bSqDiff) / (n * 3));
                colorStdDevs.push(colorStdDev);

                // 3. Pore Analysis (High-frequency detail detection)
                // Calculate local gradients to detect fine details (pores)
                let gradientSum = 0;
                const pw = w;
                for (let py = 1; py < h - 1; py++) {
                    for (let px = 1; px < pw - 1; px++) {
                        const idx = (py * pw + px) * 4;
                        const luma = 0.299 * data.data[idx] + 0.587 * data.data[idx + 1] + 0.114 * data.data[idx + 2];

                        const lumaRight = 0.299 * data.data[idx + 4] + 0.587 * data.data[idx + 5] + 0.114 * data.data[idx + 6];
                        const lumaDown = 0.299 * data.data[idx + pw * 4] + 0.587 * data.data[idx + pw * 4 + 1] + 0.114 * data.data[idx + pw * 4 + 2];

                        const gradX = Math.abs(lumaRight - luma);
                        const gradY = Math.abs(lumaDown - luma);
                        gradientSum += Math.sqrt(gradX * gradX + gradY * gradY);
                    }
                }
                const avgGradient = gradientSum / ((w - 2) * (h - 2));
                poreScores.push(avgGradient);
            }
        }
    }

    if (textureVariances.length === 0) return 70;

    // Calculate median scores for robustness
    textureVariances.sort((a, b) => a - b);
    colorStdDevs.sort((a, b) => a - b);
    poreScores.sort((a, b) => a - b);

    const medianTexture = textureVariances[Math.floor(textureVariances.length / 2)];
    const medianColor = colorStdDevs[Math.floor(colorStdDevs.length / 2)];
    const medianPores = poreScores[Math.floor(poreScores.length / 2)];

    // 1. Texture Score (smoothness)
    // Perfect flat: stdDev ~1-2, Good skin: ~5-8, Textured: ~10-15, Bad: >15
    const textureStdDev = Math.sqrt(medianTexture);
    const textureScore = Math.max(0, Math.min(100, 100 - (textureStdDev * 1.5)));

    // 2. Color Uniformity Score
    // Even skin tone: stdDev ~5-10, Uneven/redness: ~15-25, Very uneven: >30
    const colorScore = Math.max(0, Math.min(100, 100 - (medianColor * 3)));

    // 3. Pore Score (inverse of gradient - less gradient = smoother)
    // Low gradients (smooth): 2-5, Visible pores: 8-15, Very visible: >20
    const poreScore = Math.max(0, Math.min(100, 100 - (medianPores * 4)));

    // 4. Redness/Blemish Detection (Check for red-shifted pixels)
    let rednessScore = 100;
    for (const data of patches) {
        let redShiftCount = 0;
        let totalPixels = 0;

        for (let i = 0; i < data.data.length; i += 4) {
            const r = data.data[i];
            const g = data.data[i + 1];
            const b = data.data[i + 2];

            // Detect redness: R significantly higher than G and B
            if (r > g + 15 && r > b + 15) {
                redShiftCount++;
            }
            totalPixels++;
        }

        const redRatio = redShiftCount / totalPixels;
        // Penalize if more than 10% of pixels are red-shifted
        if (redRatio > 0.1) {
            rednessScore -= (redRatio - 0.1) * 500; // Harsh penalty
        }
    }
    rednessScore = Math.max(0, rednessScore);

    // Final Weighted Score
    // Texture: 30%, Color: 25%, Pores: 20%, Redness: 25%
    const finalScore = (
        textureScore * 0.30 +
        colorScore * 0.25 +
        poreScore * 0.20 +
        rednessScore * 0.25
    );

    return Math.max(0, Math.min(100, finalScore));
}
