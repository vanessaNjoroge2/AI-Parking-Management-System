import { Outlet } from 'react-router';
import { DevMenu } from './DevMenu';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ChatbotWidget } from './ChatbotWidget';

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      <DevMenu />
      <ChatbotWidget />
    </div>
  );
}

