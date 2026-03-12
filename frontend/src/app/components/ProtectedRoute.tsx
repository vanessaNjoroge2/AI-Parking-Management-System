import React from 'react';
import { Navigate } from 'react-router';
import { getStoredAuth } from '../services/authStorage';

interface ProtectedRouteProps {
    children: React.ReactElement;
    allowedRoles?: string[];
    redirectTo?: string;
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = '/login' }: ProtectedRouteProps) {
    const auth = getStoredAuth();

    if (!auth) {
        return <Navigate to={redirectTo} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
        return <Navigate to={auth.user.role === 'OWNER' || auth.user.role === 'ADMIN' ? '/owner/dashboard' : '/search'} replace />;
    }

    return children;
}
