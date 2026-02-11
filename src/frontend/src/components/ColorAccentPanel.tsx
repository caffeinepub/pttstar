import React from 'react';

interface ColorAccentPanelProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export default function ColorAccentPanel({ children, variant = 'primary', className = '' }: ColorAccentPanelProps) {
  // Neutral dark theme styling - subtle container without bright colors
  return (
    <div className={`rounded-lg border border-border bg-card/50 ${className}`}>
      {children}
    </div>
  );
}
