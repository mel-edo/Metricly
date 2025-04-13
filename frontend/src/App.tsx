import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./hooks/use-theme";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ServersPage from "./pages/Servers";
import NetworkPage from "./pages/Network";

import ContainersPage from "./pages/Containers";
import { AddServerDialog } from "./components/AddServerDialog";
import { SwitchServerDialog } from "./components/SwitchServerDialog";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ServerProvider } from "./contexts/ServerContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { isLoggedIn } = useAuth();

  return (
    <ServerProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AddServerDialog />
        <SwitchServerDialog />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" replace />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="servers" element={<ServersPage />} />
              <Route path="network" element={<NetworkPage />} />

              <Route path="containers" element={<ContainersPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ServerProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
