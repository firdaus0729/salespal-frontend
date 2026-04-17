import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex gap-4">
                {variant === 'danger' && (
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                )}
                <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Are you sure?
                    </h4>
                    <p className="text-sm text-gray-500">
                        {message}
                    </p>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    {cancelText}
                </Button>
                <Button
                    variant={variant === 'danger' ? 'destructive' : 'primary'}
                    onClick={onConfirm}
                    isLoading={isLoading}
                >
                    {confirmText}
                </Button>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
