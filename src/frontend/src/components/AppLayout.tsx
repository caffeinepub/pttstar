import { Link, useRouterState } from '@tanstack/react-router';
import { Radio, Wifi, Activity, Settings, Info } from 'lucide-react';
import LoginButton from './LoginButton';
import InstallAppAction from './InstallAppAction';
import { useRegeneratedAuth } from '../auth/iiAuthProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { identity } = useRegeneratedAuth();
  const isAuthenticated = !!identity;

  const navItems = [
    { path: '/connect', label: 'Connect', icon: Wifi, authRequired: true },
    { path: '/ptt', label: 'PTT', icon: Radio, authRequired: true },
    { path: '/activity', label: 'Activity', icon: Activity, authRequired: true },
    { path: '/settings', label: 'Settings', icon: Settings, authRequired: true },
    { path: '/about', label: 'About', icon: Info, authRequired: false },
  ];

  const visibleNavItems = navItems.filter((item) => !item.authRequired || isAuthenticated);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Compact Console Header */}
      <header className="border-b border-border bg-card shadow-console">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/generated/pttstar-logo.dim_512x512.png" alt="PTTStar" className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight text-foreground">PTTStar</span>
          </Link>

          {/* Desktop Navigation - Compact */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <InstallAppAction />
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Compact Console Footer */}
      <footer className="border-t border-border bg-card py-4 shadow-console">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
            <div className="font-semibold text-foreground">KO4RXE — Creator & Developer</div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <span>© {new Date().getFullYear()} PTTStar</span>
              <span className="hidden sm:inline">•</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'pttstar'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                Built with ❤️ using caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-console md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 rounded px-3 py-1.5 text-xs transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px] font-medium uppercase tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
