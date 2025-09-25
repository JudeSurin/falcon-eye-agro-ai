import mongoose from 'mongoose';

const coordinateSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
});

const droneDataSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  position: coordinateSchema,
  altitude: { type: Number, required: true },
  speed: { type: Number, required: true },
  batteryLevel: { type: Number, required: true },
  heading: { type: Number, required: true },
  temperature: Number,
  humidity: Number,
  windSpeed: Number,
  windDirection: Number,
  imageUrl: String,
  videoUrl: String,
  sensorData: {
    camera: {
      resolution: String,
      zoom: Number,
      focusMode: String
    },
    gps: {
      accuracy: Number,
      satellites: Number
    },
    imu: {
      pitch: Number,
      roll: Number,
      yaw: Number
    }
  }
});

const threatSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['pest', 'disease', 'weed', 'irrigation_issue', 'equipment_failure', 'wildlife'],
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    required: true 
  },
  position: coordinateSchema,
  description: String,
  confidence: { type: Number, min: 0, max: 1 },
  detectedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['detected', 'investigating', 'confirmed', 'resolved', 'false_positive'],
    default: 'detected'
  },
  images: [String],
  actionTaken: String,
  resolvedAt: Date
});

const missionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  operatorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: {
    type: String,
    enum: ['planned', 'active', 'paused', 'completed', 'cancelled', 'failed'],
    default: 'planned'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['surveillance', 'crop_monitoring', 'mapping', 'inspection', 'emergency'],
    required: true
  },
  area: {
    name: String,
    polygon: [coordinateSchema],
    center: coordinateSchema,
    totalArea: Number // in hectares
  },
  schedule: {
    startTime: { type: Date, required: true },
    endTime: Date,
    duration: Number, // in minutes
    recurring: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
      days: [{ type: Number, min: 0, max: 6 }] // 0 = Sunday
    }
  },
  drone: {
    id: String,
    model: String,
    serialNumber: String,
    flightParams: {
      altitude: { type: Number, default: 50 },
      speed: { type: Number, default: 10 },
      pattern: { type: String, enum: ['grid', 'spiral', 'perimeter', 'custom'], default: 'grid' },
      overlap: { type: Number, default: 70 }
    }
  },
  weather: {
    conditions: String,
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    windDirection: Number,
    visibility: Number,
    suitable: Boolean
  },
  data: [droneDataSchema],
  threats: [threatSchema],
  analytics: {
    totalFlightTime: { type: Number, default: 0 },
    distanceCovered: { type: Number, default: 0 },
    imagesCaptures: { type: Number, default: 0 },
    videosRecorded: { type: Number, default: 0 },
    cropHealthScore: Number,
    threatsDetected: { type: Number, default: 0 },
    areasAnalyzed: { type: Number, default: 0 },
    batteryUsed: Number,
    avgAltitude: Number,
    maxSpeed: Number
  },
  notes: String,
  tags: [String]
}, {
  timestamps: true
});

// Indexes for better performance
missionSchema.index({ operatorId: 1, createdAt: -1 });
missionSchema.index({ status: 1 });
missionSchema.index({ 'schedule.startTime': 1 });
missionSchema.index({ 'area.center': '2dsphere' });

export default mongoose.model('Mission', missionSchema);