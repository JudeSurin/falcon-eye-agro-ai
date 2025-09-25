import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Mission from '../models/Mission.js';
import { logger } from '../utils/logger.js';
import { requirePermission } from '../middleware/auth.js';
import { io } from '../server.js';
import { processImageData, analyzeCropHealth } from '../services/aiService.js';

const router = express.Router();

// Get all missions for user
router.get('/missions', [
  query('status').optional().isIn(['planned', 'active', 'paused', 'completed', 'cancelled', 'failed']),
  query('type').optional().isIn(['surveillance', 'crop_monitoring', 'mapping', 'inspection', 'emergency']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, type, limit = 10, page = 1 } = req.query;
    
    const filter = { operatorId: req.user._id };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const missions = await Mission.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('operatorId', 'name email');

    const total = await Mission.countDocuments(filter);

    res.json({
      missions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    logger.error('Get missions error:', error);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

// Create new mission
router.post('/missions', [
  requirePermission('create_missions'),
  body('name').trim().isLength({ min: 3, max: 100 }),
  body('type').isIn(['surveillance', 'crop_monitoring', 'mapping', 'inspection', 'emergency']),
  body('area').isObject(),
  body('schedule.startTime').isISO8601(),
  body('drone').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const missionData = {
      ...req.body,
      operatorId: req.user._id
    };

    const mission = new Mission(missionData);
    await mission.save();

    logger.info(`New mission created: ${mission.name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      mission: await mission.populate('operatorId', 'name email')
    });
  } catch (error) {
    logger.error('Create mission error:', error);
    res.status(500).json({ error: 'Failed to create mission' });
  }
});

// Get mission by ID
router.get('/missions/:id', async (req, res) => {
  try {
    const mission = await Mission.findOne({
      _id: req.params.id,
      operatorId: req.user._id
    }).populate('operatorId', 'name email');

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    res.json({ mission });
  } catch (error) {
    logger.error('Get mission error:', error);
    res.status(500).json({ error: 'Failed to fetch mission' });
  }
});

// Update mission
router.put('/missions/:id', [
  body('name').optional().trim().isLength({ min: 3, max: 100 }),
  body('status').optional().isIn(['planned', 'active', 'paused', 'completed', 'cancelled', 'failed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const mission = await Mission.findOneAndUpdate(
      { _id: req.params.id, operatorId: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('operatorId', 'name email');

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    logger.info(`Mission updated: ${mission.name} by ${req.user.email}`);

    res.json({ success: true, mission });
  } catch (error) {
    logger.error('Update mission error:', error);
    res.status(500).json({ error: 'Failed to update mission' });
  }
});

// Delete mission
router.delete('/missions/:id', requirePermission('delete_missions'), async (req, res) => {
  try {
    const mission = await Mission.findOneAndDelete({
      _id: req.params.id,
      operatorId: req.user._id
    });

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    logger.info(`Mission deleted: ${mission.name} by ${req.user.email}`);

    res.json({ success: true, message: 'Mission deleted successfully' });
  } catch (error) {
    logger.error('Delete mission error:', error);
    res.status(500).json({ error: 'Failed to delete mission' });
  }
});

// Add drone data to mission
router.post('/missions/:id/data', [
  body('position').isObject(),
  body('altitude').isNumeric(),
  body('speed').isNumeric(),
  body('batteryLevel').isNumeric(),
  body('heading').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const mission = await Mission.findOne({
      _id: req.params.id,
      operatorId: req.user._id
    });

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    // Add timestamp to data
    const droneData = {
      ...req.body,
      timestamp: new Date()
    };

    // Process image if provided
    if (req.body.imageUrl) {
      try {
        const analysis = await processImageData(req.body.imageUrl, mission.type);
        droneData.analysis = analysis;
        
        // Add any detected threats
        if (analysis.threats && analysis.threats.length > 0) {
          mission.threats.push(...analysis.threats.map(threat => ({
            ...threat,
            position: droneData.position,
            detectedAt: droneData.timestamp
          })));
        }
      } catch (analysisError) {
        logger.warn('Image analysis failed:', analysisError);
      }
    }

    mission.data.push(droneData);

    // Update analytics
    mission.analytics.totalFlightTime += 1; // Assuming 1 minute intervals
    mission.analytics.imagesCaptures += req.body.imageUrl ? 1 : 0;
    mission.analytics.videosRecorded += req.body.videoUrl ? 1 : 0;

    await mission.save();

    // Broadcast real-time data to connected clients
    io.to(`mission-${mission._id}`).emit('real-time-drone-data', {
      missionId: mission._id,
      data: droneData,
      analytics: mission.analytics
    });

    res.json({ success: true, data: droneData });
  } catch (error) {
    logger.error('Add drone data error:', error);
    res.status(500).json({ error: 'Failed to add drone data' });
  }
});

// Get mission analytics
router.get('/missions/:id/analytics', async (req, res) => {
  try {
    const mission = await Mission.findOne({
      _id: req.params.id,
      operatorId: req.user._id
    });

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    // Calculate additional analytics
    const recentData = mission.data.slice(-100); // Last 100 data points
    
    const analytics = {
      ...mission.analytics,
      recentAverages: {
        altitude: recentData.reduce((sum, d) => sum + (d.altitude || 0), 0) / recentData.length || 0,
        speed: recentData.reduce((sum, d) => sum + (d.speed || 0), 0) / recentData.length || 0,
        batteryLevel: recentData.reduce((sum, d) => sum + (d.batteryLevel || 0), 0) / recentData.length || 0
      },
      threatsByType: mission.threats.reduce((acc, threat) => {
        acc[threat.type] = (acc[threat.type] || 0) + 1;
        return acc;
      }, {}),
      flightPath: mission.data.map(d => ({
        lat: d.position.lat,
        lng: d.position.lng,
        altitude: d.altitude,
        timestamp: d.timestamp
      }))
    };

    res.json({ analytics });
  } catch (error) {
    logger.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Update threat status
router.put('/missions/:missionId/threats/:threatId', [
  body('status').isIn(['detected', 'investigating', 'confirmed', 'resolved', 'false_positive']),
  body('actionTaken').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const mission = await Mission.findOne({
      _id: req.params.missionId,
      operatorId: req.user._id
    });

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    const threat = mission.threats.id(req.params.threatId);
    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }

    threat.status = req.body.status;
    if (req.body.actionTaken) threat.actionTaken = req.body.actionTaken;
    if (req.body.status === 'resolved') threat.resolvedAt = new Date();

    await mission.save();

    res.json({ success: true, threat });
  } catch (error) {
    logger.error('Update threat error:', error);
    res.status(500).json({ error: 'Failed to update threat' });
  }
});

export default router;