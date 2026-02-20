import React from 'react';

interface StatusBadgeProps {
  status: 'confirmed' | 'pending' | 'cancelled' | 'available' | 'occupied' | 'full' | 'low';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    confirmed: 'bg-success/15 text-success border-success/20 ring-1 ring-success/10',
    pending: 'bg-warning/15 text-warning border-warning/20 ring-1 ring-warning/10',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
    available: 'bg-success/15 text-success border-success/20 ring-1 ring-success/10',
    occupied: 'bg-destructive/10 text-destructive border-destructive/20',
    full: 'bg-destructive/10 text-destructive border-destructive/20',
    low: 'bg-warning/15 text-warning border-warning/20 ring-1 ring-warning/10',
  };

  const labels = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    available: 'Available',
    occupied: 'Occupied',
    full: 'Full',
    low: 'Low Spots',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
