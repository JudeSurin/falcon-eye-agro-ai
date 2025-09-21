import { Activity, Zap, Shield, Target, Eye, BarChart3, X } from "lucide-react";
import { useState } from "react";
import Header from "@/components/layout/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import MissionMap from "@/components/dashboard/MissionMap";
import WeatherWidget from "@/components/dashboard/WeatherWidget";
import DetailModal from "@/components/dashboard/DetailModal";
import GeminiChatbot from "@/components/chat/GeminiChatbot";
import heroImage from "@/assets/hero-agricultural-drone.jpg";

const Index = () => {
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-hero"></div>
    </div>
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-4 animate-fade-in">
              Elite Aerial Intelligence
            </h1>
            <p className="text-xl mb-6 text-white/90 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              HoverFly precision surveillance technology for advanced agricultural monitoring and threat detection.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Active Missions"
            value={3}
            subtitle="Mission report, reporting, and reported"
            icon={<Zap className="h-5 w-5" />}
            trend={{ value: 12, isPositive: true }}
            variant="success"
            onClick={() => setSelectedStat('missions')}
          />
          <StatsCard
            title="Crop Health Average"
            value="78%"
            subtitle="847 acres monitored"
            icon={<Activity className="h-5 w-5" />}
            trend={{ value: 5, isPositive: true }}
            variant="default"
            onClick={() => setSelectedStat('health')}
          />
          <StatsCard
            title="Threats Detected"
            value={2}
            subtitle="Early intervention alerts"
            icon={<Shield className="h-5 w-5" />}
            trend={{ value: -25, isPositive: false }}
            variant="warning"
            onClick={() => setSelectedStat('threats')}
          />
          <StatsCard
            title="Areas Analyzed"
            value={15}
            subtitle="AI-powered assessments"
            icon={<Target className="h-5 w-5" />}
            trend={{ value: 8, isPositive: true }}
            variant="default"
            onClick={() => setSelectedStat('areas')}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mission Map - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <MissionMap />
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            <WeatherWidget />
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-tactical p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Mission Analytics</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completed Today</span>
                <span className="font-semibold text-foreground">7 missions</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Flight Hours</span>
                <span className="font-semibold text-foreground">24.3 hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Data Collected</span>
                <span className="font-semibold text-foreground">3.2 TB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-semibold text-success">98.7%</span>
              </div>
            </div>
          </div>

          <div className="card-glass p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-secondary" />
              <h3 className="text-lg font-semibold text-foreground">System Status</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Falcon Units</span>
                <span className="font-semibold text-success">3/3 Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">AI Processing</span>
                <span className="font-semibold text-success">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Data Link</span>
                <span className="font-semibold text-success">Strong Signal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Weather Conditions</span>
                <span className="font-semibold text-success">Optimal</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedStat && (
        <DetailModal 
          type={selectedStat} 
          onClose={() => setSelectedStat(null)} 
        />
      )}

      {/* Gemini Chatbot */}
      <GeminiChatbot />
    </div>
  );
};

export default Index;
