import { X, MapPin, Activity, Shield, Target, Zap, Clock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DetailModalProps {
  type: string;
  onClose: () => void;
}

const detailData = {
  missions: {
    title: "Active Mission Details",
    icon: Zap,
    items: [
      {
        id: "M-001",
        name: "North Field Reconnaissance",
        status: "reporting",
        progress: 85,
        drone: "Falcon-Alpha",
        startTime: "08:30 AM",
        coordinates: "40.7128°N, 74.0060°W",
        details: "Monitoring wheat crop health, detecting pest activity in sector 7-A"
      },
      {
        id: "M-002", 
        name: "Orchard Surveillance",
        status: "reported",
        progress: 100,
        drone: "Falcon-Beta",
        startTime: "07:15 AM",
        coordinates: "40.7580°N, 73.9855°W", 
        details: "Completed fungal disease assessment, 12 hotspots identified"
      },
      {
        id: "M-003",
        name: "South Field Survey",
        status: "report",
        progress: 45,
        drone: "Falcon-Gamma",
        startTime: "09:00 AM", 
        coordinates: "40.6892°N, 74.0445°W",
        details: "Mapping irrigation patterns, analyzing soil moisture distribution"
      }
    ]
  },
  health: {
    title: "Crop Health Analysis",
    icon: Activity,
    items: [
      {
        field: "North Field Zone A",
        health: 92,
        status: "excellent",
        issue: "None detected",
        recommendation: "Maintain current irrigation schedule"
      },
      {
        field: "East Orchard Sector 3",
        health: 67,
        status: "moderate",
        issue: "Early blight detected",
        recommendation: "Apply copper-based fungicide within 48 hours"
      },
      {
        field: "South Field Zone B", 
        health: 45,
        status: "poor",
        issue: "Nutrient deficiency, pest damage",
        recommendation: "Immediate nitrogen application, targeted pest control"
      }
    ]
  },
  threats: {
    title: "Threat Detection Report",
    icon: Shield,
    items: [
      {
        threat: "Aphid Infestation",
        severity: "High",
        location: "North Field, Sector 4",
        detected: "2 hours ago",
        action: "Biological control deployment recommended"
      },
      {
        threat: "Fungal Outbreak", 
        severity: "Critical",
        location: "East Orchard, Row 12-15",
        detected: "45 minutes ago",
        action: "Immediate quarantine and treatment required"
      }
    ]
  },
  areas: {
    title: "Analyzed Area Details",
    icon: Target,
    items: [
      {
        area: "Primary Agricultural Zone",
        size: "234 acres",
        completion: "100%",
        aiConfidence: "98.7%",
        findings: "15 health anomalies, 3 irrigation issues, 2 pest hotspots"
      },
      {
        area: "Secondary Growth Area",
        size: "156 acres", 
        completion: "87%",
        aiConfidence: "95.2%",
        findings: "8 health anomalies, 1 nutrient deficiency zone"
      },
      {
        area: "Experimental Plot Section",
        size: "89 acres",
        completion: "100%", 
        aiConfidence: "99.1%",
        findings: "Optimal growth conditions maintained"
      }
    ]
  }
};

export default function DetailModal({ type, onClose }: DetailModalProps) {
  const data = detailData[type as keyof typeof detailData];
  if (!data) return null;

  const IconComponent = data.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-auto m-4 card-glass">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">{data.title}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {type === 'missions' && (
            <div className="space-y-4">
              {data.items.map((mission: any) => (
                <Card key={mission.id} className="p-4 card-tactical">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {mission.id}
                      </Badge>
                      <h3 className="font-semibold text-foreground">{mission.name}</h3>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`status-${mission.status === 'reporting' ? 'monitor' : 
                                        mission.status === 'reported' ? 'secure' : 'alert'}`}
                    >
                      {mission.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Drone:</span>
                      <p className="font-medium text-foreground">{mission.drone}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Start Time:</span>
                      <p className="font-medium text-foreground">{mission.startTime}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Progress:</span>
                      <p className="font-medium text-foreground">{mission.progress}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Coordinates:</span>
                      <p className="font-medium text-foreground">{mission.coordinates}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">{mission.details}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {type === 'health' && (
            <div className="space-y-4">
              {data.items.map((item: any, index: number) => (
                <Card key={index} className="p-4 card-tactical">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{item.field}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Health:</span>
                      <span className={`font-bold ${
                        item.health >= 80 ? 'text-success' :
                        item.health >= 60 ? 'text-warning' : 'text-critical'
                      }`}>
                        {item.health}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Issue:</span>
                      <p className="font-medium text-foreground">{item.issue}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-muted-foreground">Recommendation:</span>
                      <p className="font-medium text-foreground">{item.recommendation}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {type === 'threats' && (
            <div className="space-y-4">
              {data.items.map((threat: any, index: number) => (
                <Card key={index} className="p-4 border-l-4 border-l-alert bg-alert/5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{threat.threat}</h3>
                    <Badge variant="outline" className="status-alert">
                      {threat.severity}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <p className="font-medium text-foreground">{threat.location}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Detected:</span>
                      <p className="font-medium text-foreground">{threat.detected}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Action:</span>
                      <p className="font-medium text-foreground">{threat.action}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {type === 'areas' && (
            <div className="space-y-4">
              {data.items.map((area: any, index: number) => (
                <Card key={index} className="p-4 card-tactical">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{area.area}</h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium text-success">{area.completion}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <p className="font-medium text-foreground">{area.size}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">AI Confidence:</span>
                      <p className="font-medium text-foreground">{area.aiConfidence}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Findings:</span>
                      <p className="font-medium text-foreground">{area.findings}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}