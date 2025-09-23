import React from 'react';

interface SectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeader({ children, className = '' }: SectionHeaderProps) {
  return (
    <h3 className={`settings-section ${className}`}>
      {children}
    </h3>
  );
}