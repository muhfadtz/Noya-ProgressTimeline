
import React from 'react';

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

type IconName = 'home' | 'plus' | 'user' | 'sun' | 'moon' | 'arrowLeft' | 'logout' | 'settings' | 'check' | 'clock' | 'logo' | 'folder' | 'google' | 'pin' | 'pinFilled' | 'edit' | 'trash';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

const Icon: React.FC<IconProps> = ({ name, className, ...props }) => {
  const iconProps = {
    className: cn("h-6 w-6", className),
    ...props,
  };

  const icons: Record<IconName, React.ReactElement> = {
    edit: (
        <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    trash: (
        <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
    ),
    google: (
      <svg {...iconProps} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.818 10.1819H21V10H12V14H17.5455C17.2182 15.4545 16.1091 16.6364 14.6364 17.4545V19.7273H17.0909C19.1818 17.7273 20.5 15.0909 20.5 12.1819C20.5 11.4545 20.4455 10.7727 20.3455 10.1819H21.818Z" fill="#4285F4"/>
          <path d="M12 22C15.2727 22 18.0455 20.9545 20 19.0909L17.0909 16.8182C16.0455 17.5455 14.3182 18.2727 12 18.2727C9 18.2727 6.45455 16.5455 5.5 14H2.5V16.3636C4 19.7273 7.72727 22 12 22Z" fill="#34A853"/>
          <path d="M5.5 14C5.27273 13.4545 5.13636 12.7727 5.13636 12C5.13636 11.2273 5.27273 10.5455 5.5 10V7.63636H2.5C1.63636 9.18182 1 10.5455 1 12C1 13.4545 1.63636 14.8182 2.5 16.3636L5.5 14Z" fill="#FBBC05"/>
          <path d="M12 5.72727C13.6364 5.72727 15 6.36364 16.0909 7.36364L18.8636 4.59091C16.9545 2.81818 14.6818 2 12 2C7.72727 2 4 4.36364 2.5 7.63636L5.5 10C6.45455 7.45455 9 5.72727 12 5.72727Z" fill="#EA4335"/>
      </svg>
    ),
    logo: (
      <svg
    {...iconProps}
    viewBox="0 0 56 44"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Noya Logo"
    role="img"
  >
    <title>Noya Logo</title>

    {/* Badan tengah (hijau/primary) */}
    <ellipse
      cx="28"
      cy="22"
      rx="4.5"
      ry="13"
      className="fill-primary"
    />

    {/* Sayap kiri atas */}
    <ellipse
      cx="14"
      cy="11.5"
      rx="14"
      ry="9.5"
      transform="rotate(-45 14 11.5)"
      className="fill-foreground"
    />

    {/* Sayap kanan atas */}
    <ellipse
      cx="42"
      cy="11.5"
      rx="14"
      ry="9.5"
      transform="rotate(45 42 11.5)"
      className="fill-foreground"
    />

    {/* Sayap kiri bawah */}
    <ellipse
      cx="14"
      cy="32.5"
      rx="14"
      ry="9.5"
      transform="rotate(45 14 32.5)"
      className="fill-foreground"
    />

    {/* Sayap kanan bawah */}
    <ellipse
      cx="42"
      cy="32.5"
      rx="14"
      ry="9.5"
      transform="rotate(-45 42 32.5)"
      className="fill-foreground"
    />
  </svg>
    ),
    home: <svg {...iconProps} strokeWidth="1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>,
    plus: <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /></svg>,
    user: <svg {...iconProps} strokeWidth="1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>,
    sun: <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    moon: <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
    arrowLeft: <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    logout: <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    settings: <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    check: <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    clock: <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    folder: <svg {...iconProps} strokeWidth="1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" /></svg>,
    pin: (
      <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 17v5"/>
          <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V5a3 3 0 0 0-6 0Z"/>
      </svg>
    ),
    pinFilled: (
      <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
           <path d="M12 17v5"/>
           <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V5a3 3 0 0 0-6 0Z"/>
      </svg>
    ),
  };

  return icons[name] || null;
};

export default Icon;