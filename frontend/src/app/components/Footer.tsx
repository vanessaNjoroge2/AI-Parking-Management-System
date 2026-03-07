import { ParkingCircle } from 'lucide-react';
import { getStoredAuth } from '../services/authStorage';

export function Footer() {
    const auth = getStoredAuth();
    const role = auth?.user.role ?? 'GUEST';

    const links = role === 'OWNER' || role === 'ADMIN'
        ? [
            { label: 'Dashboard', href: '/owner/dashboard' },
            { label: 'Analytics', href: '/owner/analytics' },
        ]
        : role === 'DRIVER'
            ? [
                { label: 'Find Parking', href: '/search' },
                { label: 'My Bookings', href: '/booking-history' },
                { label: 'Profile', href: '/profile' },
            ]
            : [
                { label: 'Find Parking', href: '/search' },
                { label: 'List Your Spot', href: '/owner/login' },
            ];

    return (
        <footer className="bg-background border-t border-border py-4 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="bg-slate-900 p-1 rounded-md">
                        <ParkingCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-base font-semibold tracking-tight text-foreground">ParkSmart</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {links.map((link, idx) => (
                        <a key={idx} href={link.href} className="hover:text-blue-600 transition-colors">{link.label}</a>
                    ))}
                    <span>© {new Date().getFullYear()} ParkSmart</span>
                    <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-slate-600 transition-colors">Security</a>
                </div>
            </div>
        </footer>
    );
}
