import React from 'react';
import { useNavigate } from 'react-router';
import { User, Mail, Phone, Settings, LogOut, ChevronRight, Shield, Bell, CreditCard } from 'lucide-react';
import { getStoredAuth, clearAuth } from '../../services/authStorage';
import { Button } from '../../components/ui/button';

export function Profile() {
    const navigate = useNavigate();
    const auth = getStoredAuth();

    const handleSignOut = () => {
        clearAuth();
        navigate('/login');
    };

    if (!auth) {
        return null; // Should be protected by Route but just in case
    }

    const sections = [
        { icon: User, label: 'Personal Information', path: '#' },
        { icon: Bell, label: 'Notifications', path: '#' },
        { icon: CreditCard, label: 'Payment Methods', path: '#' },
        { icon: Shield, label: 'Security & Privacy', path: '#' },
        { icon: Settings, label: 'App Settings', path: '#' },
    ];

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-[390px] mx-auto pt-8">
                {/* Profile Card */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-border/50 text-center mb-10">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-12 h-12 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">{auth.user.fullName}</h2>
                    <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                        <Phone className="w-3 h-3" />
                        {auth.user.phone}
                    </p>
                    {auth.user.email && (
                        <p className="text-muted-foreground text-sm flex items-center justify-center gap-2 mt-1">
                            <Mail className="w-3 h-3" />
                            {auth.user.email}
                        </p>
                    )}
                </div>

                {/* Menu Sections */}
                <div className="space-y-3 mb-10">
                    {sections.map((item, idx) => (
                        <button
                            key={idx}
                            className="w-full bg-white rounded-2xl p-4 flex items-center justify-between group hover:bg-primary/5 transition-colors border border-border/50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-secondary rounded-xl group-hover:bg-primary/10 transition-colors">
                                    <item.icon className="w-5 h-5 text-primary" />
                                </div>
                                <span className="font-medium">{item.label}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>
                    ))}
                </div>

                {/* Sign Out */}
                <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="w-full h-14 rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </Button>
            </div>
        </div>
    );
}
