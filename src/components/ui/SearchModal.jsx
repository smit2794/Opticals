import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';
import './SearchModal.css';

export default function SearchModal({ isOpen, onClose }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="search-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="search-modal__backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Content */}
          <motion.div
            className="search-modal__content"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="search-modal__header">
              <div className="search-modal__input-wrapper">
                <FiSearch className="search-modal__search-icon" />
                <input
                  ref={inputRef}
                  type="text"
                  className="search-modal__input"
                  placeholder="Search for eyewear, sunglasses, lenses..."
                />
              </div>
              <button className="search-modal__close" onClick={onClose} aria-label="Close search">
                <FiX />
              </button>
            </div>
            <div className="search-modal__hints">
              <span className="search-modal__hint-label">Popular:</span>
              <button className="search-modal__hint-tag" onClick={onClose}>Aviator</button>
              <button className="search-modal__hint-tag" onClick={onClose}>Titanium</button>
              <button className="search-modal__hint-tag" onClick={onClose}>Blue Light</button>
              <button className="search-modal__hint-tag" onClick={onClose}>Polarized</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
