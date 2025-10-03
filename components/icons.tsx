
import React from 'react';

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const PowerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
  </svg>
);

export const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.648c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
  </svg>
);

export const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 00-.75.75v12c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75v-12a.75.75 0 00-.75-.75H6.75zm8.25 0a.75.75 0 00-.75.75v12c0 .414.336.75.75.75h2.25a.75.75 0 00.75-.75v-12a.75.75 0 00-.75-.75h-2.25z" clipRule="evenodd" />
  </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.315 7.584C10.866 6.33 13.134 6.33 14.685 7.584l.795.645a.75.75 0 001.252-.638V5.013c0-1.126-1.227-1.88-2.18-1.252L12.92 5.013a.75.75 0 01-1.052 0l-1.638-1.252C9.273 3.133 8 3.887 8 5.013v2.578a.75.75 0 001.252.638l.063-.051zM5.013 8a.75.75 0 00-1.252-.638L2.509 8.614c-.953.628-2.18.126-2.18-1.252V5.013a.75.75 0 01.75-.75h2.578a.75.75 0 00.638-1.252L6.386 2.51c.628-.953 1.88-1.227 3.006-1.227s2.378.274 3.006 1.226l1.252 1.638a.75.75 0 00.638 1.252h2.578a.75.75 0 01.75.75v2.348c0 1.378-1.227 1.88-2.18 1.252l-1.252-1.638a.75.75 0 00-1.252.638v.063c1.551 1.254 1.551 3.522 0 4.776l-.063.051a.75.75 0 00-.638 1.252v2.578c0 1.126 1.227 1.88 2.18 1.252l1.638-1.252a.75.75 0 011.052 0l1.638 1.252c.953.628 2.18.126 2.18-1.252v-2.348a.75.75 0 01.75-.75h-.001a.75.75 0 010 1.5H21a2.25 2.25 0 00-2.25-2.25h-2.578a.75.75 0 00-.638 1.252l-1.252 1.638c-.628.953-1.88 1.227-3.006 1.227s-2.378-.274-3.006-1.226l-1.252-1.638a.75.75 0 00-.638-1.252H5.25A2.25 2.25 0 003 15.75h.001a.75.75 0 010-1.5H3a.75.75 0 01-.75-.75v-2.348c0-1.378 1.227-1.88 2.18-1.252l1.252 1.638a.75.75 0 001.252-.638v-.063c-1.551-1.254-1.551-3.522 0-4.776z" clipRule="evenodd" />
  </svg>
);

export const WalletIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75A2.25 2.25 0 0015.75 1.5h-2.25a.75.75 0 000 1.5h2.25a.75.75 0 01.75.75v16.5a.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3.75a.75.75 0 01.75-.75h2.25a.75.75 0 000-1.5z" />
      <path d="M10.875 12a.375.375 0 00.375.375h1.5a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-1.5a.375.375 0 00-.375.375v1.5z" />
    </svg>
);

export const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 3a.75.75 0 00-.75.75v16.5a.75.75 0 00.75.75h18a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75H3zm9.75 4.125a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V7.125zm-4.5 3.75a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zm9-2.25a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0V8.625z" clipRule="evenodd" />
    </svg>
);

export const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
    </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
);
