import React, { useEffect, useState } from 'react';
import { HistoryItem, getHistory, deleteScan, clearHistory } from '@/lib/history';
import { Trash2, X, Calendar, User, UserPlus } from 'lucide-react';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl max-h-[80vh] rounded-3xl flex flex-col shadow-2xl relative">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-2xl font-thin tracking-wide text-white uppercase flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                        Scan History
                    </h2>
                    <div className="flex items-center gap-4">
                        {history.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs text-red-400 hover:text-red-300 uppercase tracking-widest font-bold px-3 py-1 rounded border border-red-500/20 hover:bg-red-500/10 transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            Loading history...
                        </div>
                    ) : history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 opacity-50">
                            <Calendar className="w-16 h-16 stroke-1" />
                            <p className="uppercase tracking-widest text-sm">No saved scans</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => onSelectScan(item)}
                                    className="group relative bg-white/5 border border-white/5 hover:border-cyan-400/50 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:-translate-y-1"
                                >
                                    {/* Image Thumbnail */}
                                    <div className="aspect-square relative overflow-hidden bg-black/50">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.image}
                                            alt="Scan"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

                                        {/* Overlay Stats */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                                                        {formatDate(item.date)}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        {item.type === 'front' ?
                                                            <User className="w-3 h-3 text-cyan-400" /> :
                                                            <UserPlus className="w-3 h-3 text-purple-400" />
                                                        }
                                                        <span className="text-xs font-bold text-white uppercase">
                                                            {item.type}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-light text-white tracking-tight">
                                                        {(item.result.overall / 10).toFixed(1)}
                                                    </div>
                                                    <div className="text-[9px] text-cyan-400 uppercase tracking-widest">
                                                        Score
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <button
                                        onClick={(e) => handleDelete(e, item.id)}
                                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500/80 text-white/70 hover:text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                                        title="Delete Scan"
                                    >
                                        <Trash2 className="w-4 h-4" />
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
