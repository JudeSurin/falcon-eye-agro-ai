import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { missionAPI } from '@/services/apiClient';
import { toast } from '@/hooks/use-toast';

export interface Mission {
  _id: string;
  name: string;
  description?: string;
  operatorId: string;
  status: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'surveillance' | 'crop_monitoring' | 'mapping' | 'inspection' | 'emergency';
  area: {
    name: string;
    polygon: Array<{ lat: number; lng: number }>;
    center: { lat: number; lng: number };
    totalArea: number;
  };
  schedule: {
    startTime: string;
    endTime?: string;
    duration?: number;
  };
  analytics: {
    totalFlightTime: number;
    distanceCovered: number;
    imagesCaptures: number;
    videosRecorded: number;
    cropHealthScore?: number;
    threatsDetected: number;
    areasAnalyzed: number;
  };
  threats: Array<{
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    position: { lat: number; lng: number };
    description: string;
    confidence: number;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const useMissions = (params = {}) => {
  return useQuery({
    queryKey: ['missions', params],
    queryFn: () => missionAPI.getMissions(params),
    select: (data) => data.data
  });
};

export const useMission = (id: string) => {
  return useQuery({
    queryKey: ['mission', id],
    queryFn: () => missionAPI.getMission(id),
    select: (data) => data.data.mission,
    enabled: !!id
  });
};

export const useCreateMission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: missionAPI.createMission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast({
        title: "Mission Created",
        description: "Your mission has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create mission",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateMission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      missionAPI.updateMission(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['mission', variables.id] });
      toast({
        title: "Mission Updated",
        description: "Mission has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update mission",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteMission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: missionAPI.deleteMission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast({
        title: "Mission Deleted",
        description: "Mission has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete mission",
        variant: "destructive",
      });
    }
  });
};

export const useRealTimeMissionData = (missionId: string) => {
  const [liveData, setLiveData] = useState(null);
  
  useEffect(() => {
    if (!missionId) return;
    
    // In a real implementation, this would connect to Socket.IO
    const mockInterval = setInterval(() => {
      // Simulate real-time data updates
      setLiveData({
        position: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.01,
          lng: -74.0060 + (Math.random() - 0.5) * 0.01
        },
        altitude: 50 + Math.random() * 100,
        speed: 10 + Math.random() * 20,
        batteryLevel: 80 + Math.random() * 20,
        timestamp: new Date().toISOString()
      });
    }, 2000);
    
    return () => clearInterval(mockInterval);
  }, [missionId]);
  
  return liveData;
};