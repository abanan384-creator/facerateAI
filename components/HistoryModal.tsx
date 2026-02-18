import React, { useEffect, useState } from 'react';
import { HistoryItem, getHistory, deleteScan, clearHistory } from '@/lib/history';
import { Trash2, X } from 'lucide-react';

interface HistoryModalProps {
    onClose: () => void;
    onSelectScan: (item: HistoryItem) => void;
}

export const HistoryModal = ({ onClose, onSelectScan }: HistoryModalProps) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const items = await getHistory();
            setHistory(items);
        } catch (error) {
            console.error("Failed to load history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this scan?')) {
            await deleteScan(id);
            await loadHistory();
        }
    };

    const handleClearAll = async () => {
        if (confirm('Are you sure you want to delete ALL history? This cannot be undone.')) {
            await clearHistory();
            await loadHistory();
        }
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text/60">
            <div className="bg-bg border border-text/10 w-full max-w-4xl max-h-[80vh] rounded-lg flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-text/10">
                    <h2 className="text-xl font-semibold tracking-tight text-primary">
                        Scan History
                    </h2>
                    <div className="flex items-center gap-4">
                        {history.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs text-text/40 hover:text-text uppercase tracking-widest font-bold px-3 py-1 rounded-md border border-text/10 hover:border-text/20 transition-opacity duration-150"
                            >
                                Clear All
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-text/5 rounded-md transition-opacity duration-150 text-text/30 hover:text-text"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-text/30 font-medium">
                            Loading history...
                        </div>
                    ) : history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-text/20 gap-4 py-16">
                            <div className="w-12 h-12 rounded-md border border-text/10 flex items-center justify-center">
                                <span className="text-lg text-text/15">—</span>
                            </div>
                            <p className="uppercase tracking-widest text-xs font-medium">No saved scans</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => onSelectScan(item)}
                                    className="group relative bg-surface border border-text/10 hover:border-primary/30 rounded-md overflow-hidden cursor-pointer transition-opacity duration-150"
                                >
                                    {/* Image Thumbnail */}
                                    <div className="aspect-square relative overflow-hidden bg-text/5">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.image}
                                            alt="Scan"
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Overlay Info */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-text/80 to-transparent">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] text-bg/50 uppercase tracking-wider mb-1 font-medium">
                                                        {formatDate(item.date)}
                                                    </p>
                                                    <span className="text-xs font-bold text-bg uppercase">
                                                        {item.type}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-bg tracking-tight">
                                                        {(item.result.overall / 10).toFixed(1)}
                                                    </div>
                                                    <div className="text-[9px] text-bg/50 uppercase tracking-widest font-medium">
                                                        Score
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete */}
                                    <button
                                        onClick={(e) => handleDelete(e, item.id)}
                                        className="absolute top-2 right-2 p-2 bg-bg/80 text-text/40 hover:text-text rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                        title="Delete Scan"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
