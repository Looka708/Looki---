'use client';

import React, { useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  destructive?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdrop?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  destructive = false,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg-void/80 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Modal */}
      <div className={`
        relative glass-card w-full mx-4 ${sizeStyles[size]}
        animate-scale-in
      `}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-subtle">
            <h2 className="text-xl font-display font-semibold text-text-primary">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div className="mb-6">{children}</div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          {footer ? (
            footer
          ) : (
            <>
              <Button variant="ghost" onClick={onClose}>
                {cancelText}
              </Button>
              {onConfirm && (
                <Button
                  variant={destructive ? 'danger' : 'primary'}
                  onClick={onConfirm}
                >
                  {confirmText || 'Confirm'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  destructive?: boolean;
  requireConfirmation?: boolean;
  confirmationText?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  destructive = false,
  requireConfirmation = false,
  confirmationText,
}: ConfirmDialogProps) {
  const [confirmationInput, setConfirmationInput] = React.useState('');

  const isConfirmed =
    !requireConfirmation || confirmationInput === confirmationText;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      destructive={destructive}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={isConfirmed ? onConfirm : undefined}
      closeOnBackdrop={false}
    >
      <div className="space-y-4">
        <p className="text-text-secondary">{message}</p>
        {requireConfirmation && confirmationText && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Type <code className="bg-bg-overlay px-2 py-1 rounded">{confirmationText}</code> to
              confirm
            </label>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="Type confirmation text..."
              className="glass-input w-full"
              autoFocus
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'w-96',
    md: 'w-[480px]',
    lg: 'w-[600px]',
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg-void/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`
        relative ml-auto ${sizeStyles[size]}
        bg-bg-base border-l border-border-default
        flex flex-col animate-slide-in-right
        shadow-lg
      `}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-border-subtle sticky top-0 bg-bg-base/50 backdrop-blur-sm">
            <h2 className="text-lg font-display font-semibold text-text-primary">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-border-subtle p-6 sticky bottom-0 bg-bg-base/50 backdrop-blur-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
