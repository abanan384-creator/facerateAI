"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ScanState, Mode, AnalysisScores, Warning } from '@/lib/state';

// Persistent data per mode
interface ModePersistence {
    status: ScanState['status'];
    previewUrl?: string;
    scores?: AnalysisScores;
    warnings?: Warning[];
}

interface ScanContextType {
    state: ScanState;
    setState: React.Dispatch<React.SetStateAction<ScanState>>;
    savedResults: Record<Mode, ModePersistence | null>;
    switchMode: (mode: Mode) => void;
    clearResult: (mode?: Mode) => void;
}

const INITIAL_STATE = (mode: Mode = 'front'): ScanState => ({
    status: 'idle',
    mode
});

const ScanContext = createContext<ScanContextType | undefined>(undefined);

const STORAGE_KEY = 'facerate_session_v3';

function loadSavedData(): Record<Mode, ModePersistence | null> {
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
    const [savedResults, setSavedResults] = useState<Record<Mode, ModePersistence | null>>({ front: null, side: null });
    const [isInitialized, setIsInitialized] = useState(false);

    // Load saved results on mount
    useEffect(() => {
        const results = loadSavedData();
        setSavedResults(results);

        // Restore state for front mode if available
        if (results.front) {
            setState({
                ...INITIAL_STATE('front'),
                ...results.front,
                mode: 'front'
            } as ScanState);
        }
        setIsInitialized(true);
    }, []);

    // Persist changes whenever state changes
    useEffect(() => {
        if (!isInitialized) return;

        // Determine what to save for the current mode
        const toSave: ModePersistence = {
            status: state.status,
            previewUrl: state.previewUrl?.startsWith('data:') ? state.previewUrl : undefined,
            warnings: (state as any).warnings,
            scores: (state as any).scores,
        };

        setSavedResults(prev => {
            const updated = { ...prev, [state.mode]: toSave };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (e) {
                console.warn('Storage limit might be exceeded', e);
                // If it fails, we still keep it in memory
            }
            return updated;
        });
    }, [state, isInitialized]);

    // Switch mode: restore saved data for that mode or go to idle
    const switchMode = useCallback((mode: Mode) => {
        setSavedResults(prev => {
            const saved = prev[mode];
            if (saved && (saved.previewUrl || saved.status === 'result')) {
                setState({
                    ...INITIAL_STATE(mode),
                    ...saved,
                    mode
                } as ScanState);
            } else {
                setState(INITIAL_STATE(mode));
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
        setState(INITIAL_STATE(targetMode));
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
