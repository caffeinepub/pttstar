import React from 'react';

interface ColorPageHeaderProps {
  title: string;
  subtitle?: string;
  variant: 'landing' | 'connect' | 'ptt' | 'activity' | 'settings' | 'about';
  icon?: React.ReactNode;
}

export default function ColorPageHeader({ title, subtitle, variant, icon }: ColorPageHeaderProps) {
  // Neutral dark theme styling - no bright gradients
  return (
    <div className="relative mb-8 overflow-hidden rounded-lg border border-border bg-card p-6">
      <div className="relative z-10">
        {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
        <h1 className="mb-2 text-3xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
