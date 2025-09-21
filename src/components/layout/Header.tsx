import { Bell, Settings, User, Shield, Zap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import falconLogo from "@/assets/falcon-logo.png";
import { useAuthStore } from "@/store/authStore";
import { useAuth0 } from "@auth0/auth0-react";

export default function Header() {
  const { user, logout } = useAuthStore();
  const { logout: auth0Logout } = useAuth0();

  const handleLogout = () => {
    logout();
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin + '/auth'
      }
    });
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <img src={falconLogo} alt="HoverFly" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-bold text-foreground">HoverFly</h1>
            <p className="text-xs text-muted-foreground font-medium">Elite Aerial Intelligence</p>
          </div>
        </div>

        {/* System Status */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-mission-pulse"></div>
            <span className="text-sm font-medium text-success">System Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-secondary" />
            <span className="text-sm text-muted-foreground">3 Active Missions</span>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-alert">
              2
            </Badge>
          </Button>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                {user?.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium">
                  {user?.name || 'Pilot Alpha'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                Security
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}