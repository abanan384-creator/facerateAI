"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScanState, Mode } from '@/lib/state';

interface ScanContextType {
    state: ScanState;
    setState: React.Dispatch<React.SetStateAction<ScanState>>;
}

const INITIAL_STATE = (mode: Mode = 'front'): ScanState => ({
    status: 'idle',
    mode
});

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<ScanState>(INITIAL_STATE('front'));
    const [isInitialized, setIsInitialized] = useState(false);

    // Persistence logic
    useEffect(() => {
        const saved = localStorage.getItem('facerate_session');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // We only restore if it was a meaningful state
                if (parsed.previewUrl || parsed.status === 'result') {
                    setState(parsed);
                }
            } catch (e) {
                console.error("Failed to restore session", e);
            }
        }
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('facerate_session', JSON.stringify(state));
        }
    }, [state, isInitialized]);

    return (
        <ScanContext.Provider value={{ state, setState }}>
            {children}
        </ScanContext.Provider>
    );
}

export function useScan() {
    const context = useContext(ScanContext);
    if (!context) throw new Error('useScan must be used within ScanProvider');
    return context;
}
