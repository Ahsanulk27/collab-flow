import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  FolderPlus,
  MessageCircle,
  PenTool,
  User,
  Layout,
  LogOut,
} from "lucide-react";
import Logo from "./Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
}

const API_BASE = import.meta.env.VITE_API_BASE;

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Layout, label: "All Workspaces", path: "/dashboard" },
  { icon: FolderPlus, label: "Create Workspace", path: "/dashboard/new" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: PenTool, label: "Whiteboard", path: "/whiteboard" },
  { icon: User, label: "Profile", path: "/profile" },
];

const handleLogout = () => {
  const navigate = useNavigate();
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  navigate("/login");
};

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <aside className="w-64 h-screen bg-white/60 backdrop-blur-xl border-r border-white/40 flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6">
        <Logo />
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="p-4 border-t border-border/50 space-y-3">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-10 w-10">
              {user.profileImage ? (
                <AvatarImage src={user.profileImage} />
              ) : (
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Logout button */}
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      )}
    </aside>
  );
};

export default DashboardSidebar;
