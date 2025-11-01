
import React, { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '../contexts';
import { signOutUser } from '../services/firebase';
import { useNavigate, NavLink, Link, useLocation } from 'react-router-dom';
import Icon from './Icons';
import { Button } from './ui';

// --- Profile Dropdown ---
const ProfileDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [initial, setInitial] = useState('');

    useEffect(() => {
        if(userProfile?.name) {
            setInitial(userProfile.name.charAt(0).toUpperCase());
        }
    }, [userProfile]);

    const handleLogout = async () => {
        await signOutUser();
        navigate('/login');
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-secondary-foreground font-bold text-lg">
                {initial || <Icon name="user" />}
            </button>
            {isOpen && (
                <div 
                    className="absolute right-0 w-48 mt-2 origin-top-right bg-card border rounded-md shadow-lg z-20"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="py-1">
                        <Link to="/profile" className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent" onClick={() => setIsOpen(false)}>
                            Profile
                        </Link>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent">
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Top Navbar ---
const Navbar: React.FC = () => {
    return (
        <header className="hidden md:flex items-center justify-between p-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-20">
            <Link to="/spaces" className="text-primary">
                <img src="/galpek.png" alt="Logo" className="w-40 h-auto mx-auto"/>
            </Link>
            <div className="flex items-center gap-4">
                <ProfileDropdown />
            </div>
        </header>
    );
};

// --- Bottom Navbar ---
const BottomNavbar: React.FC<{ onFabClick?: () => void }> = ({ onFabClick }) => {
    const baseStyle = "flex flex-col items-center justify-center w-full h-full transition-colors text-xs";
    const activeStyle = "text-primary font-medium";
    const inactiveStyle = "text-muted-foreground";
    const location = useLocation();

    const navItems = [
        { path: '/spaces', icon: 'home', label: 'Home' },
        { path: 'fab', icon: 'plus', label: '' },
        { path: '/profile', icon: 'user', label: 'Profile' }
    ];

    const fabVisible = location.pathname.startsWith('/spaces');

    return (
        <footer className="fixed bottom-0 left-0 right-0 h-20 bg-card/95 backdrop-blur-sm border-t shadow-lg md:hidden z-10 animate-slide-in-up">
            <div className="grid grid-cols-3 items-center justify-around h-full">
                {navItems.map((item) => {
                    if (item.path === 'fab') {
                        return (
                            <div key={item.path} className="flex justify-center items-center">
                                {fabVisible && (
                                    <button 
                                        onClick={onFabClick} 
                                        className="w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg -translate-y-6 flex items-center justify-center"
                                        aria-label="Add new item"
                                    >
                                        <Icon name={item.icon as 'plus'} className="w-8 h-8"/>
                                    </button>
                                )}
                            </div>
                        );
                    }
                    return (
                        <NavLink key={item.path} to={item.path} className={({ isActive }) => `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}>
                            <Icon name={item.icon as any} className="w-5 h-5 mb-1" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </footer>
    );
};


// --- Main Layout ---
const Layout: React.FC<{ children: ReactNode, headerContent?: ReactNode, onFabClick?: () => void }> = ({ children, headerContent, onFabClick }) => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div>
              {headerContent ? <div className="md:hidden">{headerContent}</div> : null}
              <div className="hidden md:block">
                {headerContent ? headerContent : <Navbar />}
              </div>
            </div>
            <main className="w-full max-w-[85%] md:max-w-[70%] mx-auto px-4 py-6 pb-28 md:pb-6">
                {children}
            </main>
            <BottomNavbar onFabClick={onFabClick} />
        </div>
    );
};

export default Layout;