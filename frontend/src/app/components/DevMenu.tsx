import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';

export function DevMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on welcome page
  if (location.pathname === '/') return null;

  const routes = {
    'Driver Flow': [
      { path: '/splash', label: 'Splash' },
      { path: '/login', label: 'Login' },
      { path: '/search', label: 'Search' },
      { path: '/map-results', label: 'Map Results' },
      { path: '/lot-details', label: 'Lot Details' },
      { path: '/booking-form', label: 'Booking Form' },
      { path: '/payment', label: 'Payment' },
      { path: '/booking-confirmation', label: 'Confirmation' },
      { path: '/booking-history', label: 'History' },
    ],
    'Owner Flow': [
      { path: '/owner/login', label: 'Login' },
      { path: '/owner/dashboard', label: 'Dashboard' },
      { path: '/owner/add-lot', label: 'Add Lot' },
      { path: '/owner/todays-bookings', label: 'Bookings' },
      { path: '/owner/check-in-out', label: 'Check-In' },
      { path: '/owner/analytics', label: 'Analytics' },
    ],
    'Other': [
      { path: '/', label: 'Home' },
      { path: '/design-system', label: 'Design System' },
    ],
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
        aria-label="Navigation Menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Menu Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed right-4 bottom-20 z-50 bg-white rounded-2xl shadow-2xl p-4 max-h-[80vh] overflow-y-auto w-64">
            <h3 className="text-lg mb-3 pb-3 border-b border-border">Navigation</h3>
            {Object.entries(routes).map(([section, links]) => (
              <div key={section} className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">{section}</p>
                <div className="space-y-1">
                  {links.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => {
                        navigate(link.path);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        location.pathname === link.path
                          ? 'bg-primary text-white'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}