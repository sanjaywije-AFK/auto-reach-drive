import { Navigate, useLocation } from "react-router-dom";
import { useAuth, homeForRole } from "@/context/AuthContext";
import type { AppRole } from "@/lib/autoreach";
import { Loader2 } from "lucide-react";

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function ProtectedRoute({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow?: AppRole[];
}) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  if (allow && !role) return <FullPageLoader />;
  if (allow && role && !allow.includes(role)) return <Navigate to={homeForRole(role)} replace />;
  return <>{children}</>;
}
