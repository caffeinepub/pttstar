import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { useRegeneratedAuth } from './auth/iiAuthProvider';
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
import PostLoginInterstitial from './components/PostLoginInterstitial';
import AuthenticatedFlowFallback from './components/AuthenticatedFlowFallback';
import { loadConnection } from './hooks/usePreferredConnection';
import { captureGatewayParameters } from './utils/gatewayUrlBootstrap';
import { useActorWithError } from './hooks/useActorWithError';
import { RegeneratedAuthProvider } from './auth/iiAuthProvider';

function PostLoginRedirector() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity, isInitializing } = useRegeneratedAuth();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  useEffect(() => {
    // Only run after auth is ready and profile is fetched
    if (isInitializing || profileLoading || !isFetched) return;

    const isAuthenticated = !!identity;
    const hasProfile = userProfile !== null;

    // Short-circuit if in first-time onboarding state (authenticated + profile fetched + profile === null)
    // The ProfileSetupDialog will handle this state; no redirect should occur
    if (isAuthenticated && !hasProfile) {
      console.log('PostLoginRedirector: First-time onboarding state detected, skipping redirect');
      return;
    }

    const hasSavedConnection = loadConnection() !== null;

    // Don't redirect if already on /connect (prevent loops)
    if (location.pathname === '/connect') return;

    // Check if we've already redirected this session for this principal
    const principal = identity?.getPrincipal().toString();
    if (principal) {
      const redirectKey = `pttstar_redirected_${principal}`;
      const hasRedirected = sessionStorage.getItem(redirectKey);
      
      if (hasRedirected) return;

      // Guide first-time signed-in users with profile but no saved connection to Connect page with BrandMeister preset
      if (isAuthenticated && hasProfile && !hasSavedConnection) {
        console.log('PostLoginRedirector: Navigating to /connect with BrandMeister preset (replace)');
        sessionStorage.setItem(redirectKey, 'true');
        navigate({ to: '/connect', search: { preset: 'brandmeister-dmr' }, replace: true });
      }
    }
  }, [identity, isInitializing, userProfile, profileLoading, isFetched, navigate, location.pathname]);

  return null;
}

function RootLayout() {
  const { identity, isInitializing, clear } = useRegeneratedAuth();
  const { actor: actorWithError, isError: actorError, error: actorErrorObj } = useActorWithError();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched, error: profileError, refetch: refetchProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  
  // Show interstitial when authenticated but profile state is not yet confirmed AND no errors
  const showInterstitial = isAuthenticated && !isInitializing && (profileLoading || !profileFetched) && !actorError && !profileError;
  
  // Show error fallback when authenticated and either actor or profile failed
  const showErrorFallback = isAuthenticated && !isInitializing && (actorError || profileError);

  const handleRetry = () => {
    console.log('RootLayout: Retrying actor and profile initialization');
    queryClient.invalidateQueries({ queryKey: ['actor'] });
    queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    refetchProfile();
  };

  const handleClearSession = async () => {
    console.log('RootLayout: Clearing session from error fallback');
    await clear();
    queryClient.clear();
  };

  return (
    <AppLayout>
      <PostLoginRedirector />
      {showInterstitial && (
        <PostLoginInterstitial 
          onRetry={handleRetry}
          onClearSession={handleClearSession}
        />
      )}
      {showErrorFallback && (
        <AuthenticatedFlowFallback
          error={actorErrorObj || profileError || new Error('Initialization failed')}
          context="backend initialization"
          onRetry={handleRetry}
          onClearSession={handleClearSession}
        />
      )}
      {!showErrorFallback && <Outlet />}
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

function AppContent() {
  const { identity, isInitializing, clear } = useRegeneratedAuth();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const rememberLoginCheckedRef = useRef(false);
  const gatewayBootstrapRef = useRef(false);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Capture gateway URL parameters on app startup (once)
  useEffect(() => {
    if (!gatewayBootstrapRef.current) {
      gatewayBootstrapRef.current = true;
      captureGatewayParameters();
    }
  }, []);

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

export default function App() {
  return (
    <RegeneratedAuthProvider>
      <AppContent />
    </RegeneratedAuthProvider>
  );
}
