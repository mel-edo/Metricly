import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useTheme } from "../hooks/use-theme";
import {
  LayoutDashboard,
  Server,
  Box,
  Activity,
  History,
  Settings,
  LogOut,
  Plus,
  PanelLeft,
  PanelLeftClose,
  Sun,
  Moon,
  Cable,
  Network,
  ServerCrash
} from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, active, onClick }: NavItemProps) => {
  return (
    <li>
      <Button
        variant="ghost"
        className={`w-full justify-start ${
          active
            ? "bg-mauve/10 text-mauve"
            : "hover:bg-surface0/70 text-subtext0 hover:text-text"
        }`}
        onClick={onClick}
      >
        <span className="mr-2">{icon}</span>
        <span>{label}</span>
      </Button>
    </li>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  const handleNavigation = (page: string) => {
    setActivePage(page);
    navigate(`/${page === "dashboard" ? "" : page}`);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleAddServerClick = () => {
    document.dispatchEvent(new CustomEvent('open-add-server-dialog'));
  };

  const handleSwitchServerClick = () => {
    document.dispatchEvent(new CustomEvent('open-switch-server-dialog'));
  };

  return (
    <aside
      className={`bg-surface0 border-r border-overlay0/30 flex flex-col transition-width duration-200 ease-out ${
        collapsed ? "w-[60px]" : "w-[240px]"
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b border-overlay0/30">
        {!collapsed && (
          <h1 className="text-transparent bg-gradient-to-r from-blue to-mauve bg-clip-text text-xl font-bold">Metricly</h1>
        )}
        <button
          onClick={toggleSidebar}
          className={`p-1 rounded-md hover:bg-lavender/10 text-lavender ${
            collapsed ? "mx-auto" : ""
          }`}
        >
          {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <div className="p-3 space-y-2">
        <Button
          variant="outline"
          className={`w-full bg-surface0 border-lavender text-lavender hover:bg-lavender/10 hover:text-lavender ${
            collapsed ? "px-2 justify-center" : ""
          }`}
          onClick={handleAddServerClick}
        >
          <Plus size={18} className={collapsed ? "mx-auto" : "mr-2"} />
          {!collapsed && <span>Add Server</span>}
        </Button>

        <Button
          variant="outline"
          className={`w-full bg-surface0 border-blue text-blue hover:bg-blue/10 hover:text-blue ${
            collapsed ? "px-2 justify-center" : ""
          }`}
          onClick={handleSwitchServerClick}
        >
          <ServerCrash size={18} className={collapsed ? "mx-auto" : "mr-2"} />
          {!collapsed && <span>Switch Server</span>}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        <nav>
          <ul className="space-y-1 px-3">
            {!collapsed ? (
              <>
                <NavItem
                  icon={<LayoutDashboard size={18} />}
                  label="Dashboard"
                  active={activePage === "dashboard"}
                  onClick={() => handleNavigation("dashboard")}
                />
                <NavItem
                  icon={<Server size={18} />}
                  label="Servers"
                  active={activePage === "servers"}
                  onClick={() => handleNavigation("servers")}
                />
                <NavItem
                  icon={<Box size={18} />}
                  label="Containers"
                  active={activePage === "containers"}
                  onClick={() => handleNavigation("containers")}
                />
                <NavItem
                  icon={<Activity size={18} />}
                  label="System Metrics"
                  active={activePage === "metrics"}
                  onClick={() => handleNavigation("metrics")}
                />
                <NavItem
                  icon={<History size={18} />}
                  label="History"
                  active={activePage === "history"}
                  onClick={() => handleNavigation("history")}
                />
                <NavItem
                  icon={<Network size={18} />}
                  label="Network"
                  active={activePage === "network"}
                  onClick={() => handleNavigation("network")}
                />
                <NavItem
                  icon={<Cable size={18} />}
                  label="Connections"
                  active={activePage === "connections"}
                  onClick={() => handleNavigation("connections")}
                />
                <NavItem
                  icon={<Settings size={18} />}
                  label="Settings"
                  active={activePage === "settings"}
                  onClick={() => handleNavigation("settings")}
                />
              </>
            ) : (
              <>
                <li className="mb-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-center ${
                      activePage === "dashboard"
                        ? "bg-metricly-accent/10 text-metricly-accent"
                        : "hover:bg-metricly-secondary/70 text-gray-300 hover:text-white"
                    }`}
                    onClick={() => handleNavigation("dashboard")}
                  >
                    <LayoutDashboard size={20} />
                  </Button>
                </li>
                <li className="mb-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-center ${
                      activePage === "servers"
                        ? "bg-metricly-accent/10 text-metricly-accent"
                        : "hover:bg-metricly-secondary/70 text-gray-300 hover:text-white"
                    }`}
                    onClick={() => handleNavigation("servers")}
                  >
                    <Server size={20} />
                  </Button>
                </li>
                <li className="mb-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-center ${
                      activePage === "containers"
                        ? "bg-metricly-accent/10 text-metricly-accent"
                        : "hover:bg-metricly-secondary/70 text-gray-300 hover:text-white"
                    }`}
                    onClick={() => handleNavigation("containers")}
                  >
                    <Box size={20} />
                  </Button>
                </li>
                <li className="mb-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-center ${
                      activePage === "metrics"
                        ? "bg-metricly-accent/10 text-metricly-accent"
                        : "hover:bg-metricly-secondary/70 text-gray-300 hover:text-white"
                    }`}
                    onClick={() => handleNavigation("metrics")}
                  >
                    <Activity size={20} />
                  </Button>
                </li>
                <li className="mb-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-center ${
                      activePage === "history"
                        ? "bg-metricly-accent/10 text-metricly-accent"
                        : "hover:bg-metricly-secondary/70 text-gray-300 hover:text-white"
                    }`}
                    onClick={() => handleNavigation("history")}
                  >
                    <History size={20} />
                  </Button>
                </li>
                <li className="mb-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-center ${
                      activePage === "network"
                        ? "bg-metricly-accent/10 text-metricly-accent"
                        : "hover:bg-metricly-secondary/70 text-gray-300 hover:text-white"
                    }`}
                    onClick={() => handleNavigation("network")}
                  >
                    <Network size={20} />
                  </Button>
                </li>
                <li className="mb-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-center ${
                      activePage === "connections"
                        ? "bg-metricly-accent/10 text-metricly-accent"
                        : "hover:bg-metricly-secondary/70 text-gray-300 hover:text-white"
                    }`}
                    onClick={() => handleNavigation("connections")}
                  >
                    <Cable size={20} />
                  </Button>
                </li>
                <li className="mb-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-center ${
                      activePage === "settings"
                        ? "bg-metricly-accent/10 text-metricly-accent"
                        : "hover:bg-metricly-secondary/70 text-gray-300 hover:text-white"
                    }`}
                    onClick={() => handleNavigation("settings")}
                  >
                    <Settings size={20} />
                  </Button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      <div className="p-3 border-t border-overlay0/30 flex flex-col gap-2">
        <Button
          variant="ghost"
          className="w-full justify-center"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span className="ml-2">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </Button>

        <Button
          variant="ghost"
          className={`w-full hover:bg-red/20 text-red hover:text-red ${
            collapsed ? "justify-center" : "justify-start"
          }`}
          onClick={() => navigate('/login')}
        >
          <LogOut size={18} className={collapsed ? "" : "mr-2"} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
