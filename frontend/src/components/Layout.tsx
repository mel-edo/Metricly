import { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-metricly-background">
        <Outlet />
      </main>
    </div>
  );
}