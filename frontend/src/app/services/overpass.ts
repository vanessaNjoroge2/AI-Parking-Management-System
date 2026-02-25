export interface ParkingLot {
    id: number;
    lat: number;
    lng: number;
    name: string;
    type?: string; // surface, multi-storey, underground, street_side
    access?: string; // public, private, customers
    fee?: string; // yes, no, interval
    capacity?: number;
    operator?: string;
    // New detailed fields
    openingHours?: string;
    maxHeight?: string;
    surface?: string; // asphalt, concrete, paved, unpaved, gravel
    supervised?: string; // yes, no
    disabledSpaces?: number;
}

/**
 * Fetches parking lots from OpenStreetMap via Overpass API
 * @param lat Latitude center
 * @param lng Longitude center
 * @param radius Radius in meters (default 1000)
 */
export async function fetchParkingLots(lat: number, lng: number, radius: number = 1000): Promise<ParkingLot[]> {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="parking"](around:${radius},${lat},${lng});
        way["amenity"="parking"](around:${radius},${lat},${lng});
      );
      out center;
    `;

    try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: query,
        });

        if (!response.ok) {
            throw new Error(`Overpass API error: ${response.statusText}`);
        }

        const data = await response.json();

        return data.elements.map((element: any) => {
            const tags = element.tags || {};

            // Use 'center' for ways/polygons, 'lat/lon' for nodes
            const finalLat = element.lat || element.center?.lat;
            const finalLng = element.lon || element.center?.lon;

            // Naming Strategy
            let name = "Public Parking";
            if (tags.name) {
                name = tags.name;
            } else if (tags.operator) {
                name = `${tags.operator} Parking`;
            } else if (tags.building) {
                name = `${tags.building} Parking`;
            } else if (tags['addr:housename']) {
                name = `${tags['addr:housename']} Parking`;
            } else if (tags['addr:street']) {
                name = `Parking at ${tags['addr:street']}`;
            }

            return {
                id: element.id,
                lat: finalLat,
                lng: finalLng,
                name: name,
                type: tags.parking || "surface",
                access: tags.access || "public",
                fee: tags.fee || "unknown",
                capacity: tags.capacity ? parseInt(tags.capacity, 10) : undefined,
                operator: tags.operator,
                // Map new fields
                openingHours: tags.opening_hours,
                maxHeight: tags.maxheight,
                surface: tags.surface,
                supervised: tags.supervised,
                disabledSpaces: tags['capacity:disabled'] ? parseInt(tags['capacity:disabled'], 10) : undefined,
            };
        }).filter((lot: ParkingLot) => lot.lat && lot.lng); // Ensure valid coordinates

    } catch (error) {
        console.error("Failed to fetch parking lots:", error);
        return [];
    }
}
