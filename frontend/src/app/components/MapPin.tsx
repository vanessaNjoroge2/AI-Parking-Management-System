import React from 'react';
import { MapPin as MapPinIcon } from 'lucide-react';

interface MapPinProps {
  price: number;
  isSelected?: boolean;
  status?: 'available' | 'full';
  onClick?: () => void;
}

export function MapPin({ price, isSelected = false, status = 'available', onClick }: MapPinProps) {
  const getBgColor = () => {
    if (isSelected) return 'bg-primary text-primary-foreground scale-110';
    if (status === 'full') return 'bg-destructive text-destructive-foreground hover:scale-105';
    return 'bg-accent text-accent-foreground hover:scale-105';
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-2 rounded-full shadow-lg transition-all ${getBgColor()}`}
    >
      <MapPinIcon className="w-4 h-4" />
      <span className="font-medium">${price}</span>
    </button>
  );
}
