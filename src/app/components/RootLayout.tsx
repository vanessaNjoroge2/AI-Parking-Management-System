import { Outlet } from 'react-router';
import { DevMenu } from './DevMenu';

export function RootLayout() {
  return (
    <>
      <Outlet />
      <DevMenu />
    </>
  );
}
