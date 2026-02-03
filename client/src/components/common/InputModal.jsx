import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import './ConfirmModal.css';

const InputModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '',
  message = '',
  placeholder = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  required = false
}) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setValue('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (required && !value.trim()) return;
    onConfirm(value);
    setValue('');
  }, [value, required, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal input-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
        <h3 className="confirm-modal-title">{title}</h3>
        {message && <p className="confirm-modal-message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            className="input-modal-textarea"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
          <div className="confirm-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {cancelText}
            </button>
            <button 
              type="submit" 
              className="btn-confirm info"
              disabled={required && !value.trim()}
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

InputModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  placeholder: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  required: PropTypes.bool,
};

export default InputModal;
