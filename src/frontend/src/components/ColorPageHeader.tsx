import React from 'react';

interface ColorPageHeaderProps {
  title: string;
  subtitle?: string;
  variant: 'landing' | 'connect' | 'ptt' | 'activity' | 'settings' | 'about' | 'directory';
  icon?: React.ReactNode;
}

export default function ColorPageHeader({ title, subtitle, variant, icon }: ColorPageHeaderProps) {
  // Compact console-style header
  return (
    <div className="console-panel mb-6 p-4 shadow-console">
      <div className="flex items-center gap-3">
        {icon && <div className="text-primary">{icon}</div>}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
