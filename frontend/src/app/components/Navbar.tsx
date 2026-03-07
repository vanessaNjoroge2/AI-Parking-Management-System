import React from 'react';
import { useNavigate, Link } from 'react-router';
import { ParkingCircle, User, LogOut, Download } from 'lucide-react';
import { getStoredAuth, clearAuth } from '../services/authStorage';
import { Button } from './ui/button';

export function Navbar() {
    const navigate = useNavigate();
    const auth = getStoredAuth();
    const role = auth?.user.role ?? 'GUEST';

    const navLinks = role === 'OWNER' || role === 'ADMIN'
        ? [
            { label: 'Dashboard', to: '/owner/dashboard' },
            { label: 'Add Lot', to: '/owner/add-lot' },
            { label: "My Bookings", to: '/owner/todays-bookings' },
            { label: 'Analytics', to: '/owner/analytics' },
        ]
        : role === 'DRIVER'
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
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur border-b border-border z-[1000] flex items-center justify-between px-6">
            <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-slate-900 p-1.5 rounded-md transition-transform group-hover:scale-105">
                    <ParkingCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold tracking-tight text-foreground">ParkSmart</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1">
                {navLinks.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background rounded-full transition-colors"
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-4">
                {auth ? (
                    <>
                        {(role === 'OWNER' || role === 'ADMIN') && (
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
                            className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
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
