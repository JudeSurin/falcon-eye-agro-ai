import { useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
  Pause,
  Play,
  Trash2 
} from 'lucide-react';
import { useMissions, useUpdateMission, useDeleteMission, Mission } from '@/hooks/useMissions';

const statusIcons = {
  planned: Clock,
  active: Play,
  paused: Pause,
  completed: CheckCircle,
  cancelled: AlertCircle,
  failed: AlertCircle,
};

const statusColors = {
  planned: 'bg-blue-500',
  active: 'bg-green-500',
  paused: 'bg-yellow-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-gray-500',
  failed: 'bg-red-500',
};

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

interface MissionTableProps {
  onMissionSelect?: (mission: Mission) => void;
}

export const MissionTable = ({ onMissionSelect }: MissionTableProps) => {
  const { data: missionsData, isLoading } = useMissions();
  const updateMission = useUpdateMission();
  const deleteMission = useDeleteMission();

  const missions = missionsData?.missions || [];

  const handleStatusChange = (missionId: string, newStatus: string) => {
    updateMission.mutate({ id: missionId, data: { status: newStatus } });
  };

  const handleDelete = (missionId: string) => {
    if (confirm('Are you sure you want to delete this mission?')) {
      deleteMission.mutate(missionId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mission</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {missions.map((mission: Mission) => {
            const StatusIcon = statusIcons[mission.status];
            
            return (
              <TableRow 
                key={mission._id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onMissionSelect?.(mission)}
              >
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{mission.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {mission.area.name}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {mission.type.replace('_', ' ')}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[mission.status]}`} />
                    <StatusIcon className="w-4 h-4" />
                    <span className="capitalize">{mission.status}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge 
                    variant="secondary"
                    className={`${priorityColors[mission.priority]} text-white`}
                  >
                    {mission.priority}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(mission.schedule.startTime), 'MMM dd, HH:mm')}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      {mission.analytics.imagesCaptures} images
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {mission.analytics.threatsDetected} threats detected
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {mission.status === 'planned' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(mission._id, 'active')}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Mission
                        </DropdownMenuItem>
                      )}
                      
                      {mission.status === 'active' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(mission._id, 'paused')}
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          Pause Mission
                        </DropdownMenuItem>
                      )}
                      
                      {mission.status === 'paused' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(mission._id, 'active')}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Resume Mission
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(mission._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Mission
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {missions.length === 0 && (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No missions found
        </div>
      )}
    </div>
  );
};