import React, { useRef, useEffect } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';

interface MapComponentProps {
    center: [number, number];
    zoom: number;
    children: React.ReactNode;
    className?: string;
    onBoundsChanged?: (bounds: any) => void; // Keep prop for compatibility, though we might not strictly need it in Google Maps
}

// MapEvents hook equivalent for Google Maps
function MapEvents({ onBoundsChanged }: { onBoundsChanged?: (bounds: any) => void }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !onBoundsChanged) return;

        const listener = map.addListener('bounds_changed', () => {
            onBoundsChanged(map.getBounds());
            
            // Clean up old instances of markers created manually by the user if any (defensive coding)
        });

        return () => {
             google.maps.event.removeListener(listener);
        };
    }, [map, onBoundsChanged]);

    return null;
}

export function MapComponent({ center, zoom, children, className, onBoundsChanged }: MapComponentProps) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    return (
        <div className={className} style={{ height: '100%', width: '100%' }}>
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={{ lat: center[0], lng: center[1] }}
                    defaultZoom={zoom}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    mapId="fc5a7114e511dafe" // A valid Map ID is required for AdvancedMarkers
                    style={{ width: '100%', height: '100%' }}
                >
                    <MapEvents onBoundsChanged={onBoundsChanged} />
                    {children}
                </Map>
            </APIProvider>
        </div>
    );
}

