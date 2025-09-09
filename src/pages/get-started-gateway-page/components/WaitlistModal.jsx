import React from 'react';
import WaitlistForm from '../../aes-crm-marketing-landing-page/components/WaitlistForm';

const WaitlistModal = ({ isOpen, onClose }) => {
  return (
    <WaitlistForm 
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default WaitlistModal;