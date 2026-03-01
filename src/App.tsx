import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth, Permission } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import JobPostings from "./pages/JobPostings";
import Applicants from "./pages/Applicants";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/** Redirects unauthenticated users to /login */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Redirects authenticated users away from /login */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** Renders children only if user has the required permission, otherwise redirects to / */
function RoleRoute({ permission, children }: { permission: Permission; children: React.ReactNode }) {
  const { can } = useAuth();
  if (!can(permission)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />

            {/* Protected + role-gated */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<RoleRoute permission="view:dashboard"><Dashboard /></RoleRoute>} />
              <Route path="/jobs" element={<RoleRoute permission="view:jobs"><JobPostings /></RoleRoute>} />
              <Route path="/applicants" element={<RoleRoute permission="view:applicants"><Applicants /></RoleRoute>} />
              <Route path="/reports" element={<RoleRoute permission="view:reports"><Reports /></RoleRoute>} />
              <Route path="/settings" element={<RoleRoute permission="view:settings"><Settings /></RoleRoute>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
