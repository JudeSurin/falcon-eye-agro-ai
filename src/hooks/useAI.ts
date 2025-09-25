import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { aiAPI } from '@/services/apiClient';
import { toast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  context?: any;
}

export const useAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const chatMutation = useMutation({
    mutationFn: ({ message, context }: { message: string; context?: any }) =>
      aiAPI.chat(message, context),
    onSuccess: (data, variables) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        message: variables.message,
        response: data.data.response,
        timestamp: new Date(),
        context: variables.context
      };
      setMessages(prev => [...prev, newMessage]);
    },
    onError: (error: any) => {
      toast({
        title: "AI Chat Error",
        description: error.response?.data?.error || "Failed to send message",
        variant: "destructive",
      });
    }
  });

  const sendMessage = (message: string, context?: any) => {
    chatMutation.mutate({ message, context });
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading: chatMutation.isPending,
    error: chatMutation.error
  };
};

export const useImageAnalysis = () => {
  return useMutation({
    mutationFn: ({ imageUrl, analysisType, missionId }: {
      imageUrl: string;
      analysisType: 'crop_health' | 'threat_detection' | 'mapping' | 'general';
      missionId?: string;
    }) => aiAPI.analyzeImage(imageUrl, analysisType, missionId),
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Image analysis has been completed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.response?.data?.error || "Failed to analyze image",
        variant: "destructive",
      });
    }
  });
};

export const useReportGeneration = () => {
  return useMutation({
    mutationFn: ({ missionId, reportType }: {
      missionId: string;
      reportType: 'summary' | 'detailed' | 'executive' | 'technical';
    }) => aiAPI.generateReport(missionId, reportType),
    onSuccess: () => {
      toast({
        title: "Report Generated",
        description: "Mission report has been generated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Report Generation Failed",
        description: error.response?.data?.error || "Failed to generate report",
        variant: "destructive",
      });
    }
  });
};

export const useAIInsights = () => {
  return useQuery({
    queryKey: ['ai', 'insights'],
    queryFn: () => aiAPI.getInsights(),
    select: (data) => data.data.insights,
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
};