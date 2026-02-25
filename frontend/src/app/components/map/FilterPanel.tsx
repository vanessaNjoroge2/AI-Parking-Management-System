import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export interface FilterState {
    radius: number; // in meters
    types: string[]; // surface, covered
    access: string[]; // public, customers, private
    fee: string[]; // yes, no
}

interface FilterPanelProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onClose?: () => void;
    className?: string;
}

export function FilterPanel({ filters, onFilterChange, onClose, className = '' }: FilterPanelProps) {

    const toggleList = (item: string, category: 'types' | 'access' | 'fee') => {
        const currentList = filters[category];
        const newList = currentList.includes(item)
            ? currentList.filter(i => i !== item)
            : [...currentList, item];
        onFilterChange({ ...filters, [category]: newList });
    };

    return (
        <div className={`bg-white p-6 h-full flex flex-col ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            <div className="space-y-8 flex-1 overflow-y-auto pr-2">

                {/* Radius Selector */}
                <div className="space-y-4">
                    <Label className="text-base font-semibold">Search Radius</Label>
                    <RadioGroup
                        value={filters.radius.toString()}
                        onValueChange={(val) => onFilterChange({ ...filters, radius: parseInt(val) })}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1000" id="r1" />
                            <Label htmlFor="r1">1 km</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="2500" id="r2" />
                            <Label htmlFor="r2">2.5 km</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="5000" id="r3" />
                            <Label htmlFor="r3">5 km</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Parking Type */}
                <div className="space-y-4">
                    <Label className="text-base font-semibold">Parking Type</Label>
                    <div className="space-y-3">
                        {[
                            { id: 'surface', label: 'Open / Surface' },
                            { id: 'covered', label: 'Covered Parking' },
                        ].map((item) => (
                            <div key={item.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={item.id}
                                    checked={filters.types.includes(item.id)}
                                    onCheckedChange={() => toggleList(item.id, 'types')}
                                />
                                <Label htmlFor={item.id} className="cursor-pointer">{item.label}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Access (Public vs Customers) */}
                <div className="space-y-4">
                    <Label className="text-base font-semibold">Access</Label>
                    <div className="space-y-3">
                        {[
                            { id: 'public', label: 'Public Access' },
                            { id: 'customers', label: 'Customers Only' },
                            { id: 'private', label: 'Private / Residents' },
                        ].map((item) => (
                            <div key={item.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={item.id}
                                    checked={filters.access.includes(item.id)}
                                    onCheckedChange={() => toggleList(item.id, 'access')}
                                />
                                <Label htmlFor={item.id} className="cursor-pointer">{item.label}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fee (Free / Paid) */}
                <div className="space-y-4">
                    <Label className="text-base font-semibold">Cost</Label>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="fee-no"
                                checked={filters.fee.includes('no')}
                                onCheckedChange={() => toggleList('no', 'fee')}
                            />
                            <Label htmlFor="fee-no" className="cursor-pointer">Free Parking</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="fee-yes"
                                checked={filters.fee.includes('yes')}
                                onCheckedChange={() => toggleList('yes', 'fee')}
                            />
                            <Label htmlFor="fee-yes" className="cursor-pointer">Paid Parking</Label>
                        </div>
                    </div>
                </div>

            </div>

            <div className="pt-6 border-t mt-4">
                <Button
                    className="w-full"
                    onClick={() => onFilterChange({ radius: 1000, types: [], access: [], fee: [] })}
                    variant="outline"
                >
                    Reset Filters
                </Button>
            </div>
        </div>
    );
}
