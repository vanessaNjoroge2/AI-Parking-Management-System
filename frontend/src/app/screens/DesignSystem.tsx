import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ParkingCircle, Shield, Camera, Car, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { StatusBadge } from '../components/StatusBadge';
import { MapPin } from '../components/MapPin';
import { TimePicker } from '../components/TimePicker';

export function DesignSystem() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 max-w-[1200px] mx-auto">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <ParkingCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl">ParkSmart Design System</h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Colors */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6">Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="mb-4">Primary Colors</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-primary rounded-2xl shadow-sm"></div>
                  <div>
                    <p className="font-medium">Deep Blue</p>
                    <p className="text-sm text-muted-foreground">#1E3A8A</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-accent rounded-2xl shadow-sm"></div>
                  <div>
                    <p className="font-medium">Emerald</p>
                    <p className="text-sm text-muted-foreground">#10B981</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Neutral Colors</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-background rounded-2xl shadow-sm border"></div>
                  <div>
                    <p className="font-medium">Background</p>
                    <p className="text-sm text-muted-foreground">#F8FAFC</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border"></div>
                  <div>
                    <p className="font-medium">White</p>
                    <p className="text-sm text-muted-foreground">#FFFFFF</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-secondary rounded-2xl shadow-sm"></div>
                  <div>
                    <p className="font-medium">Secondary</p>
                    <p className="text-sm text-muted-foreground">#F1F5F9</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4">Semantic Colors</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-destructive rounded-2xl shadow-sm"></div>
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm text-muted-foreground">#EF4444</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-[#F59E0B] rounded-2xl shadow-sm"></div>
                  <div>
                    <p className="font-medium">Warning</p>
                    <p className="text-sm text-muted-foreground">#F59E0B</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6">Typography</h2>
          <div className="bg-white rounded-2xl p-8 space-y-6">
            <div>
              <h1 className="mb-2">Heading 1</h1>
              <p className="text-sm text-muted-foreground">32px / Medium / 1.5 line height</p>
            </div>
            <div>
              <h2 className="mb-2">Heading 2</h2>
              <p className="text-sm text-muted-foreground">24px / Medium / 1.5 line height</p>
            </div>
            <div>
              <h3 className="mb-2">Heading 3</h3>
              <p className="text-sm text-muted-foreground">20px / Medium / 1.5 line height</p>
            </div>
            <div>
              <p className="mb-2">Body Text</p>
              <p className="text-sm text-muted-foreground">16px / Normal / 1.5 line height</p>
            </div>
          </div>
        </section>

        {/* Spacing & Borders */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6">Spacing & Borders</h2>
          <div className="bg-white rounded-2xl p-8">
            <div className="mb-6">
              <h3 className="mb-3">Border Radius</h3>
              <div className="flex gap-4 items-end">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary rounded-xl mb-2"></div>
                  <p className="text-sm">12px</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary rounded-2xl mb-2"></div>
                  <p className="text-sm">16px</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary rounded-3xl mb-2"></div>
                  <p className="text-sm">24px</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-3">Shadows</h3>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-sm flex items-center justify-center text-sm">
                  Small
                </div>
                <div className="w-24 h-24 bg-white rounded-2xl shadow-md flex items-center justify-center text-sm">
                  Medium
                </div>
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center text-sm">
                  Large
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6">Buttons</h2>
          <div className="bg-white rounded-2xl p-8 space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-3">Primary Button</p>
              <Button className="h-14 rounded-2xl bg-primary text-white px-8">
                Primary Button
              </Button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Secondary Button</p>
              <Button variant="outline" className="h-14 rounded-2xl border-2 px-8">
                Secondary Button
              </Button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Accent Button</p>
              <Button className="h-14 rounded-2xl bg-accent text-white px-8">
                Accent Button
              </Button>
            </div>
          </div>
        </section>

        {/* Input Fields */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6">Input Fields</h2>
          <div className="bg-white rounded-2xl p-8 space-y-4 max-w-md">
            <Input
              type="text"
              placeholder="Default Input"
              className="h-14 bg-secondary rounded-2xl border-0"
            />
            <Input
              type="text"
              placeholder="Input with Border"
              className="h-14 bg-white rounded-2xl border border-border"
            />
            <TimePicker
              label="Time Picker"
              value="09:00"
              onChange={() => {}}
            />
          </div>
        </section>

        {/* Status Badges */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6">Status Badges</h2>
          <div className="bg-white rounded-2xl p-8">
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="confirmed" />
              <StatusBadge status="pending" />
              <StatusBadge status="cancelled" />
              <StatusBadge status="available" />
              <StatusBadge status="occupied" />
            </div>
          </div>
        </section>

        {/* Map Pins */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6">Map Pins</h2>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8">
            <div className="flex gap-4">
              <MapPin price={5} />
              <MapPin price={8} isSelected />
              <MapPin price={10} />
            </div>
          </div>
        </section>

        {/* Icons */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6">Icons</h2>
          <div className="bg-white rounded-2xl p-8">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
              {[
                { Icon: ParkingCircle, label: 'Parking' },
                { Icon: Shield, label: 'Security' },
                { Icon: Camera, label: 'CCTV' },
                { Icon: Car, label: 'Car' },
                { Icon: Zap, label: 'EV Charging' },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <item.Icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
