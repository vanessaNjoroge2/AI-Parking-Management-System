import React from 'react';
import { Navigate } from 'react-router';
import { getStoredAuth } from '../services/authStorage';

interface ProtectedRouteProps {
    children: React.ReactElement;
    allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const auth = getStoredAuth();

    if (!auth) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}
