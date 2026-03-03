import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { StatusBadge } from '../StatusBadge';
import { Zap, Accessibility, Car, Shield } from 'lucide-react';

interface CustomMarkerProps {
    id: string;
    position: [number, number];
    title: string;
    price: number;
    status: 'available' | 'occupied' | 'full';
    type?: string;
    access?: string;
    fee?: string;
    onBook: (id: string) => void;
    opacity?: number;
    isCovered?: boolean;
    hasEvCharging?: boolean;
    wheelchairFriendly?: boolean;
    allowedVehicleSizes?: string[];
}

export function CustomMarker({
    id, position, title, price, status, type, access, fee, onBook, opacity = 1,
    isCovered, hasEvCharging, wheelchairFriendly, allowedVehicleSizes
}: CustomMarkerProps) {
    // Determine icon and style
    let iconHtml = '<span class="text-xs font-bold">P</span>';
    let baseColor = 'bg-emerald-500'; // Available green

    if (status === 'full' || status === 'occupied') {
        baseColor = 'bg-rose-500'; // Full red
    }

    // Create custom icon
    const customIcon = divIcon({
        className: 'custom-marker',
        html: `<div class="${baseColor} w-8 h-8 rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white transform transition-transform hover:scale-125" style="opacity: ${opacity}">
                ${iconHtml}
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });

    return (
        <Marker
            position={position}
            icon={customIcon}
            eventHandlers={{
                click: () => onBook(id)
            }}
        />
    );
}
