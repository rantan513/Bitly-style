import type { RouteObject } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/home/page";
import Login from "@/pages/auth/login/page";
import Signup from "@/pages/auth/signup/page";
import AuthCallback from "@/pages/auth/callback/page";
import ForgotPassword from "@/pages/auth/forgot-password/page";
import ResetPassword from "@/pages/auth/reset-password/page";
import Dashboard from "@/pages/dashboard/page";
import LinkAnalytics from "@/pages/dashboard/link-analytics/page";
import DashboardAnalytics from "@/pages/dashboard/analytics/page";
import Compare from "@/pages/dashboard/compare/page";
import Settings from "@/pages/dashboard/settings/page";
import RedirectPage from "@/pages/redirect/page";
import { AuthGuard } from "@/components/feature/AuthGuard";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/r/:slug",
    element: <RedirectPage />,
  },
  {
    path: "/:slug",
    element: <RedirectPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/auth/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/dashboard",
    element: (
      <AuthGuard>
        <Dashboard />
      </AuthGuard>
    ),
  },
  {
    path: "/dashboard/analytics",
    element: (
      <AuthGuard>
        <DashboardAnalytics />
      </AuthGuard>
    ),
  },
  {
    path: "/dashboard/compare",
    element: (
      <AuthGuard>
        <Compare />
      </AuthGuard>
    ),
  },
  {
    path: "/dashboard/settings",
    element: (
      <AuthGuard>
        <Settings />
      </AuthGuard>
    ),
  },
  {
    path: "/dashboard/links/:id",
    element: (
      <AuthGuard>
        <LinkAnalytics />
      </AuthGuard>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;