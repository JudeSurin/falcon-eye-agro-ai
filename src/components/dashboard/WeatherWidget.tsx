import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Cloud, 
  Sun, 
  Wind, 
  Droplets, 
  Thermometer,
  Eye,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WeatherWidget() {
  // Mock weather data
  const weather = {
    condition: "Partly Cloudy",
    temperature: 72,
    humidity: 45,
    windSpeed: 8,
    visibility: 10,
    flightSuitability: "optimal",
    uvIndex: 6,
    pressure: 30.12,
  };

  const getFlightStatus = () => {
    if (weather.flightSuitability === "optimal") {
      return {
        status: "Optimal",
        color: "success",
        icon: CheckCircle,
        message: "Perfect conditions for falcon deployment"
      };
    } else if (weather.flightSuitability === "caution") {
      return {
        status: "Caution",
        color: "warning", 
        icon: AlertTriangle,
        message: "Proceed with enhanced monitoring"
      };
    } else {
      return {
        status: "Restricted",
        color: "critical",
        icon: AlertTriangle,
        message: "Ground all falcon units"
      };
    }
  };

  const flightStatus = getFlightStatus();
  const StatusIcon = flightStatus.icon;

  return (
    <Card className="p-6 card-glass">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Weather Intel</h3>
          <p className="text-sm text-muted-foreground">Flight conditions assessment</p>
        </div>
        <Sun className="h-6 w-6 text-warning" />
      </div>

      {/* Current Conditions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-foreground">{weather.temperature}°F</div>
            <div className="text-sm text-muted-foreground">{weather.condition}</div>
          </div>
          <div className="text-right">
            <Badge 
              className={cn(
                "status-" + flightStatus.color,
                "border px-3 py-1"
              )}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {flightStatus.status}
            </Badge>
            <div className="text-xs text-muted-foreground mt-1">
              {flightStatus.message}
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-secondary" />
            <div>
              <div className="text-sm font-medium text-foreground">{weather.windSpeed} mph</div>
              <div className="text-xs text-muted-foreground">Wind Speed</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-secondary" />
            <div>
              <div className="text-sm font-medium text-foreground">{weather.humidity}%</div>
              <div className="text-xs text-muted-foreground">Humidity</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-secondary" />
            <div>
              <div className="text-sm font-medium text-foreground">{weather.visibility} mi</div>
              <div className="text-xs text-muted-foreground">Visibility</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-secondary" />
            <div>
              <div className="text-sm font-medium text-foreground">{weather.pressure}"</div>
              <div className="text-xs text-muted-foreground">Pressure</div>
            </div>
          </div>
        </div>

        {/* Flight Advisory */}
        <div className="mt-4 p-3 bg-gradient-to-r from-success/10 to-secondary/10 rounded-lg border border-success/20">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">Flight Advisory</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Conditions are optimal for reconnaissance missions. Light winds and clear visibility 
            provide excellent surveillance opportunities.
          </p>
        </div>

        {/* 6-Hour Forecast */}
        <div className="pt-4 border-t border-border/50">
          <div className="text-sm font-medium text-foreground mb-2">6-Hour Outlook</div>
          <div className="flex justify-between text-xs">
            <div className="text-center">
              <div className="text-muted-foreground">2PM</div>
              <Sun className="h-4 w-4 mx-auto my-1 text-warning" />
              <div className="font-medium">75°</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">4PM</div>
              <Cloud className="h-4 w-4 mx-auto my-1 text-muted-foreground" />
              <div className="font-medium">73°</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">6PM</div>
              <Cloud className="h-4 w-4 mx-auto my-1 text-muted-foreground" />
              <div className="font-medium">69°</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">8PM</div>
              <Sun className="h-4 w-4 mx-auto my-1 text-warning" />
              <div className="font-medium">65°</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}