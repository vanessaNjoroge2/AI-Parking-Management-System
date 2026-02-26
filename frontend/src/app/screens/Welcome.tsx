import React from 'react';
import { useNavigate } from 'react-router';
import { ParkingCircle, User, Building2, Sparkles } from 'lucide-react';
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
    <div className="bg-background">
      {/* Hero Section */}
      <section className="h-screen bg-gradient-to-br from-primary via-primary to-accent px-6 flex items-center text-white">
        <div className="max-w-6xl mx-auto text-center w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm">
              <ParkingCircle className="w-20 h-20" />
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-4">ParkSmart</h1>
          <p className="text-2xl text-white/90 mb-2 font-medium">Parking Booking Platform</p>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            The easiest way to find and book parking spots in Nairobi. Secure, fast, and seamless.
          </p>
          <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Premium Parking Experience</span>
          </div>
        </div>
      </section>

      {/* Flows Section */}
      <section className="h-screen flex items-center bg-white px-6">
        <div className="max-w-6xl mx-auto w-full py-12">
          <h2 className="text-4xl font-bold text-center mb-12">Choose Your Journey</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {flows.map((flow) => (
              <div key={flow.title} className="bg-white rounded-3xl p-8 shadow-md border border-border/50 hover:shadow-lg transition-all group">
                <div className={`bg-gradient-to-br ${flow.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <flow.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{flow.title}</h3>
                <p className="text-muted-foreground mb-6">{flow.description}</p>

                <div className="mb-8">
                  <p className="text-sm font-semibold text-foreground mb-3">Key Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {flow.screens.map((screen, index) => (
                      <span
                        key={index}
                        className="text-xs px-3 py-1 bg-secondary rounded-full font-medium"
                      >
                        {screen}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => navigate(flow.path)}
                  className="w-full h-14 rounded-2xl bg-primary text-white text-lg font-semibold"
                >
                  Explore {flow.title}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="h-screen flex items-center bg-secondary/30 px-6">
        <div className="max-w-6xl mx-auto w-full py-12">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-[3rem] p-12 border border-primary/10">
            <h2 className="text-4xl font-bold mb-12 text-center text-primary">Everything you need</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Smart Search',
                  description: 'Find optimal parking with filters, map view, and real-time availability tracking.',
                },
                {
                  title: 'Digital Payments',
                  description: 'Seamless M-Pesa and Card integration for frictionless booking and payments.',
                },
                {
                  title: 'Owner Analytics',
                  description: 'Comprehensive dashboard for revenue tracking, lot management, and growth metrics.',
                },
              ].map((feature, index) => (
                <div key={index} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}