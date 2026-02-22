"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
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

export function ScanProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<ScanState>(INITIAL_STATE('front'));
    const [savedResults, setSavedResults] = useState<Record<Mode, ModePersistence | null>>({ front: null, side: null });

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
            return { ...prev, [targetMode]: null };
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
