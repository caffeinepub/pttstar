import React from 'react';

interface ColorAccentPanelProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export default function ColorAccentPanel({ children, variant = 'primary', className = '' }: ColorAccentPanelProps) {
  // Console-style panel
  return (
    <div className={`console-panel ${className}`}>
      {children}
    </div>
  );
}
