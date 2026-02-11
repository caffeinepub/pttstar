import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
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

function RootLayout() {
  return (
    <AppLayout>
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
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

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
    <>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupDialog />}
    </>
  );
}
