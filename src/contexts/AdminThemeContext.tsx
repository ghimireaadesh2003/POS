import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface AdminThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType>({ theme: 'light', toggleTheme: () => {} });

export const useAdminTheme = () => useContext(AdminThemeContext);

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('admin-theme');
    return (saved === 'dark' ? 'dark' : 'light') as Theme;
  });

  useEffect(() => {
    localStorage.setItem('admin-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
};
