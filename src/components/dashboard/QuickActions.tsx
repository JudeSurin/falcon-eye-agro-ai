import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Zap, 
  MapPin, 
  Camera, 
  BarChart3, 
  Satellite,
  Target,
  Radio,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    id: 1,
    title: "Deploy Falcon",
    subtitle: "Launch reconnaissance mission",
    icon: Zap,
    variant: "primary" as const,
    urgent: true,
  },
  {
    id: 2,
    title: "Mark Waypoint",
    subtitle: "Set tactical coordinates",
    icon: MapPin,
    variant: "secondary" as const,
  },
  {
    id: 3,
    title: "Capture Intel",
    subtitle: "High-resolution surveillance",
    icon: Camera,
    variant: "secondary" as const,
  },
  {
    id: 4,
    title: "Analysis Report",
    subtitle: "Generate AI assessment",
    icon: BarChart3,
    variant: "secondary" as const,
  },
  {
    id: 5,
    title: "Satellite View",
    subtitle: "Orbital intelligence feed",
    icon: Satellite,
    variant: "secondary" as const,
  },
  {
    id: 6,
    title: "Target Lock",
    subtitle: "Focus area monitoring",
    icon: Target,
    variant: "secondary" as const,
  },
];

export default function QuickActions() {
  return (
    <Card className="p-6 card-glass">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Command Center</h3>
          <p className="text-sm text-muted-foreground">Quick deployment actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-success animate-mission-pulse" />
          <span className="text-sm text-success font-medium">Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          
          return (
            <Button
              key={action.id}
              variant="outline"
              className={cn(
                "h-auto p-4 flex flex-col items-center gap-3 relative",
                "hover:scale-105 transition-all duration-300",
                action.variant === "primary" ? "btn-command border-primary/30" : "hover:border-primary/30",
                action.urgent && "ring-2 ring-primary/20 animate-mission-pulse"
              )}
            >
              {action.urgent && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 bg-alert rounded-full animate-ping"></div>
                  <div className="absolute top-0 w-3 h-3 bg-alert rounded-full"></div>
                </div>
              )}
              
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                action.variant === "primary" ? "bg-primary/20 text-primary" : "bg-secondary/10 text-secondary"
              )}>
                <IconComponent className="h-4 w-4" />
              </div>
              
              <div className="text-center">
                <div className="text-sm font-semibold text-foreground">{action.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{action.subtitle}</div>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Mission Status Bar */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Active Surveillance</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>3 Drones Online</span>
            <span>•</span>
            <span>Coverage: 847 acres</span>
            <span>•</span>
            <span className="text-success">All Systems Operational</span>
          </div>
        </div>
      </div>
    </Card>
  );
}