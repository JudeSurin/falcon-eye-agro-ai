import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "alert" | "critical";
  className?: string;
  onClick?: () => void;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  className,
  onClick,
}: StatsCardProps) {
  const variantStyles = {
    default: "card-glass",
    success: "status-secure",
    warning: "status-monitor", 
    alert: "status-alert",
    critical: "status-critical",
  };

  return (
    <Card 
      className={cn(
        "p-6 transition-all duration-300 hover:scale-105 animate-fade-in",
        variantStyles[variant],
        onClick && "cursor-pointer hover:ring-2 hover:ring-primary/20",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-foreground">{value}</h3>
            {trend && (
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-success" : "text-critical"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className={cn(
          "p-3 rounded-xl",
          variant === "default" && "bg-primary/10 text-primary",
          variant === "success" && "bg-success/10 text-success",
          variant === "warning" && "bg-warning/10 text-warning",
          variant === "alert" && "bg-alert/10 text-alert",
          variant === "critical" && "bg-critical/10 text-critical"
        )}>
          {icon}
        </div>
      </div>
    </Card>
  );
}