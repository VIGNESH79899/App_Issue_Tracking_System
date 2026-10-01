import React from 'react';
import { surfaces, typography } from './designSystem';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'subtle' | 'dark';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  footer,
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const surfaceClass =
    variant === 'subtle'
      ? surfaces.panelSubtle
      : variant === 'dark'
        ? surfaces.panelDark
        : surfaces.panel;

  return (
    <div className={`${surfaceClass} ${className}`} {...props}>
      {(title || headerAction) && (
        <div className={surfaces.cardHeader}>
          <div>
            {typeof title === 'string' ? (
              <h3 className={typography.cardTitle}>{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className={typography.mutedText}>{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={surfaces.cardBody}>{children}</div>
      {footer && <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 rounded-b-lg">{footer}</div>}
    </div>
  );
};
