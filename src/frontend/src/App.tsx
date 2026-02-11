import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import { getRememberLoginPreference } from './hooks/useRememberLoginPreference';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import ConnectPage from './pages/ConnectPage';
import PttPage from './pages/PttPage';
import ActivityPage from './pages/ActivityPage';
import DirectoryPage from './pages/DirectoryPage';
import SettingsPage from './pages/SettingsPage';
import AboutCompliancePage from './pages/AboutCompliancePage';
import AuthGate from './components/AuthGate';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import AppErrorBoundary from './components/AppErrorBoundary';
import { loadConnection } from './hooks/usePreferredConnection';

function PostLoginRedirector() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  useEffect(() => {
    // Only run after auth is ready and profile is fetched
    if (isInitializing || profileLoading || !isFetched) return;

    const isAuthenticated = !!identity;
    const hasProfile = userProfile !== null;
    const hasSavedConnection = loadConnection() !== null;

    // Don't redirect if already on /connect (prevent loops)
    if (location.pathname === '/connect') return;

    // Check if we've already redirected this session for this principal
    const principal = identity?.getPrincipal().toString();
    if (principal) {
      const redirectKey = `pttstar_redirected_${principal}`;
      const hasRedirected = sessionStorage.getItem(redirectKey);
      
      if (hasRedirected) return;

      // Guide first-time signed-in users with no saved connection to Connect page with BrandMeister preset
      if (isAuthenticated && hasProfile && !hasSavedConnection) {
        console.log('PostLoginRedirector: Navigating to /connect with BrandMeister preset');
        sessionStorage.setItem(redirectKey, 'true');
        navigate({ to: '/connect', search: { preset: 'brandmeister-dmr' } });
      }
    }
  }, [identity, isInitializing, userProfile, profileLoading, isFetched, navigate, location.pathname]);

  return null;
}

function RootLayout() {
  return (
    <AppLayout>
      <PostLoginRedirector />
      <Outlet />
    </AppLayout>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const connectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/connect',
  component: () => (
    <AuthGate>
      <ConnectPage />
    </AuthGate>
  ),
});

const pttRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ptt',
  component: () => (
    <AuthGate>
      <PttPage />
    </AuthGate>
  ),
});

const activityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activity',
  component: () => (
    <AuthGate>
      <ActivityPage />
    </AuthGate>
  ),
});

const directoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/directory',
  component: () => (
    <AuthGate>
      <DirectoryPage />
    </AuthGate>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <AuthGate>
      <SettingsPage />
    </AuthGate>
  ),
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutCompliancePage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  connectRoute,
  pttRoute,
  activityRoute,
  directoryRoute,
  settingsRoute,
  aboutRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity, isInitializing, clear } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const rememberLoginCheckedRef = useRef(false);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Check remember login preference on startup (only once)
  useEffect(() => {
    if (!isInitializing && identity && !rememberLoginCheckedRef.current) {
      rememberLoginCheckedRef.current = true;
      const rememberLogin = getRememberLoginPreference();
      
      // If remember login is OFF and user is authenticated, clear the session
      if (!rememberLogin) {
        console.log('App: Remember login is OFF, clearing session');
        clear();
        queryClient.clear();
      }
    }
  }, [isInitializing, identity, clear, queryClient]);

  const handleClearSession = async () => {
    console.log('App: Clearing session from error boundary');
    await clear();
    queryClient.clear();
  };

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-foreground">PTTStar</div>
          <div className="text-muted-foreground">Initializing...</div>
        </div>
      </div>
    );
  }

  return (
    <AppErrorBoundary onClearSession={handleClearSession}>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupDialog />}
    </AppErrorBoundary>
  );
}
