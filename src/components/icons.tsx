import React from 'react';

export const Database = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
);

export const HubSpotIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.8 10.3c-.6 0-1.1.2-1.5.5L14.7 8c.1-.3.2-.6.2-1 0-1.7-1.3-3-3-3s-3 1.3-3 3c0 .4.1.7.2 1L6.6 10.8c-.4-.3-.9-.5-1.5-.5-1.7 0-3 1.3-3 3s1.3 3 3 3c1.3 0 2.4-.9 2.8-2.1l4.4.8c.1.7.5 1.3 1.1 1.6V20c0 1.1.9 2 2 2s2-.9 2-2v-4.1c.6-.4.9-1 1.1-1.6l4.4-.8c.4 1.2 1.5 2.1 2.8 2.1 1.7 0 3-1.3 3-3s-1.3-3.1-3-3.1zM5.1 14.8c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm6.8-9.3c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5z" />
  </svg>
);

export const SalesforceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.3 10c-.1-.1-.1-.2-.2-.2.1-.2.2-.4.2-.6 0-1.2-1-2.2-2.2-2.2-.3 0-.6.1-.9.2C14.7 5.7 13.3 4.7 11.7 4.7c-2.2 0-4 1.7-4.1 3.9-.7-.3-1.5-.3-2.1.2C4.5 9.5 4 10.7 4.2 12c-1.3.4-2.2 1.5-2.2 2.8 0 1.7 1.4 3.1 3.1 3.1h13.2c1.7 0 3.1-1.4 3.1-3.1s-1.4-3.1-3.3-4.8z" />
  </svg>
);

export const DynamicsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2L2 7l10 5 10-5-10-5zm0 10L2 17l10 5 10-5-10-5z" />
  </svg>
);
