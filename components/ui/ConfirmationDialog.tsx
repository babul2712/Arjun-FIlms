import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative max-w-md w-full bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xl p-6 text-[13px]">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {isDestructive && (
              <div className="p-2 bg-rose-100 text-rose-600 rounded-full">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-base font-bold text-gray-800">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-500 font-semibold mb-6">
          {message}
        </p>
        
        <div className="flex justify-end gap-3 font-bold">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 rounded-xl text-white transition-colors cursor-pointer font-bold ${
              isDestructive 
                ? 'bg-rose-600 hover:bg-rose-700 shadow-md' 
                : 'bg-[#0066fe] hover:bg-blue-600 shadow-md shadow-blue-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
