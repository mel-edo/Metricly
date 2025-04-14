import React, { createContext, useContext } from "react";

// Only supporting dark theme for now
type Theme = "dark";

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface ThemeProviderState {
  theme: Theme;
  // Placeholder function for future theme switching
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  // Always use dark theme
  const theme: Theme = "dark";

  // Apply dark theme to document
  React.useEffect(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }, []);

  // Placeholder function for future theme switching
  const handleThemeChange = () => {
    console.log("Theme switching is not supported yet");
  };

  const value = {
    theme,
    setTheme: () => handleThemeChange(),
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
