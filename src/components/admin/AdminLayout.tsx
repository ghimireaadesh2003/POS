import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Grid3X3, UtensilsCrossed, ChefHat, BarChart3, Package, Users, Settings, Menu, X, Bell, Building2, Sun, Moon, LogOut, CalendarDays } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationPanel from '@/components/admin/NotificationPanel';
import { useAdminTheme } from '@/contexts/AdminThemeContext';
import { useAuth } from '@/contexts/AuthContext';
const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Live Orders', icon: ShoppingCart, path: '/admin/orders' },
  { label: 'Tables', icon: Grid3X3, path: '/admin/tables' },
  { label: 'Kitchen', icon: ChefHat, path: '/admin/kitchen' },
  { label: 'Menu', icon: UtensilsCrossed, path: '/admin/menu' },
  { label: 'Reservations', icon: CalendarDays, path: '/admin/reservations' },
  { label: 'Inventory', icon: Package, path: '/admin/inventory' },
  { label: 'Outlets', icon: Building2, path: '/admin/outlets' },
  { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { label: 'Customers', icon: Users, path: '/admin/customers' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useAdminTheme();
  const { signOut, user } = useAuth();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const SidebarContent = ({ isMobile }: { isMobile?: boolean }) => (
    <>
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        {!isMobile && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-sidebar-foreground hidden md:block">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
        {(sidebarOpen || isMobile) && (
          <div>
            <h1 className="font-display text-lg font-semibold">EMBER</h1>
            <p className="text-xs text-sidebar-foreground/50">Management</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map(item => {
          const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {(sidebarOpen || isMobile) && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {(sidebarOpen || isMobile) && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-semibold">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email || 'Admin'}</p>
              <p className="text-xs text-sidebar-foreground/50">Admin</p>
            </div>
            <button
              onClick={() => signOut()}
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className={`min-h-screen bg-background flex ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Desktop Sidebar */}
      <aside className={`bg-sidebar text-sidebar-foreground flex-shrink-0 transition-all duration-300 hidden md:flex flex-col border-r border-sidebar-border ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar text-sidebar-foreground flex flex-col shadow-2xl">
            <SidebarContent isMobile />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 md:px-6 py-3 flex items-center justify-between">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
