'use client';

import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export function GlassCard({
  children,
  hoverable = true,
  className = '',
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`
        glass-card
        ${hoverable ? 'hover:shadow-lg hover:border-strong' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4 pb-4 border-b border-border-subtle">
      <div>
        {title && <h3 className="text-lg font-display font-semibold text-text-primary">{title}</h3>}
        {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardBody({ children, className = '', ...props }: CardBodyProps) {
  return <div className={`space-y-4 ${className}`} {...props}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return <div className={`flex justify-end gap-2 pt-4 border-t border-border-subtle ${className}`}>{children}</div>;
}
