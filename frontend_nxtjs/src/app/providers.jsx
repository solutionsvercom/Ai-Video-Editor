"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Toaster } from "@/components/ui/toaster";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { queryClientInstance } from "@/lib/query-client";

function mapPathToPageName(pathname) {
  if (pathname === "/") return "Welcome";
  if (pathname === "/login") return "Login";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/projects") return "Projects";
  if (pathname === "/templates") return "Templates";
  if (pathname === "/music-library") return "MusicLibrary";
  if (pathname === "/image-generator") return "ImageGenerator";
  if (pathname === "/create-project") return "CreateProject";
  if (pathname === "/settings") return "Settings";
  if (pathname === "/account") return "Account";
  if (pathname.startsWith("/editor/")) return "Editor";
  if (pathname.startsWith("/export/")) return "Export";
  return "";
}

function Guard({ children }) {
  const pathname = usePathname();
  const currentPageName = useMemo(() => mapPathToPageName(pathname), [pathname]);

  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const isPublicRoute = pathname === "/" || pathname === "/login";

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === "user_not_registered") return <UserNotRegisteredError />;
    if (authError.type === "auth_required" && !isPublicRoute) {
      navigateToLogin();
      return null;
    }
  }

  return <Layout currentPageName={currentPageName}>{children}</Layout>;
}

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Guard>{children}</Guard>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

