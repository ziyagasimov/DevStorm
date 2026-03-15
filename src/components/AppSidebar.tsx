import { LayoutDashboard, Mic, Users, UtensilsCrossed, Globe, Sparkles } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Speakers", url: "/speakers", icon: Mic },
  { title: "Mentors", url: "/mentors", icon: Users },
  { title: "Catering Companies", url: "/catering", icon: UtensilsCrossed },
  { title: "Communities", url: "/communities", icon: Globe },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="px-4 py-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-sm">CF</span>
        </div>
        {!collapsed && (
          <span className="font-semibold text-foreground text-sm tracking-tight">CommunityForge</span>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                        activeClassName="bg-accent text-accent-foreground"
                      >
                        <item.icon size={18} strokeWidth={1.5} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* AI Assistant - Coming Soon */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/ai-assistant"
                    end
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === "/ai-assistant"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    activeClassName="bg-accent text-accent-foreground"
                  >
                    <Sparkles size={18} strokeWidth={1.5} />
                    {!collapsed && (
                      <div className="flex items-center justify-between flex-1">
                        <span>AI Assistant</span>
                        <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 bg-secondary text-muted-foreground rounded">
                          Soon
                        </span>
                      </div>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
