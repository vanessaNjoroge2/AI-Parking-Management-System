import React from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-border flex items-center justify-between rounded-t-3xl">
          {title && <h3 className="text-lg">{title}</h3>}
          <button
            onClick={onClose}
            className="ml-auto p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </>
  );
}
