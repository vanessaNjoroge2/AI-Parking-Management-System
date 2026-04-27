import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { ParkingCircle, User, LogOut, Download } from 'lucide-react';
import { getStoredAuth, clearAuth } from '../services/authStorage';
import { Button } from './ui/button';

export function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const auth = getStoredAuth();
    const role = auth?.user?.role?.toUpperCase() ?? 'GUEST';

    const isOwnerContext = location.pathname.startsWith('/owner');

    const navLinks = isOwnerContext && (role === 'OWNER' || role === 'ADMIN')
        ? [
            { label: 'Dashboard', to: '/owner/dashboard' },
            { label: 'Add Lot', to: '/owner/add-lot' },
            { label: "Bookings", to: '/owner/todays-bookings' },
            { label: 'Analytics', to: '/owner/analytics' },
        ]
        : auth && role !== 'GUEST'
            ? [
                { label: 'Search', to: '/search' },
                { label: 'Map', to: '/map-results' },
                { label: 'Bookings', to: '/booking-history' },
            ]
            : [
                { label: 'Home', to: '/' },
                { label: 'Search', to: '/search' },
            ];

    const handleSignOut = () => {
        clearAuth();
        window.dispatchEvent(new Event('user-logout'));
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-background/95 dark:bg-slate-900/95 backdrop-blur border-b border-border dark:border-blue-500/20 z-[1000] flex items-center justify-between px-6 transition-colors">
            <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-slate-900 p-1.5 rounded-md transition-transform group-hover:scale-105">
                    <ParkingCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold tracking-tight text-foreground dark:text-white">ParkSmart</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 rounded-full bg-muted/60 dark:bg-slate-800/60 px-3 py-1">
                {navLinks.map((link) => {
                    const isActive = location.pathname === link.to;
                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`px-3 py-1.5 text-sm font-medium transition-all rounded-full ${
                                isActive 
                                ? 'text-foreground bg-background dark:text-blue-500 dark:bg-blue-500/10 dark:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-background dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-800'
                            }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
            </div>

            <div className="flex items-center gap-4">
                {auth ? (
                    <>
                        {(role === 'OWNER' || role === 'ADMIN') && isOwnerContext && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => {
                                    // Mock download logic
                                    console.log('Downloading reports...');
                                }}
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden lg:inline">Reports</span>
                            </Button>
                        )}
                        <Link to="/profile" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                            <User className="w-5 h-5" />
                            <span className="hidden sm:inline font-medium">{auth.user.fullName}</span>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSignOut}
                            className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 dark:text-rose-400 dark:hover:bg-rose-950/50"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="ghost" onClick={() => navigate('/login')}>
                            Sign In
                        </Button>
                        <Button onClick={() => navigate('/login')}>
                            Get Started
                        </Button>
                    </>
                )}
            </div>
        </nav>
    );
}
