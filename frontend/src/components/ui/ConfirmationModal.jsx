import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", isDestructive = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl border border-zinc-100 max-w-sm w-full overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-start">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-600'}`}>
                            <AlertTriangle size={20} />
                        </div>
                        <div className="ml-4 flex-1">
                            <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
                            <p className="mt-1 text-sm text-zinc-500">{message}</p>
                        </div>
                        <button onClick={onClose} className="ml-auto text-zinc-400 hover:text-zinc-600">
                            <X size={16} />
                        </button>
                    </div>
                </div>
                <div className="bg-zinc-50/50 px-6 py-4 flex justify-end gap-3 border-t border-zinc-100">
                    <button
                        onClick={onClose}
                        className="px-3 py-2 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors shadow-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-3 py-2 text-xs font-medium text-white rounded-lg shadow-sm transition-colors ${isDestructive
                                ? 'bg-red-600 hover:bg-red-700 border border-red-700'
                                : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-900'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
