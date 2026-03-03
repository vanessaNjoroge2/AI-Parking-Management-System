import React from 'react';
import { ParkingCircle } from 'lucide-react';

export function Footer() {
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
                    <a href="/search" className="hover:text-blue-600 transition-colors">Find Parking</a>
                    <a href="/owner/login" className="hover:text-blue-600 transition-colors">List Your Spot</a>
                    <a href="/booking-history" className="hover:text-blue-600 transition-colors">My Bookings</a>
                    <span>© {new Date().getFullYear()} ParkSmart</span>
                    <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-slate-600 transition-colors">Security</a>
                </div>
            </div>
        </footer>
    );
}
