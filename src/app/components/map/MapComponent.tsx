import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
    center: [number, number];
    zoom: number;
    children: React.ReactNode;
    className?: string;
    onBoundsChanged?: (bounds: L.LatLngBounds) => void;
}

// Component to handle map events
function MapEvents({ onBoundsChanged }: { onBoundsChanged?: (bounds: L.LatLngBounds) => void }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const handleMoveEnd = () => {
            if (onBoundsChanged) {
                onBoundsChanged(map.getBounds());
            }
        };

        map.on('moveend', handleMoveEnd);

        // Initial bounds
        handleMoveEnd();

        return () => {
            map.off('moveend', handleMoveEnd);
        };
    }, [map, onBoundsChanged]);

    return null;
}

export function MapComponent({ center, zoom, children, className, onBoundsChanged }: MapComponentProps) {
    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            className={className}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <MapEvents onBoundsChanged={onBoundsChanged} />
            {children}
        </MapContainer>
    );
}
