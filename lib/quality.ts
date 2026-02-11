
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
