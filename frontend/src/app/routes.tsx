import { createBrowserRouter } from 'react-router';

// Layout
import { RootLayout } from './components/RootLayout';

// Welcome
import { Welcome } from './screens/Welcome';

// Driver Screens
import { Splash } from './screens/driver/Splash';
import { Login } from './screens/driver/Login';
import { Search } from './screens/driver/Search';
import { MapResults } from './screens/driver/MapResults';
import { LotDetails } from './screens/driver/LotDetails';
import { BookingForm } from './screens/driver/BookingForm';
import { Payment } from './screens/driver/Payment';
import { BookingConfirmation } from './screens/driver/BookingConfirmation';
import { BookingHistory } from './screens/driver/BookingHistory';
import { BookingDetails } from './screens/driver/BookingDetails';
import { Profile } from './screens/driver/Profile';


// Owner Screens
import { OwnerLogin } from './screens/owner/OwnerLogin';
import { Dashboard } from './screens/owner/Dashboard';
import { AddEditLot } from './screens/owner/AddEditLot';
import { TodaysBookings } from './screens/owner/TodaysBookings';
import { CheckInOut } from './screens/owner/CheckInOut';
import { Analytics } from './screens/owner/Analytics';



import { ProtectedRoute } from './components/ProtectedRoute';



export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        Component: Welcome,
      },
      {
        path: '/splash',
        Component: Splash,
      },
      {
        path: '/login',
        Component: Login,
      },
      {
        path: '/search',
        Component: Search,
      },
      {
        path: '/map-results',
        Component: MapResults,
      },
      {
        path: '/lot-details',
        Component: LotDetails,
      },
      {
        path: '/booking-form',
        Component: BookingForm,
      },
      {
        path: '/payment',
        Component: Payment,
      },
      {
        path: '/booking-confirmation',
        Component: BookingConfirmation,
      },
      {
        path: '/booking-history',
        Component: BookingHistory,
      },
      {
        path: '/booking-details',
        Component: BookingDetails,
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },

      {
        path: '/owner/login',
        Component: OwnerLogin,
      },
      {
        path: '/owner/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']} redirectTo="/owner/login">
            <Dashboard />
          </ProtectedRoute>
        ),
      },

      {
        path: '/owner/add-lot',
        element: (
          <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']} redirectTo="/owner/login">
            <AddEditLot />
          </ProtectedRoute>
        ),
      },
      {
        path: '/owner/edit-lot',
        element: (
          <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']} redirectTo="/owner/login">
            <AddEditLot />
          </ProtectedRoute>
        ),
      },
      {
        path: '/owner/todays-bookings',
        element: (
          <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']} redirectTo="/owner/login">
            <TodaysBookings />
          </ProtectedRoute>
        ),
      },
      {
        path: '/owner/check-in-out',
        element: (
          <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']} redirectTo="/owner/login">
            <CheckInOut />
          </ProtectedRoute>
        ),
      },
      {
        path: '/owner/analytics',
        element: (
          <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']} redirectTo="/owner/login">
            <Analytics />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
