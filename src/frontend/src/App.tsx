import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { AppLayout } from './components/AppLayout';
import SessionsPage from './pages/SessionsPage';
import SessionDetailPage from './pages/SessionDetailPage';

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: SessionsPage,
});

const sessionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/session/$sessionId',
  component: SessionDetailPage,
});

const routeTree = rootRoute.addChildren([indexRoute, sessionDetailRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
