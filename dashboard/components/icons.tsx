"use client";

import { CSSProperties, HTMLAttributes } from 'react';
import React from 'react';

type IconProps = {
  size?: number;
  className?: string;
  style?: CSSProperties;
} & HTMLAttributes<SVGElement>;

export const ShieldIcon = ({ size = 22, className = '', style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-label="Shield"
  >
    <path d="M12 3l9 4v6c0 5-3.5 9-9 8-5.5 1-9-3-9-8V7l9-4z" />
  </svg>
);

export const TrashIcon = ({ size = 22, className = '', style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-label="Trash"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

export const BanIcon = ({ size = 22, className = '', style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-label="Ban"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M4.5 4.5l15 15" />
  </svg>
);

export const KickIcon = ({ size = 22, className = '', style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-label="Kick"
  >
    <path d="M4 16l6-3 4-9 6 9-7 3-3 7-6-7z" />
  </svg>
);

export const MuteIcon = ({ size = 22, className = '', style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-label="Mute"
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="1" x2="1" y2="23" />
  </svg>
);

export const ClipboardIcon = ({ size = 22, className = '', style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-label="Clipboard"
  >
    <path d="M9 5V3h6v2" />
    <rect x="7" y="5" width="10" height="14" rx="2" />
    <path d="M9 9h6" />
  </svg>
);
