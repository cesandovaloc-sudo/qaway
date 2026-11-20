import React from 'react';
import UpdatePasswordCard from '../../../../../components/auth/UpdatePasswordCard';
import { supabase } from '../services/supabaseClient';

interface CambiarContrasenaModalProps {
  open: boolean;
  onSuccess: () => void;
}

export const CambiarContrasenaModal: React.FC<CambiarContrasenaModalProps> = ({ open, onSuccess }) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <UpdatePasswordCard
        supabaseClient={supabase}
        onSuccess={onSuccess}
      />
    </div>
  );
};

export default CambiarContrasenaModal;
