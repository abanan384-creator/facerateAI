"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ScanState, Mode, AnalysisScores, Warning } from '@/lib/state';

// Saved result per mode (only serializable data, no blob URLs)
interface SavedResult {
    scores: AnalysisScores;
    warnings: Warning[];
    previewUrl?: string; // kept only if it's a data URL (not a blob URL)
}

interface ScanContextType {
    state: ScanState;
    setState: React.Dispatch<React.SetStateAction<ScanState>>;
    savedResults: Record<Mode, SavedResult | null>;
    switchMode: (mode: Mode) => void;
    clearResult: (mode?: Mode) => void;
}

const INITIAL_STATE = (mode: Mode = 'front'): ScanState => ({
    status: 'idle',
    mode
});

const ScanContext = createContext<ScanContextType | undefined>(undefined);

const STORAGE_KEY = 'facerate_results_v2';

function loadSavedResults(): Record<Mode, SavedResult | null> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return {
                front: parsed.front ?? null,
                side: parsed.side ?? null,
            };
        }
    } catch (e) {
        console.error('Failed to load saved results', e);
    }
    return { front: null, side: null };
}

export function ScanProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<ScanState>(INITIAL_STATE('front'));
    const [savedResults, setSavedResults] = useState<Record<Mode, SavedResult | null>>({ front: null, side: null });
    const [isInitialized, setIsInitialized] = useState(false);

    // Load saved results on mount
    useEffect(() => {
        const results = loadSavedResults();
        setSavedResults(results);

        // Restore state for front mode if there's a saved result
        if (results.front) {
            setState({
                status: 'result',
                mode: 'front',
                previewUrl: results.front.previewUrl ?? '',
                scores: results.front.scores,
                warnings: results.front.warnings,
            });
        }
        setIsInitialized(true);
    }, []);

    // When state becomes 'result', save the result for the current mode
    useEffect(() => {
        if (!isInitialized) return;
        if (state.status === 'result') {
            const isDataUrl = state.previewUrl?.startsWith('data:');
            const newResult: SavedResult = {
                scores: state.scores,
                warnings: state.warnings,
                previewUrl: isDataUrl ? state.previewUrl : undefined,
            };
            setSavedResults(prev => {
                const updated = { ...prev, [state.mode]: newResult };
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                } catch (e) {
                    console.error('Failed to save results', e);
                }
                return updated;
            });
        }
    }, [state, isInitialized]);

    // Switch mode: restore saved result for that mode or go to idle
    const switchMode = useCallback((mode: Mode) => {
        setSavedResults(prev => {
            const saved = prev[mode];
            if (saved) {
                setState({
                    status: 'result',
                    mode,
                    previewUrl: saved.previewUrl ?? '',
                    scores: saved.scores,
                    warnings: saved.warnings,
                });
            } else {
                setState({ status: 'idle', mode });
            }
            return prev;
        });
    }, []);

    // Clear result for a mode (or current mode)
    const clearResult = useCallback((mode?: Mode) => {
        const targetMode = mode ?? state.mode;
        setSavedResults(prev => {
            const updated = { ...prev, [targetMode]: null };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {
                console.error('Failed to clear result', e);
            }
            return updated;
        });
        setState({ status: 'idle', mode: targetMode });
    }, [state.mode]);

    return (
        <ScanContext.Provider value={{ state, setState, savedResults, switchMode, clearResult }}>
            {children}
        </ScanContext.Provider>
    );
}

export function useScan() {
    const context = useContext(ScanContext);
    if (!context) throw new Error('useScan must be used within ScanProvider');
    return context;
}
