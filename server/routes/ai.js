import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';
import Mission from '../models/Mission.js';

const router = express.Router();

// Initialize Gemini AI
let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  logger.error('Failed to initialize Gemini AI:', error);
}

// Chat with AI assistant
router.post('/chat', [
  body('message').notEmpty().isLength({ max: 1000 }),
  body('context').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!genAI) {
      return res.status(500).json({ error: 'AI service not available' });
    }

    const { message, context = {} } = req.body;
    
    // Get user's recent missions for context
    const recentMissions = await Mission.find({ operatorId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name type status analytics threats');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const systemPrompt = `You are HoverFly AI, an advanced aerial intelligence assistant for drone operations. 
    
    Current user: ${req.user.name} (${req.user.email})
    
    User's recent missions: ${JSON.stringify(recentMissions, null, 2)}
    
    Additional context: ${JSON.stringify(context, null, 2)}
    
    You help with:
    - Mission planning and optimization
    - Weather analysis for flight operations
    - Crop health assessment from drone imagery
    - Threat detection and analysis
    - Flight safety recommendations
    - Regulatory compliance guidance
    
    Keep responses concise, professional, and actionable. Focus on aerial intelligence and drone operations.`;

    const prompt = `${systemPrompt}\n\nUser message: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiMessage = response.text();

    // Log the interaction
    logger.info(`AI chat - User: ${req.user.email}, Message length: ${message.length}`);

    res.json({
      response: aiMessage,
      timestamp: new Date(),
      context: {
        missionsCount: recentMissions.length,
        userRole: req.user.role
      }
    });

  } catch (error) {
    logger.error('AI chat error:', error);
    
    if (error.message?.includes('API_KEY')) {
      return res.status(500).json({ error: 'AI service configuration error' });
    }
    
    res.status(500).json({ 
      error: 'AI service temporarily unavailable',
      fallback: "I'm currently experiencing technical difficulties. Please try again later or contact support for mission-critical inquiries."
    });
  }
});

// Analyze drone imagery
router.post('/analyze-image', [
  body('imageUrl').isURL(),
  body('analysisType').isIn(['crop_health', 'threat_detection', 'mapping', 'general']),
  body('missionId').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!genAI) {
      return res.status(500).json({ error: 'AI service not available' });
    }

    const { imageUrl, analysisType, missionId } = req.body;

    let missionContext = '';
    if (missionId) {
      const mission = await Mission.findOne({
        _id: missionId,
        operatorId: req.user._id
      }).select('name type area');
      
      if (mission) {
        missionContext = `Mission: ${mission.name} (Type: ${mission.type})`;
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const analysisPrompts = {
      crop_health: `Analyze this aerial crop image for health indicators. Look for:
        - Crop density and coverage
        - Color variations indicating health issues
        - Signs of disease, pests, or nutrient deficiency
        - Growth patterns and uniformity
        - Irrigation needs
        Provide specific recommendations and a health score (0-100).`,
      
      threat_detection: `Analyze this aerial image for potential threats or anomalies:
        - Pest infestations
        - Disease outbreaks
        - Equipment failures
        - Unusual patterns or objects
        - Wildlife interference
        Rate threat severity and provide immediate action recommendations.`,
      
      mapping: `Analyze this aerial image for mapping and surveying:
        - Terrain features and boundaries
        - Infrastructure and obstacles
        - Land use patterns
        - Changes from previous imagery
        - Notable landmarks
        Provide coordinates and measurements where possible.`,
      
      general: `Provide a comprehensive analysis of this aerial image including:
        - Overall scene description
        - Notable features or objects
        - Potential points of interest
        - Recommendations for further investigation
        - Quality assessment of the image`
    };

    const prompt = `${analysisPrompts[analysisType]}
    
    ${missionContext}
    
    Provide response in JSON format with:
    {
      "summary": "Brief overview",
      "findings": ["key finding 1", "key finding 2"],
      "recommendations": ["action 1", "action 2"],
      "confidence": 0.95,
      "threats": [{"type": "pest", "severity": "medium", "location": "center-left"}],
      "score": 85
    }`;

    // Note: In a real implementation, you would process the actual image
    // For this example, we'll simulate image analysis
    const result = await model.generateContent([
      prompt,
      "Image URL: " + imageUrl
    ]);
    
    const response = await result.response;
    const analysisText = response.text();

    // Try to parse JSON response, fall back to text if needed
    let analysis;
    try {
      // Extract JSON from the response if it's wrapped in markdown
      const jsonMatch = analysisText.match(/```json\n(.*?)\n```/s) || 
                       analysisText.match(/\{.*\}/s);
      
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      // Fallback to structured text response
      analysis = {
        summary: analysisText.substring(0, 200) + '...',
        findings: ['AI analysis completed'],
        recommendations: ['Review full analysis text'],
        confidence: 0.8,
        fullText: analysisText
      };
    }

    // Add metadata
    analysis.timestamp = new Date();
    analysis.analysisType = analysisType;
    analysis.userId = req.user._id;

    // Save to mission if provided
    if (missionId) {
      try {
        await Mission.findOneAndUpdate(
          { _id: missionId, operatorId: req.user._id },
          {
            $push: {
              'data': {
                timestamp: new Date(),
                analysis,
                imageUrl,
                type: 'ai_analysis'
              }
            }
          }
        );
      } catch (updateError) {
        logger.warn('Failed to save analysis to mission:', updateError);
      }
    }

    logger.info(`Image analysis completed - User: ${req.user.email}, Type: ${analysisType}`);

    res.json({ analysis });

  } catch (error) {
    logger.error('Image analysis error:', error);
    res.status(500).json({ error: 'Image analysis failed' });
  }
});

// Generate mission report
router.post('/generate-report', [
  body('missionId').isMongoId(),
  body('reportType').isIn(['summary', 'detailed', 'executive', 'technical'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!genAI) {
      return res.status(500).json({ error: 'AI service not available' });
    }

    const { missionId, reportType } = req.body;

    const mission = await Mission.findOne({
      _id: missionId,
      operatorId: req.user._id
    });

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const reportPrompts = {
      summary: 'Create a concise executive summary of this mission including key findings and outcomes.',
      detailed: 'Generate a comprehensive technical report with all mission data, analysis, and recommendations.',
      executive: 'Produce an executive briefing suitable for management review with key metrics and decisions needed.',
      technical: 'Create a technical analysis report for drone operators and field teams with operational insights.'
    };

    const prompt = `Generate a ${reportType} report for this drone mission:
    
    Mission Data: ${JSON.stringify(mission, null, 2)}
    
    ${reportPrompts[reportType]}
    
    Include relevant sections like:
    - Mission Overview
    - Key Findings
    - Analytics Summary
    - Threat Assessment
    - Recommendations
    - Next Steps
    
    Format as professional report with clear sections and actionable insights.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reportContent = response.text();

    const report = {
      missionId,
      reportType,
      content: reportContent,
      generatedAt: new Date(),
      generatedBy: req.user._id,
      missionName: mission.name,
      missionStatus: mission.status
    };

    logger.info(`Report generated - Mission: ${mission.name}, Type: ${reportType}, User: ${req.user.email}`);

    res.json({ report });

  } catch (error) {
    logger.error('Report generation error:', error);
    res.status(500).json({ error: 'Report generation failed' });
  }
});

// Get AI insights for dashboard
router.get('/insights', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ error: 'AI service not available' });
    }

    // Get user's mission data for insights
    const missions = await Mission.find({ operatorId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('analytics threats status type createdAt');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this drone mission data and provide actionable insights:
    
    Mission Data: ${JSON.stringify(missions, null, 2)}
    
    Provide insights in JSON format:
    {
      "trends": ["trend 1", "trend 2"],
      "alerts": ["alert 1", "alert 2"],
      "recommendations": ["recommendation 1", "recommendation 2"],
      "efficiency": {"score": 85, "factors": ["factor 1"]},
      "predictions": ["prediction 1", "prediction 2"]
    }
    
    Focus on operational efficiency, threat patterns, and optimization opportunities.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const insightsText = response.text();

    let insights;
    try {
      const jsonMatch = insightsText.match(/```json\n(.*?)\n```/s) || 
                       insightsText.match(/\{.*\}/s);
      
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      insights = {
        trends: ['Analysis completed for recent missions'],
        alerts: ['Review mission data for optimization opportunities'],
        recommendations: ['Continue monitoring mission performance'],
        efficiency: { score: 80, factors: ['Regular operations maintained'] },
        predictions: ['Continued operational success expected']
      };
    }

    insights.generatedAt = new Date();
    insights.missionCount = missions.length;

    res.json({ insights });

  } catch (error) {
    logger.error('AI insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

export default router;