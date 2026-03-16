import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />

      {/* Main content — margin-left adjusts for sidebar via CSS (sidebar can be 72px or 256px) */}
      <div className="flex-1 ml-64 transition-all duration-300">
        <TopBar />
        <main className="p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
