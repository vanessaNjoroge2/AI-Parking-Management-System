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
      <section className="bg-slate-900 pt-24 pb-12 px-6 text-white overflow-hidden relative">
        {/* Subtle background pattern/texture can be added here */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 skew-x-12 translate-x-1/4 -z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Urban Mobility Solution</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
                Find an Available <br />
                <span className="text-blue-500">Parking Spot</span> in Seconds
              </h1>
              <p className="text-xl text-slate-400 max-w-xl mb-10 leading-relaxed">
                The most reliable way to secure parking in Nairobi. Real-time availability, secure payments, and seamless navigation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/login')}
                  className="h-14 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold transition-all shadow-lg shadow-blue-600/20"
                >
                  Book a Spot Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/owner/login')}
                  className="h-14 px-8 rounded-lg border-white text-white bg-transparent hover:bg-white/10 text-lg font-semibold"
                >
                  List Your Space
                </Button>
              </div>
            </div>
            <div className="flex-1 hidden lg:block">
              <div className="relative">
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-2xl rotate-3">
                  <div className="bg-slate-900 rounded-lg p-8 aspect-square flex items-center justify-center">
                    <ParkingCircle className="w-32 h-32 text-blue-500" />
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flows Section */}
      <section className="py-12 bg-white px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl font-semibold text-slate-900 mb-4 tracking-tight">Choose Your Experience</h2>
              <p className="text-lg text-slate-500">Whether you're looking for a spot or managing a facility, we've got you covered.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {flows.map((flow) => (
              <div key={flow.title} className="bg-slate-50 rounded-xl p-10 border border-slate-200 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 group">
                <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center mb-8 transition-transform group-hover:scale-110">
                  <flow.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-slate-900">{flow.title}</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">{flow.description}</p>

                <div className="mb-10">
                  <p className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Core Components</p>
                  <div className="flex flex-wrap gap-2">
                    {flow.screens.map((screen, index) => (
                      <span
                        key={index}
                        className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-md font-medium text-slate-600"
                      >
                        {screen}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => navigate(flow.path)}
                  className="w-full h-14 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-lg font-semibold transition-colors"
                >
                  Explore {flow.title}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-slate-50 border-t border-slate-200 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: 'Available Infrastructure',
                description: 'Search across 500+ verified parking facilities in commercial and residential zones.',
              },
              {
                title: 'Seamless Payments',
                description: 'Direct M-Pesa API integration for instant booking confirmations and receipts.',
              },
              {
                title: 'Operational Logic',
                description: 'Manage throughput, revenue, and security protocols from a single dashboard.',
              },
            ].map((feature, index) => (
              <div key={index} className="space-y-4">
                <div className="w-12 h-1 bg-blue-600 rounded-full mb-6"></div>
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}