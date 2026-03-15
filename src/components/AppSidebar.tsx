/**
 * AppSidebar — Main navigation sidebar with role-based menu items.
 * 
 * Regular users see all navigation items (speakers, mentors, etc.).
 * Role-specific users (speaker, mentor, catering, community) see their dashboard + messages.
 */
import { useMemo, useCallback } from "react";
import { LayoutDashboard, Mic, Users, UtensilsCrossed, Globe, Sparkles, MessageCircle, UserCircle, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const allNavItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Spikerlər", url: "/speakers", icon: Mic },
  { title: "Mentorlar", url: "/mentors", icon: Users },
  { title: "Catering", url: "/catering", icon: UtensilsCrossed },
  { title: "İcmalar", url: "/communities", icon: Globe },
  { title: "Mesajlar", url: "/messages", icon: MessageCircle },
];

const dashboardRoutes: Record<string, { url: string; title: string; icon: LucideIcon }> = {
  speaker: { url: "/dashboard/speaker", title: "Spiker Paneli", icon: Mic },
  mentor: { url: "/dashboard/mentor", title: "Mentor Paneli", icon: Users },
  catering: { url: "/dashboard/catering", title: "Catering Paneli", icon: UtensilsCrossed },
  community: { url: "/dashboard/community", title: "İcma Paneli", icon: Globe },
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { role, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate("/login");
  }, [signOut, navigate]);

  const roleItem = useMemo(
    () => (role && role !== "user" ? dashboardRoutes[role] : null),
    [role]
  );

  const isRegularUser = !role || role === "user";
  const navItems = useMemo(
    () => isRegularUser ? allNavItems : [{ title: "Mesajlar", url: "/messages", icon: MessageCircle }],
    [isRegularUser]
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="px-4 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-sm">C</span>
        </div>
        {!collapsed && <span className="font-semibold text-foreground text-sm tracking-tight">Commas</span>}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Role-specific dashboard link for non-user roles */}
              {roleItem && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to={roleItem.url} end
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === roleItem.url ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                      activeClassName="bg-accent text-accent-foreground">
                      <UserCircle size={18} strokeWidth={1.5} />
                      {!collapsed && <span>{roleItem.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === item.url ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                      activeClassName="bg-accent text-accent-foreground">
                      <item.icon size={18} strokeWidth={1.5} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* AI Assistant link */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/ai-assistant" end
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === "/ai-assistant" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    activeClassName="bg-accent text-accent-foreground">
                    <Sparkles size={18} strokeWidth={1.5} />
                    {!collapsed && <span>AI Assistant</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && (
        <SidebarFooter className="p-3">
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start text-muted-foreground hover:text-foreground">
            <LogOut size={16} className="mr-2" />
            {!collapsed && <span className="text-sm">Çıxış</span>}
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
