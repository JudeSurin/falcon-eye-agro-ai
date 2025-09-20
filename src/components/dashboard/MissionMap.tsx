import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Zap, Activity, AlertTriangle, Target, Satellite, QrCode, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader } from "@googlemaps/js-api-loader";

// Mock data for agricultural zones
const mockZones = [
  { id: 1, name: "North Field", health: 85, status: "secure", x: 25, y: 30, image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&h=150" },
  { id: 2, name: "South Field", health: 92, status: "secure", x: 70, y: 60, image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150" },
  { id: 3, name: "East Orchard", health: 67, status: "monitor", x: 80, y: 25, image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=200&h=150" },
  { id: 4, name: "West Crops", health: 45, status: "alert", x: 15, y: 70, image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=150" },
  { id: 5, name: "Central Farm", health: 28, status: "critical", x: 50, y: 45, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=150" },
];

const statusConfig = {
  secure: { color: "success", bgColor: "bg-success", icon: Activity },
  monitor: { color: "warning", bgColor: "bg-warning", icon: AlertTriangle },
  alert: { color: "alert", bgColor: "bg-alert", icon: AlertTriangle },
  critical: { color: "critical", bgColor: "bg-critical", icon: AlertTriangle },
};

interface BarcodePoint {
  id: number;
  x: number;
  y: number;
  order: number;
}

export default function MissionMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<HTMLDivElement>(null);
  const [showSatellite, setShowSatellite] = useState(false);
  const [showBarcodeTracker, setShowBarcodeTracker] = useState(false);
  const [barcodePoints, setBarcodePoints] = useState<BarcodePoint[]>([]);
  const [mapInstance, setMapInstance] = useState<any>(null);

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!showBarcodeTracker || barcodePoints.length >= 10) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    const newPoint: BarcodePoint = {
      id: Date.now(),
      x,
      y,
      order: barcodePoints.length + 1
    };
    
    setBarcodePoints(prev => [...prev, newPoint]);
  };

  const clearBarcodePoints = () => {
    setBarcodePoints([]);
  };

  // Initialize Google Maps
  useEffect(() => {
    if (!googleMapRef.current || mapInstance) return;

    const loader = new Loader({
      apiKey: "AIzaSyAJGjJcU4nXG2-PKEUT_xcqquIJSRt8Qj4",
      version: "weekly",
    });

    loader.load().then(() => {
      const map = new google.maps.Map(googleMapRef.current!, {
        center: { lat: 40.7128, lng: -74.0060 },
        zoom: 15,
        mapTypeId: showSatellite ? 'satellite' : 'hybrid',
        styles: [
          {
            featureType: "all",
            stylers: [{ saturation: -20 }, { lightness: 10 }]
          }
        ]
      });

      // Add markers for agricultural zones
      mockZones.forEach((zone) => {
        const marker = new google.maps.Marker({
          position: { lat: 40.7128 + (zone.x - 50) * 0.01, lng: -74.0060 + (zone.y - 50) * 0.01 },
          map,
          title: zone.name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="${
                  zone.status === 'secure' ? '#10b981' :
                  zone.status === 'monitor' ? '#f59e0b' :
                  zone.status === 'alert' ? '#f97316' : '#ef4444'
                }" stroke="white" stroke-width="2"/>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(24, 24)
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0; font-weight: bold;">${zone.name}</h3>
              <p style="margin: 4px 0; color: #666;">Health: ${zone.health}%</p>
              <p style="margin: 4px 0; color: #666;">Status: ${zone.status.toUpperCase()}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });

      setMapInstance(map);
    }).catch(() => {
      // Fallback to tactical map if Google Maps fails to load
      console.log('Google Maps failed to load, using fallback');
    });
  }, [showSatellite]);

  // Toggle map type
  const toggleMapType = () => {
    if (mapInstance) {
      const newType = showSatellite ? 'hybrid' : 'satellite';
      mapInstance.setMapTypeId(newType);
      setShowSatellite(!showSatellite);
    }
  };

  return (
    <Card className="p-6 card-tactical">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Tactical Overview</h3>
          <p className="text-sm text-muted-foreground">Real-time agricultural intelligence</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="hover:border-primary/30">
            <MapPin className="h-4 w-4 mr-2" />
            Mark Waypoint
          </Button>
          <Button size="sm" variant="outline" className="hover:border-primary/30" onClick={() => setShowBarcodeTracker(!showBarcodeTracker)}>
            <QrCode className="h-4 w-4 mr-2" />
            Barcode Tracker
          </Button>
          {showBarcodeTracker && (
            <Button size="sm" variant="destructive" onClick={clearBarcodePoints}>
              <X className="h-4 w-4 mr-2" />
              Clear Points
            </Button>
          )}
          <Button size="sm" className="btn-command">
            <Zap className="h-4 w-4 mr-2" />
            Deploy Mission
          </Button>
        </div>
      </div>

      {/* Map Toggle Bar */}
      <div className="mb-4 flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2">
          <Satellite className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Map View</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={toggleMapType}
          className="hover:border-primary/30"
        >
          {showSatellite ? 'Hybrid View' : 'Satellite View'}
        </Button>
      </div>

      {/* Map Container */}
      <div className="relative h-96 rounded-xl border border-primary/20 overflow-hidden">
        {showBarcodeTracker && (
          <div className="absolute top-2 left-2 z-20 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium">
            Click to place waypoints ({barcodePoints.length}/10)
          </div>
        )}
        
        {/* Google Maps */}
        <div ref={googleMapRef} className="absolute inset-0 w-full h-full" />
        
        {/* Fallback Tactical Map */}
        <div 
          ref={mapRef}
          className="absolute inset-0 bg-gradient-to-br from-success/5 to-secondary/5 cursor-pointer"
          style={{ display: mapInstance ? 'none' : 'block' }}
          onClick={handleMapClick}
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

              {/* Zone Info Popup with Image */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 min-w-[200px] border border-border/50">
                  <img 
                    src={zone.image} 
                    alt={zone.name}
                    className="w-full h-20 object-cover rounded-md mb-2"
                  />
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

        {/* Barcode Tracker Points */}
        {barcodePoints.map((point) => (
          <div
            key={point.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            {/* Point Marker */}
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold border-2 border-white shadow-lg group-hover:scale-125 transition-transform duration-200">
              {point.order}
            </div>

            {/* Point Info Popup */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 min-w-[160px] border border-border/50">
                <img 
                  src="https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=200&h=120"
                  alt={`Waypoint ${point.order}`}
                  className="w-full h-16 object-cover rounded-md mb-2"
                />
                <h4 className="font-semibold text-sm text-foreground">Waypoint {point.order}</h4>
                <p className="text-xs text-muted-foreground">Barcode tracking point</p>
              </div>
            </div>

            {/* Connection line to next point */}
            {point.order < barcodePoints.length && (
              <svg className="absolute top-0 left-0 w-screen h-screen pointer-events-none -z-10">
                {(() => {
                  const nextPoint = barcodePoints.find(p => p.order === point.order + 1);
                  if (!nextPoint) return null;
                  
                  return (
                    <line
                      x1={`${point.x}%`}
                      y1={`${point.y}%`}
                      x2={`${nextPoint.x}%`}
                      y2={`${nextPoint.y}%`}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  );
                })()}
              </svg>
            )}
          </div>
        ))}

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