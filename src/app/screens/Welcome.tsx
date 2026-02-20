import React from 'react';
import { useNavigate } from 'react-router';
import { ParkingCircle, User, Building2, Palette, Smartphone, Monitor, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';

export function Welcome() {
  const navigate = useNavigate();

  const flows = [
    {
      title: 'Driver Flow',
      description: 'Experience the parking booking journey',
      icon: User,
      color: 'from-primary to-primary/80',
      path: '/login',
      screens: [
        'Splash Screen',
        'Login/Sign Up',
        'Search Page',
        'Map Results',
        'Lot Details',
        'Booking Form',
        'Payment',
        'Confirmation',
        'History',
      ],
    },
    {
      title: 'Owner Dashboard',
      description: 'Manage parking lots and bookings',
      icon: Building2,
      color: 'from-accent to-accent/80',
      path: '/owner/login',
      screens: [
        'Owner Login',
        'Dashboard',
        'Add/Edit Lot',
        "Today's Bookings",
        'Check-In/Out',
        'Analytics',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary to-accent px-6 py-12 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm">
              <ParkingCircle className="w-20 h-20" />
            </div>
          </div>
          <h1 className="text-5xl mb-4">ParkSmart</h1>
          <p className="text-xl text-white/90 mb-2">Parking Booking Platform</p>
          <p className="text-white/80 max-w-2xl mx-auto mb-6">
            A modern, clean mobile-first web application for drivers and parking lot owners
          </p>
          <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Inspired by Uber + Airbnb simplicity</span>
          </div>
        </div>
      </div>

      {/* Design Info */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl p-8 shadow-sm mb-12">
          <h2 className="text-3xl mb-6 text-center">Design System</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Mobile First
              </h3>
              <p className="text-muted-foreground mb-3">
                Optimized for 390px mobile viewport with responsive desktop scaling
              </p>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-secondary rounded-lg text-sm">Clean</div>
                <div className="px-3 py-1 bg-secondary rounded-lg text-sm">Minimal</div>
                <div className="px-3 py-1 bg-secondary rounded-lg text-sm">Professional</div>
              </div>
            </div>
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-accent" />
                Responsive Layout
              </h3>
              <p className="text-muted-foreground mb-3">
                Scales beautifully from mobile to desktop screens
              </p>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-sm">16px+ Radius</div>
                <div className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-sm">Soft Shadows</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/design-system')}
              className="h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white px-8 flex items-center gap-2"
            >
              <Palette className="w-5 h-5" />
              View Full Design System
            </Button>
          </div>
        </div>

        {/* Flows */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {flows.map((flow) => (
            <div key={flow.title} className="bg-white rounded-3xl p-8 shadow-sm">
              <div className={`bg-gradient-to-br ${flow.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                <flow.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl mb-2">{flow.title}</h3>
              <p className="text-muted-foreground mb-6">{flow.description}</p>
              
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-3">Screens included:</p>
                <div className="flex flex-wrap gap-2">
                  {flow.screens.map((screen, index) => (
                    <span
                      key={index}
                      className="text-xs px-3 py-1 bg-secondary rounded-full"
                    >
                      {screen}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => navigate(flow.path)}
                className="w-full h-14 rounded-2xl bg-primary text-white"
              >
                Explore {flow.title}
              </Button>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8">
          <h2 className="text-2xl mb-6 text-center">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Smart Search',
                description: 'Find parking with filters, map view, and real-time availability',
              },
              {
                title: 'Secure Booking',
                description: 'QR codes, booking confirmations, and multiple payment options',
              },
              {
                title: 'Owner Tools',
                description: 'Analytics, revenue tracking, and booking management',
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6">
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}