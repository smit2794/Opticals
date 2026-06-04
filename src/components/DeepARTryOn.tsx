// src/components/DeepARTryOn.tsx

import React, { useState } from 'react';
import { FiEye } from 'react-icons/fi';
import { VirtualTryOnModal } from './VirtualTryOnModal';
import '../styles/VirtualTryOn.css';

interface DeepARTryOnProps {
  productName: string;
  effectUrl?: string;
}

export const DeepARTryOn: React.FC<DeepARTryOnProps> = ({
  productName,
  effectUrl,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fallback to aviator demo filter if not provided
  const fallbackEffect = 'https://cdn.jsdelivr.net/npm/deepar/effects/aviators';
  const finalEffectUrl = effectUrl && effectUrl.trim() !== '' ? effectUrl : fallbackEffect;

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="tryon-container-wrapper">
      <button
        onClick={handleOpen}
        className="product-tryon-btn"
        aria-label={`Virtual Try-On for ${productName}`}
      >
        <FiEye />
        <span>Virtual Try-On</span>
      </button>

      <VirtualTryOnModal
        isOpen={isModalOpen}
        onClose={handleClose}
        productName={productName}
        effectUrl={finalEffectUrl}
      />
    </div>
  );
};

export default DeepARTryOn;
