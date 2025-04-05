import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./hooks/use-theme";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ServersPage from "./pages/Servers";
import NetworkPage from "./pages/Network";
import ConnectionsPage from "./pages/Connections";
import { AddServerDialog } from "./components/AddServerDialog";
import { SwitchServerDialog } from "./components/SwitchServerDialog";
import { useState } from "react";
import type { Server } from "./components/SwitchServerDialog";

const queryClient = new QueryClient();

const App = () => {
  const [activeServer, setActiveServer] = useState<Server | null>({
    id: "1",
    name: "Production Server",
    address: "192.168.1.100",
    isActive: true
  });

  const handleServerSwitch = (server: Server) => {
    setActiveServer(server);
    // Dispatch a custom event so other components can react to the server change
    document.dispatchEvent(
      new CustomEvent('server-switched', { detail: server })
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AddServerDialog />
          <SwitchServerDialog activeServer={activeServer} onServerSwitch={handleServerSwitch} />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="servers" element={<ServersPage />} />
                <Route path="network" element={<NetworkPage />} />
                <Route path="connections" element={<ConnectionsPage />} />
                {/* Add more routes for other pages as needed */}
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
