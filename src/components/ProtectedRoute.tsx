import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children, userOnly }: { children: React.ReactNode; userOnly?: boolean }) {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If userOnly, only regular users can access; other roles get redirected to their dashboard
  if (userOnly && role && role !== "user") {
    const dashboardMap: Record<string, string> = {
      speaker: "/dashboard/speaker",
      mentor: "/dashboard/mentor",
      catering: "/dashboard/catering",
      community: "/dashboard/community",
    };
    return <Navigate to={dashboardMap[role] || "/"} replace />;
  }

  return <>{children}</>;
}
