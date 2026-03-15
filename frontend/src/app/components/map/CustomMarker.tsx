import React, { useState } from 'react';
import { AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { Button } from '../ui/button';
import { Navigation } from 'lucide-react';

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
    // New props for the pill UI
    availableSpaces?: number;
    totalSpaces?: number;
}

export function CustomMarker({
    id, position, title, price, status, type, access, fee, onBook, opacity = 1,
    isCovered, hasEvCharging, wheelchairFriendly, allowedVehicleSizes,
    availableSpaces = 0, totalSpaces = 0
}: CustomMarkerProps) {
    const [infoWindowOpen, setInfoWindowOpen] = useState(false);

    let baseColor = 'bg-slate-900'; // Modern dark
    let textColor = 'text-white';

    if (status === 'full' || status === 'occupied' || availableSpaces === 0) {
        baseColor = 'bg-slate-300'; // Subtle gray for full
        textColor = 'text-slate-500';
    }

    const handleClick = () => {
        setInfoWindowOpen(true);
        onBook(id);
    };

    return (
        <AdvancedMarker
            position={{ lat: position[0], lng: position[1] }}
            title={title}
            onClick={handleClick}
        >
            <div 
                className={`${baseColor} rounded-full px-2.5 py-1 box-content shadow-sm border border-white/20 ring-1 ring-black/5 flex items-center justify-center transform transition-transform hover:scale-110 hover:-translate-y-1 cursor-pointer max-w-[120px] backdrop-blur-sm`}
                style={{ opacity, zIndex: infoWindowOpen ? 50 : 1 }}
            >
                <div className="flex items-center justify-center gap-1.5 leading-none pointer-events-none">
                    <span className={`text-[10px] font-semibold ${textColor} truncate max-w-[70px]`}>{title}</span>
                    <div className="w-[1px] h-3 bg-white/20"></div>
                    <span className={`text-[10px] font-bold ${textColor}`}>{price}<span className="text-[8px] font-medium opacity-70">/h</span></span>
                </div>
            </div>

            {infoWindowOpen && (
                <InfoWindow
                    position={{ lat: position[0], lng: position[1] }}
                    onCloseClick={() => setInfoWindowOpen(false)}
                    pixelOffset={[0, -15]}
                >
                    <div className="p-1 min-w-[200px] flex flex-col gap-3">
                        <div>
                            <h3 className="font-bold text-sm text-slate-900 mb-0.5">{title}</h3>
                            <p className="text-xs text-slate-500 font-medium">
                                <span className={availableSpaces > 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                                    {availableSpaces}
                                </span> / {totalSpaces} Available
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                            <span className="font-bold text-slate-900 text-sm">KES {price} <span className="text-[10px] text-slate-500 font-normal">/hr</span></span>
                            
                        </div>

                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 h-auto rounded-md shadow-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setInfoWindowOpen(false);
                                onBook(id);
                                // The MapResults component usually handles the navigate, so we trigger onBook
                                // and assume the parent handles the detailed route push. 
                                // Alternatively, we can force dispatch it if MapResults doesn't route properly
                            }}
                        >
                            Book Parking
                        </Button>
                    </div>
                </InfoWindow>
            )}
        </AdvancedMarker>
    );
}
