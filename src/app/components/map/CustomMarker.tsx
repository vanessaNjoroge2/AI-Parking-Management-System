import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { StatusBadge } from '../StatusBadge';

interface CustomMarkerProps {
    id: number;
    position: [number, number];
    title: string;
    price: number;
    status: 'available' | 'occupied';
    type?: string;
    access?: string;
    fee?: string;
    onBook: (id: number) => void;
}

export function CustomMarker({ id, position, title, price, status, type, access, fee, onBook }: CustomMarkerProps) {
    // Determine color class based on status/access
    let colorClass = 'bg-success text-white border-success-foreground';
    let label = `KES ${price}`;

    if (fee === 'no') {
        colorClass = 'bg-primary text-white border-primary-foreground';
        label = 'Free';
    } else if (access === 'private' || access === 'customers') {
        colorClass = 'bg-warning text-white border-warning-foreground';
        label = access === 'customers' ? 'Cust.' : 'Pvt';
    }

    // Create custom icon
    const customIcon = divIcon({
        className: 'custom-marker',
        html: `<div class="${colorClass} px-3 py-1 rounded-full font-bold shadow-md border-2 whitespace-nowrap text-sm transform transition-transform hover:scale-110 flex items-center gap-1">
                <span>P</span> <span class="text-xs border-l border-white/30 pl-1 ml-1">${label}</span>
               </div>`,
        iconSize: [60, 30],
        iconAnchor: [30, 15],
    });

    return (
        <Marker position={position} icon={customIcon}>
            <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                    <h3 className="font-bold text-lg mb-1">{title}</h3>

                    <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize">
                            {type?.replace('_', ' ') || 'Surface'}
                        </span>
                        {access && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize">
                                {access}
                            </span>
                        )}
                    </div>

                    <div className="flex justify-between items-center mb-3">
                        <div className="text-sm">
                            {fee === 'no' ? <span className="text-success font-bold">Free Parking</span> : <span className="text-muted-foreground">Paid Parking</span>}
                        </div>
                    </div>

                    <Button
                        onClick={() => onBook(id)}
                        className="w-full rounded-full"
                        size="sm"
                    >
                        Directions
                    </Button>
                </div>
            </Popup>
        </Marker>
    );
}
