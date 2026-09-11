import React from 'react';
import { AlertCircle, MailCheck, X } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  note = 'The student will be notified via email.',
  confirmText = 'Confirm Update',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary-900/60 backdrop-blur-xs transition-opacity"
        onClick={onCancel}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-bg-surface rounded-2xl shadow-2xl border border-border-subtle p-6 space-y-4 z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-info-100 text-info-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-text-primary">
                {title}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">{message}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Note Box */}
        {note && (
          <div className="p-3 bg-bg-base border border-border-subtle rounded-xl flex items-center space-x-2 text-xs text-text-secondary">
            <MailCheck className="w-4 h-4 text-primary-500 shrink-0" />
            <span>{note}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary border border-border-subtle rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 bg-primary-900 hover:bg-primary-700 text-white font-heading font-semibold text-xs rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
