import { Link, useRouterState } from '@tanstack/react-router';
import { Radio, Wifi, Activity, Settings, Info } from 'lucide-react';
import LoginButton from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { identity } = useInternetIdentity();
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
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/generated/pttstar-logo.dim_512x512.png" alt="PTTStar" className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight text-foreground">PTTStar</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <LoginButton />
        </div>
      </header>

      {/* Main Content with dark page background */}
      <main className="flex-1 bg-background">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
        <div className="flex items-center justify-around">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors ${
                  isActive ? 'text-accent-foreground' : 'text-muted-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-status-active' : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 pb-20 md:pb-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} PTTStar. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'pttstar'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline hover:text-accent-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
