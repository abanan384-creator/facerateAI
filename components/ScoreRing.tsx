
import React, { useState } from 'react';
import { AnalysisScores, Mode } from '@/lib/state';

interface ScoreRingProps {
    scores: AnalysisScores;
    mode: Mode;
}

// --- Referral links per metric per zone ---
const REFERRAL_LINKS: Record<string, { red: string; yellow: string; green: string; label: string }> = {
    jawline: {
        label: 'Jawline',
        red: 'https://www.amazon.com/s?k=mastic+gum+jawline+exercise',
        yellow: 'https://www.amazon.com/s?k=jawline+exerciser+chewing+gum',
        green: 'https://www.amazon.com/s?k=facial+massage+roller',
    },
    cheekbones: {
        label: 'Cheekbones',
        red: 'https://www.amazon.com/s?k=gua+sha+facial+tool+cheekbones',
        yellow: 'https://www.amazon.com/s?k=face+slimming+roller',
        green: 'https://www.amazon.com/s?k=vitamin+c+serum+face',
    },
    masculinity: {
        label: 'Masculinity',
        red: 'https://www.amazon.com/s?k=testosterone+booster+zinc+supplement',
        yellow: 'https://www.amazon.com/s?k=beard+growth+serum',
        green: 'https://www.amazon.com/s?k=face+moisturizer+men',
    },
    eyes: {
        label: 'Eyes',
        red: 'https://www.amazon.com/s?k=under+eye+cream+retinol',
        yellow: 'https://www.amazon.com/s?k=eye+bag+cream+caffeine',
        green: 'https://www.amazon.com/s?k=eye+cream+men',
    },
    facial_thirds: {
        label: 'Facial Thirds',
        red: 'https://www.amazon.com/s?k=mewing+guide+book',
        yellow: 'https://www.amazon.com/s?k=facial+roller+massager',
        green: 'https://www.amazon.com/s?k=collagen+peptides',
    },
    nose: {
        label: 'Nose',
        red: 'https://www.amazon.com/s?k=nose+shaping+clip',
        yellow: 'https://www.amazon.com/s?k=blackhead+remover+nose',
        green: 'https://www.amazon.com/s?k=sunscreen+for+face',
    },
    forehead: {
        label: 'Forehead',
        red: 'https://www.amazon.com/s?k=forehead+wrinkle+patches',
        yellow: 'https://www.amazon.com/s?k=retinol+serum+forehead',
        green: 'https://www.amazon.com/s?k=moisturizing+face+mask',
    },
    symmetry: {
        label: 'Symmetry',
        red: 'https://www.amazon.com/s?k=facial+asymmetry+exercise+tool',
        yellow: 'https://www.amazon.com/s?k=face+yoga+book',
        green: 'https://www.amazon.com/s?k=jade+roller+and+gua+sha+set',
    },
    harmony: {
        label: 'Harmony',
        red: 'https://www.amazon.com/s?k=full+face+sculpting+kit',
        yellow: 'https://www.amazon.com/s?k=facial+fitness+device',
        green: 'https://www.amazon.com/s?k=luxury+skincare+set',
    },
};

const METRICS: (keyof typeof REFERRAL_LINKS)[] = [
    'jawline', 'cheekbones', 'masculinity', 'eyes', 'facial_thirds',
    'nose', 'forehead', 'symmetry', 'harmony'
];

function getColor(value: number): 'green' | 'yellow' | 'red' {
    if (value >= 65) return 'green';
    if (value >= 50) return 'yellow';
    return 'red';
}

const COLOR_HEX: Record<string, string> = {
    green: '#4caf50',
    yellow: '#f5c518',
    red: '#e53935',
};

const COLOR_LABEL: Record<string, string> = {
    green: 'Good',
    yellow: 'Average',
    red: 'Needs Work',
};

const COLOR_BG: Record<string, string> = {
    green: 'rgba(76,175,80,0.08)',
    yellow: 'rgba(245,197,24,0.08)',
    red: 'rgba(229,57,53,0.08)',
};

const COLOR_BORDER: Record<string, string> = {
    green: 'rgba(76,175,80,0.2)',
    yellow: 'rgba(245,197,24,0.2)',
    red: 'rgba(229,57,53,0.2)',
};

// SVG Donut Ring
function DonutRing({ segments }: { segments: { color: string; count: number }[] }) {
    const size = 200;
    const strokeWidth = 22;
    const cx = size / 2;
    const cy = size / 2;
    const r = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;
    const gap = 6; // gap in px between segments
    const total = segments.length;

    const segmentLength = (circumference - gap * total) / total;

    // Build stroke-dasharray/offset for each metric
    let offset = 0;
    const arcs = segments.map((s, i) => {
        const dashOffset = circumference - offset;
        const piece = { offset: dashOffset, color: segments[i].color, segLen: segmentLength };
        offset += segmentLength + gap;
        return piece;
    });

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="rotate-[-90deg]"
        >
            {/* Background ring */}
            <circle
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke="rgba(0,0,0,0.06)"
                strokeWidth={strokeWidth}
            />
            {arcs.map((arc, i) => (
                <circle
                    key={i}
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${arc.segLen} ${circumference}`}
                    strokeDashoffset={arc.offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke 0.5s ease' }}
                />
            ))}
        </svg>
    );
}

// A single row in the legend below the ring
function ZoneRow({ color, metrics }: { color: 'green' | 'yellow' | 'red'; metrics: (keyof typeof REFERRAL_LINKS)[] }) {
    const [open, setOpen] = useState(false);
    if (metrics.length === 0) return null;

    return (
        <div className="mb-2 last:mb-0">
            {/* Main row */}
            <div
                className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer group"
                style={{ background: COLOR_BG[color], border: `1px solid ${COLOR_BORDER[color]}` }}
                onClick={() => setOpen(!open)}
            >
                {/* Color dot */}
                <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: COLOR_HEX[color] }}
                />
                {/* Label + count */}
                <span className="text-[11px] font-semibold text-text/70 tracking-wide flex-1">
                    {COLOR_LABEL[color]}
                </span>
                <span
                    className="text-[13px] font-bold"
                    style={{ color: COLOR_HEX[color] }}
                >
                    {metrics.length}
                </span>
                {/* Arrow */}
                <span
                    className="text-[10px] font-bold ml-1 transition-transform duration-200"
                    style={{
                        color: COLOR_HEX[color],
                        display: 'inline-block',
                        transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                >
                    ›
                </span>
            </div>

            {/* Expandable links */}
            {open && (
                <div className="mt-1 ml-6 space-y-1">
                    {metrics.map((m) => {
                        const zone = color;
                        const href = REFERRAL_LINKS[m][zone];
                        return (
                            <a
                                key={m}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[10px] text-text/50 hover:text-primary transition-colors duration-150 group/link"
                            >
                                <span className="text-text/20 group-hover/link:text-primary">→</span>
                                <span>{REFERRAL_LINKS[m].label}</span>
                                <span className="text-text/25 text-[9px]">— shop products</span>
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export const ScoreRing = ({ scores, mode }: ScoreRingProps) => {
    const activeMetrics = mode === 'side' ? METRICS.filter(m => m !== 'symmetry') : METRICS;

    const segmentColors = activeMetrics.map((m) => {
        const val = scores[m as keyof AnalysisScores] as number;
        return { metric: m, color: getColor(val), hex: COLOR_HEX[getColor(val)] };
    });

    const grouped: Record<'green' | 'yellow' | 'red', (keyof typeof REFERRAL_LINKS)[]> = {
        green: [],
        yellow: [],
        red: [],
    };
    segmentColors.forEach(s => grouped[s.color].push(s.metric));

    return (
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
            {/* Ring */}
            <div className="relative" style={{ width: 200, height: 200 }}>
                <DonutRing segments={segmentColors.map(s => ({ color: s.hex, count: 1 }))} />
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-primary tracking-tight">
                        {(scores.overall / 10).toFixed(1)}
                    </span>
                    <span className="text-[9px] text-text/35 uppercase tracking-[0.25em] font-semibold mt-0.5">
                        Overall
                    </span>
                </div>
            </div>

            {/* Legend with referral links */}
            <div className="w-full">
                <ZoneRow color="green" metrics={grouped.green} />
                <ZoneRow color="yellow" metrics={grouped.yellow} />
                <ZoneRow color="red" metrics={grouped.red} />
            </div>
        </div>
    );
};
