import React from 'react';
import { ParkingCircle } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-white border-t border-border py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded-lg">
                            <ParkingCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-primary">ParkSmart</span>
                    </div>
                    <p className="text-muted-foreground max-w-xs">
                        The easiest way to find and book parking spots in Nairobi.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 w-full md:w-auto">
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="/search" className="hover:text-primary">Find Parking</a></li>
                            <li><a href="/owner/login" className="hover:text-primary">List Your Spot</a></li>
                            <li><a href="/booking-history" className="hover:text-primary">My Bookings</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary">About Us</a></li>
                            <li><a href="#" className="hover:text-primary">Contact</a></li>
                            <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-primary">Help Center</a></li>
                            <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} ParkSmart. All rights reserved.
            </div>
        </footer>
    );
}
