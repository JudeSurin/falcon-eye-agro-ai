import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Zap, Activity, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for agricultural zones
const mockZones = [
  { id: 1, name: "North Field", health: 85, status: "secure", x: 25, y: 30 },
  { id: 2, name: "South Field", health: 92, status: "secure", x: 70, y: 60 },
  { id: 3, name: "East Orchard", health: 67, status: "monitor", x: 80, y: 25 },
  { id: 4, name: "West Crops", health: 45, status: "alert", x: 15, y: 70 },
  { id: 5, name: "Central Farm", health: 28, status: "critical", x: 50, y: 45 },
];

const statusConfig = {
  secure: { color: "success", bgColor: "bg-success", icon: Activity },
  monitor: { color: "warning", bgColor: "bg-warning", icon: AlertTriangle },
  alert: { color: "alert", bgColor: "bg-alert", icon: AlertTriangle },
  critical: { color: "critical", bgColor: "bg-critical", icon: AlertTriangle },
};

export default function MissionMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  return (
    <Card className="p-6 card-tactical">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Tactical Overview</h3>
          <p className="text-sm text-muted-foreground">Real-time agricultural intelligence</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="btn-command">
            <Zap className="h-4 w-4 mr-2" />
            Deploy Mission
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef}
        className="relative h-96 bg-gradient-to-br from-success/5 to-secondary/5 rounded-xl border border-primary/20 overflow-hidden"
      >
        {/* Tactical Grid Overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Agricultural Zones */}
        {mockZones.map((zone) => {
          const config = statusConfig[zone.status as keyof typeof statusConfig];
          const IconComponent = config.icon;
          
          return (
            <div
              key={zone.id}
              className={cn(
                "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group",
                `left-[${zone.x}%] top-[${zone.y}%]`
              )}
              style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
            >
              {/* Zone Marker */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                config.bgColor,
                "text-white shadow-lg border-2 border-white/20",
                "group-hover:scale-125 transition-transform duration-200"
              )}>
                <IconComponent className="h-4 w-4" />
              </div>

              {/* Zone Info Popup */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 min-w-[160px] border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm text-foreground">{zone.name}</h4>
                    <Badge variant="outline" className={`status-${zone.status} text-xs`}>
                      {zone.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Health:</span>
                    <span className={cn(
                      "text-xs font-medium",
                      zone.health >= 80 ? "text-success" :
                      zone.health >= 60 ? "text-warning" :
                      zone.health >= 40 ? "text-alert" : "text-critical"
                    )}>
                      {zone.health}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Scanning Effect */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"></div>
            </div>
          );
        })}

        {/* Active Mission Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="missionPath" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path
            d="M 25% 30% Q 50% 10% 80% 25%"
            stroke="url(#missionPath)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            className="animate-tactical-scan"
          />
        </svg>
      </div>

      {/* Map Legend */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <div className="flex gap-4">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", config.bgColor)}></div>
              <span className="text-xs text-muted-foreground capitalize">{status}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </Card>
  );
}