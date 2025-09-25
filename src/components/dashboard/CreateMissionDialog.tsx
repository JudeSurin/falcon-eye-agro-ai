import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCreateMission } from '@/hooks/useMissions';

interface CreateMissionDialogProps {
  trigger?: React.ReactNode;
}

export const CreateMissionDialog = ({ trigger }: CreateMissionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    priority: 'medium',
    areaName: '',
    centerLat: '',
    centerLng: '',
    startDate: undefined as Date | undefined,
    startTime: '',
    droneModel: '',
    altitude: '50',
    speed: '10',
  });

  const createMission = useCreateMission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.startTime) {
      alert('Please select both date and time');
      return;
    }

    const [hours, minutes] = formData.startTime.split(':');
    const startDateTime = new Date(formData.startDate);
    startDateTime.setHours(parseInt(hours), parseInt(minutes));

    const missionData = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      priority: formData.priority,
      area: {
        name: formData.areaName,
        center: {
          lat: parseFloat(formData.centerLat) || 40.7128,
          lng: parseFloat(formData.centerLng) || -74.0060,
        },
        polygon: [], // Will be defined by map interface
        totalArea: 0, // Will be calculated
      },
      schedule: {
        startTime: startDateTime.toISOString(),
      },
      drone: {
        model: formData.droneModel,
        flightParams: {
          altitude: parseInt(formData.altitude),
          speed: parseInt(formData.speed),
          pattern: 'grid',
        },
      },
    };

    try {
      await createMission.mutateAsync(missionData);
      setOpen(false);
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: '',
        priority: 'medium',
        areaName: '',
        centerLat: '',
        centerLng: '',
        startDate: undefined,
        startTime: '',
        droneModel: '',
        altitude: '50',
        speed: '10',
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Mission
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Mission</DialogTitle>
          <DialogDescription>
            Set up a new drone mission with flight parameters and objectives.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Mission Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter mission name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Mission Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mission type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surveillance">Surveillance</SelectItem>
                  <SelectItem value="crop_monitoring">Crop Monitoring</SelectItem>
                  <SelectItem value="mapping">Mapping</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the mission objectives and requirements"
            />
          </div>

          {/* Area Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Area Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="areaName">Area Name</Label>
                <Input
                  id="areaName"
                  value={formData.areaName}
                  onChange={(e) => setFormData(prev => ({ ...prev, areaName: e.target.value }))}
                  placeholder="Enter area name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="centerLat">Center Latitude</Label>
                  <Input
                    id="centerLat"
                    type="number"
                    step="any"
                    value={formData.centerLat}
                    onChange={(e) => setFormData(prev => ({ ...prev, centerLat: e.target.value }))}
                    placeholder="40.7128"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="centerLng">Center Longitude</Label>
                  <Input
                    id="centerLng"
                    type="number"
                    step="any"
                    value={formData.centerLng}
                    onChange={(e) => setFormData(prev => ({ ...prev, centerLng: e.target.value }))}
                    placeholder="-74.0060"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="font-semibold">Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Priority and Drone Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="droneModel">Drone Model</Label>
              <Input
                id="droneModel"
                value={formData.droneModel}
                onChange={(e) => setFormData(prev => ({ ...prev, droneModel: e.target.value }))}
                placeholder="e.g., DJI Phantom 4"
              />
            </div>
          </div>

          {/* Flight Parameters */}
          <div className="space-y-4">
            <h3 className="font-semibold">Flight Parameters</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="altitude">Altitude (meters)</Label>
                <Input
                  id="altitude"
                  type="number"
                  value={formData.altitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, altitude: e.target.value }))}
                  placeholder="50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="speed">Speed (m/s)</Label>
                <Input
                  id="speed"
                  type="number"
                  value={formData.speed}
                  onChange={(e) => setFormData(prev => ({ ...prev, speed: e.target.value }))}
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMission.isPending}>
              {createMission.isPending ? 'Creating...' : 'Create Mission'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};