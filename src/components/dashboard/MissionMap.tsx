import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Zap, Activity, AlertTriangle, Target, Satellite, QrCode, X, Camera, BarChart3, Settings, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader } from "@googlemaps/js-api-loader";

// Mock data for agricultural zones in Miami/Brickell area
const mockZones = [
  { id: 1, name: "Brickell Farm", health: 85, status: "secure", x: 25, y: 30, image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&h=150", droneImage: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=200&h=150" },
  { id: 2, name: "Downtown Grove", health: 92, status: "secure", x: 70, y: 60, image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=150", droneImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150" },
  { id: 3, name: "Bay Orchard", health: 67, status: "monitor", x: 80, y: 25, image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=200&h=150", droneImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=150" },
  { id: 4, name: "Miami River Crops", health: 45, status: "alert", x: 15, y: 70, image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=150", droneImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150" },
  { id: 5, name: "Biscayne Gardens", health: 28, status: "critical", x: 50, y: 45, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=150", droneImage: "https://images.unsplash.com/photo-1561136594-7f68413baa99?w=200&h=150" },
];

const statusConfig = {
  secure: { color: "success", bgColor: "bg-success", icon: Activity },
  monitor: { color: "warning", bgColor: "bg-warning", icon: AlertTriangle },
  alert: { color: "alert", bgColor: "bg-alert", icon: AlertTriangle },
  critical: { color: "critical", bgColor: "bg-critical", icon: AlertTriangle },
};

interface WaypointMarker {
  id: number;
  x: number;
  y: number;
  order: number;
  type: 'waypoint' | 'barcode';
}

export default function MissionMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const [showSatellite, setShowSatellite] = useState(false);
  const [showWaypointMode, setShowWaypointMode] = useState(false);
  const [waypoints, setWaypoints] = useState<WaypointMarker[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>(() => 
    localStorage.getItem('googleMapsApiKey') || ''
  );
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [earthEngineLoaded, setEarthEngineLoaded] = useState(false);

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!showWaypointMode || waypoints.length >= 10) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    const newWaypoint: WaypointMarker = {
      id: Date.now(),
      x,
      y,
      order: waypoints.length + 1,
      type: 'waypoint'
    };
    
    setWaypoints(prev => [...prev, newWaypoint]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragCounter(prev => prev + 1);
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    setDragCounter(0);
    
    if (!showWaypointMode || waypoints.length >= 10) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    const newWaypoint: WaypointMarker = {
      id: Date.now(),
      x,
      y,
      order: waypoints.length + 1,
      type: 'barcode'
    };
    
    setWaypoints(prev => [...prev, newWaypoint]);
  };

  const clearWaypoints = () => {
    setWaypoints([]);
  };

  const deployMission = () => {
    if (waypoints.length === 0) {
      alert('Please place at least one waypoint before deploying mission');
      return;
    }
    alert(`Mission deployed with ${waypoints.length} waypoints!`);
  };

  // Initialize Google Maps with Earth Engine
  useEffect(() => {
    if (!mapContainer.current || !googleMapsApiKey || googleMapRef.current) return;

    const loader = new Loader({
      apiKey: googleMapsApiKey,
      version: "weekly",
      libraries: ["geometry", "drawing", "visualization"]
    });

    loader.load().then(() => {
      if (!mapContainer.current) return;

      // Initialize Google Map
      googleMapRef.current = new google.maps.Map(mapContainer.current, {
        center: { lat: 25.7617, lng: -80.1918 }, // Miami/Brickell area
        zoom: 15,
        mapTypeId: showSatellite ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.ROADMAP,
        styles: showSatellite ? [] : [
          {
            featureType: "all",
            stylers: [{ saturation: -20 }, { lightness: 10 }]
          },
          {
            featureType: "water",
            stylers: [{ color: "#4a90e2" }]
          },
          {
            featureType: "landscape",
            stylers: [{ color: "#f0f8ff" }]
          }
        ],
        tilt: 45,
        heading: 0,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_CENTER,
          mapTypeIds: [
            google.maps.MapTypeId.ROADMAP,
            google.maps.MapTypeId.SATELLITE,
            google.maps.MapTypeId.HYBRID,
            google.maps.MapTypeId.TERRAIN
          ]
        }
      });

      // Add Earth Engine imagery overlay for agricultural analysis
      const addEarthEngineLayer = () => {
        // Simulate Earth Engine agricultural monitoring overlay
        const agriculturalOverlay = new google.maps.GroundOverlay(
          'data:image/svg+xml;base64,' + btoa(`
            <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="vegetation" cx="50%" cy="50%">
                  <stop offset="0%" style="stop-color:#00ff00;stop-opacity:0.3" />
                  <stop offset="50%" style="stop-color:#ffff00;stop-opacity:0.2" />
                  <stop offset="100%" style="stop-color:#ff0000;stop-opacity:0.1" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#vegetation)" />
              <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="12">
                Agricultural Health Analysis
              </text>
            </svg>
          `),
          new google.maps.LatLngBounds(
            new google.maps.LatLng(25.750, -80.200),
            new google.maps.LatLng(25.770, -80.180)
          )
        );

        agriculturalOverlay.setMap(googleMapRef.current);
        setEarthEngineLoaded(true);
      };

      // Add agricultural zone markers with enhanced Earth Engine data
      mockZones.forEach((zone) => {
        const marker = new google.maps.Marker({
          position: { 
            lat: 25.7617 + (zone.x - 50) * 0.005, 
            lng: -80.1918 + (zone.y - 50) * 0.005 
          },
          map: googleMapRef.current,
          title: zone.name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="${
                  zone.status === 'secure' ? '#10b981' :
                  zone.status === 'monitor' ? '#f59e0b' :
                  zone.status === 'alert' ? '#f97316' : '#ef4444'
                }" stroke="white" stroke-width="3"/>
                <circle cx="16" cy="16" r="6" fill="white" opacity="0.8"/>
                <text x="16" y="20" text-anchor="middle" fill="${
                  zone.status === 'secure' ? '#10b981' :
                  zone.status === 'monitor' ? '#f59e0b' :
                  zone.status === 'alert' ? '#f97316' : '#ef4444'
                }" font-size="8" font-weight="bold">${zone.health}</text>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 15px; max-width: 250px; font-family: Arial, sans-serif;">
              <img src="${zone.droneImage}" alt="Earth Engine Analysis" style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;" />
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #333;">${zone.name}</h3>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Health Score:</span>
                <span style="font-weight: bold; color: ${
                  zone.health >= 80 ? '#10b981' :
                  zone.health >= 60 ? '#f59e0b' :
                  zone.health >= 40 ? '#f97316' : '#ef4444'
                };">${zone.health}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Status:</span>
                <span style="font-weight: bold; text-transform: uppercase; color: ${
                  zone.status === 'secure' ? '#10b981' :
                  zone.status === 'monitor' ? '#f59e0b' :
                  zone.status === 'alert' ? '#f97316' : '#ef4444'
                };">${zone.status}</span>
              </div>
              <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 8px;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>
                  <span style="font-size: 12px; color: #10b981; font-weight: bold;">Earth Engine Analysis Active</span>
                </div>
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(googleMapRef.current, marker);
        });
      });

      // Add Earth Engine overlay after map loads
      google.maps.event.addListenerOnce(googleMapRef.current, 'idle', () => {
        addEarthEngineLayer();
        setMapLoaded(true);
      });

    }).catch((error) => {
      console.error('Google Maps failed to load:', error);
      setMapLoaded(false);
    });

    return () => {
      googleMapRef.current = null;
    };
  }, [googleMapsApiKey, showSatellite]);

  // Toggle map type between satellite and roadmap
  const toggleMapType = () => {
    if (googleMapRef.current && mapLoaded) {
      const newMapType = showSatellite ? google.maps.MapTypeId.ROADMAP : google.maps.MapTypeId.SATELLITE;
      googleMapRef.current.setMapTypeId(newMapType);
      setShowSatellite(!showSatellite);
    }
  };

  const handleApiKeySubmit = () => {
    if (googleMapsApiKey.trim()) {
      localStorage.setItem('googleMapsApiKey', googleMapsApiKey);
      setShowApiKeyInput(false);
    }
  };

  return (
    <Card className="p-6 card-tactical">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Tactical Overview</h3>
          <p className="text-sm text-muted-foreground">Real-time agricultural intelligence</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            size="sm" 
            variant="outline" 
            className="hover:border-primary/30" 
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          >
            <Settings className="h-4 w-4 mr-2" />
            API Settings
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="hover:border-primary/30" 
            onClick={() => setShowWaypointMode(!showWaypointMode)}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Waypoint Tracker
          </Button>
          {showWaypointMode && (
            <Button size="sm" variant="destructive" onClick={clearWaypoints}>
              <X className="h-4 w-4 mr-2" />
              Clear Waypoints
            </Button>
          )}
          <Button size="sm" className="btn-command" onClick={deployMission}>
            <Zap className="h-4 w-4 mr-2" />
            Deploy Mission
          </Button>
          <Button size="sm" variant="outline" className="hover:border-primary/30">
            <Camera className="h-4 w-4 mr-2" />
            Capture Intel
          </Button>
          <Button size="sm" variant="outline" className="hover:border-primary/30">
            <BarChart3 className="h-4 w-4 mr-2" />
            Earth Engine Analysis
          </Button>
        </div>
      </div>

      {/* Google Maps API Key Input */}
      {showApiKeyInput && (
        <div className="mb-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Google Maps & Earth Engine API</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Get your API key from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a> → APIs & Services → Credentials
            <br />
            <span className="text-xs text-muted-foreground/80">Enable: Maps JavaScript API, Earth Engine API</span>
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter your Google Maps API key"
              value={googleMapsApiKey}
              onChange={(e) => setGoogleMapsApiKey(e.target.value)}
              className="flex-1"
              type="password"
            />
            <Button size="sm" onClick={handleApiKeySubmit} disabled={!googleMapsApiKey.trim()}>
              Apply
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-2">
            💡 Google Maps API keys are publishable keys - they're designed for frontend use and secured by domain restrictions.
          </p>
        </div>
      )}

      {/* Map Toggle Bar */}
      <div className="mb-4 flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Google Maps & Earth Engine</span>
          {earthEngineLoaded && (
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse mr-1"></div>
              Earth Engine Active
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={toggleMapType}
          className="hover:border-primary/30"
          disabled={!googleMapsApiKey || !mapLoaded}
        >
          <Satellite className="h-4 w-4 mr-2" />
          {showSatellite ? 'Road View' : 'Satellite View'}
        </Button>
      </div>

      {/* Map Container */}
      <div 
        className={cn(
          "relative h-96 rounded-xl border border-primary/20 overflow-hidden",
          showWaypointMode && "cursor-crosshair",
          isDragging && "ring-2 ring-primary/50 bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {showWaypointMode && (
          <div className="absolute top-2 left-2 z-20 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium">
            Click or drag waypoints to place ({waypoints.length}/10)
          </div>
        )}
        {isDragging && (
          <div className="absolute inset-0 z-10 bg-primary/10 flex items-center justify-center">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium">
              Drop to place waypoint
            </div>
          </div>
        )}
        
        {/* Google Maps with Earth Engine */}
        {googleMapsApiKey ? (
          <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <div className="text-center p-6">
              <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-foreground font-medium mb-1">Google Maps & Earth Engine</p>
              <p className="text-sm text-muted-foreground mb-3">Configure API access for advanced agricultural monitoring</p>
              <Button size="sm" onClick={() => setShowApiKeyInput(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Configure API
              </Button>
            </div>
          </div>
        )}

        {/* Waypoint Overlay */}
        <div 
          className="absolute inset-0 cursor-pointer"
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

              {/* Zone Info Popup with Live Drone Image */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 min-w-[200px] border border-border/50">
                  <img 
                    src={zone.droneImage} 
                    alt={`Live drone footage of ${zone.name}`}
                    className="w-full h-20 object-cover rounded-md mb-2 border border-primary/20"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm text-foreground">{zone.name}</h4>
                    <Badge variant="outline" className={`status-${zone.status} text-xs`}>
                      {zone.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
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
                  <div className="text-xs text-primary flex items-center gap-1">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    Live drone feed
                  </div>
                </div>
              </div>

              {/* Scanning Effect */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"></div>
            </div>
          );
        })}

        {/* Waypoint Markers */}
        {waypoints.map((waypoint) => (
          <div
            key={waypoint.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${waypoint.x}%`, top: `${waypoint.y}%` }}
            draggable={showWaypointMode}
            onDragStart={(e) => {
              if (showWaypointMode) {
                e.dataTransfer.setData('text/plain', '');
              }
            }}
          >
            {/* Waypoint Marker */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground font-bold border-2 border-white shadow-lg group-hover:scale-125 transition-transform duration-200",
              waypoint.type === 'barcode' ? "bg-secondary" : "bg-primary"
            )}>
              {waypoint.type === 'barcode' ? <QrCode className="h-4 w-4" /> : waypoint.order}
            </div>

            {/* Waypoint Info Popup with Live Feed */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 min-w-[160px] border border-border/50">
                <img 
                  src={waypoint.type === 'barcode' 
                    ? "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=120"
                    : "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=200&h=120"
                  }
                  alt={`${waypoint.type === 'barcode' ? 'Barcode' : 'Waypoint'} ${waypoint.order}`}
                  className="w-full h-16 object-cover rounded-md mb-2 border border-primary/20"
                />
                <h4 className="font-semibold text-sm text-foreground">
                  {waypoint.type === 'barcode' ? 'Barcode Scanner' : `Waypoint ${waypoint.order}`}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {waypoint.type === 'barcode' ? 'Tree barcode tracking' : 'Navigation waypoint'}
                </p>
                <div className="text-xs text-primary flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  Live feed
                </div>
              </div>
            </div>

            {/* Connection line to next waypoint */}
            {waypoint.order < waypoints.length && (
              <svg className="absolute top-0 left-0 w-screen h-screen pointer-events-none -z-10">
                {(() => {
                  const nextWaypoint = waypoints.find(p => p.order === waypoint.order + 1);
                  if (!nextWaypoint) return null;
                  
                  return (
                    <line
                      x1={`${waypoint.x}%`}
                      y1={`${waypoint.y}%`}
                      x2={`${nextWaypoint.x}%`}
                      y2={`${nextWaypoint.y}%`}
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