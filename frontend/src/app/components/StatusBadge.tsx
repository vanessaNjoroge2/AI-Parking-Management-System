import React from 'react';

interface StatusBadgeProps {
  status: 'confirmed' | 'pending' | 'cancelled' | 'available' | 'occupied' | 'full' | 'low';
  children?: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
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
    <div className={`
      inline-flex flex-col items-center justify-center px-4 py-2 rounded-xl text-center
      backdrop-blur-md shadow-sm border border-white/40 ring-1 ring-black/5
      transition-all duration-300
      ${status === 'available' || status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-800' : 'bg-rose-500/10 text-rose-800'}
    `}>
      {children && typeof children === 'string' && children.includes('/') ? (
        <>
          <span className="text-sm font-bold tracking-tight leading-none mb-0.5">
            {children.split(' ')[0]}
          </span>
          <span className="text-[9px] font-medium opacity-60 tracking-widest uppercase">
            {children.split(' ')[1] || 'Spots'}
          </span>
        </>
      ) : (
        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
          {children || labels[status]}
        </span>
      )}
    </div>
  );
}
