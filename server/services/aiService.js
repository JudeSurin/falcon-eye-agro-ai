import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';

let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  logger.error('Failed to initialize AI service:', error);
}

// Process and analyze drone imagery
export const processImageData = async (imageUrl, missionType = 'general') => {
  if (!genAI) {
    throw new Error('AI service not available');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const analysisPrompts = {
      crop_monitoring: `Analyze this aerial crop image for:
        - Crop health indicators (color, density, growth patterns)
        - Disease or pest detection
        - Irrigation needs
        - Yield predictions
        - Nutrient deficiencies
        Provide actionable agricultural insights.`,

      surveillance: `Analyze this aerial surveillance image for:
        - Unusual activities or objects
        - Security threats or breaches
        - People counting and movement patterns
        - Vehicle identification
        - Infrastructure monitoring
        Focus on security and monitoring aspects.`,

      mapping: `Analyze this aerial mapping image for:
        - Terrain features and topography
        - Infrastructure and buildings
        - Land use classification
        - Change detection
        - Geographic measurements
        Provide mapping and surveying insights.`,

      inspection: `Analyze this aerial inspection image for:
        - Equipment condition and defects
        - Structural integrity issues
        - Maintenance requirements
        - Safety hazards
        - Compliance violations
        Focus on inspection and maintenance needs.`,

      general: `Perform comprehensive aerial image analysis including:
        - Overall scene description
        - Notable objects and features
        - Potential areas of interest
        - Anomaly detection
        - Quality assessment`
    };

    const prompt = analysisPrompts[missionType] || analysisPrompts.general;

    // In a real implementation, you would pass the actual image data
    // For this example, we simulate the analysis
    const result = await model.generateContent([
      `${prompt}\n\nImage URL: ${imageUrl}\n\nProvide analysis in structured format with confidence scores and specific findings.`
    ]);

    const response = await result.response;
    const analysisText = response.text();

    // Parse and structure the analysis
    const analysis = parseAnalysisResponse(analysisText, missionType);
    
    return analysis;

  } catch (error) {
    logger.error('Image processing error:', error);
    throw new Error('Image analysis failed');
  }
};

// Analyze crop health from imagery
export const analyzeCropHealth = async (imageUrl, cropType = 'general') => {
  if (!genAI) {
    throw new Error('AI service not available');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this aerial crop image for ${cropType} crops. Provide detailed health assessment including:
    
    1. Overall health score (0-100)
    2. Crop coverage and density
    3. Color variations and their meanings
    4. Signs of stress, disease, or pests
    5. Growth uniformity
    6. Irrigation needs
    7. Nutrient deficiency indicators
    8. Yield predictions
    9. Recommended actions
    
    Format response as detailed agricultural report with specific recommendations.
    
    Image URL: ${imageUrl}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const healthAnalysis = response.text();

    // Extract key metrics and structure the response
    return {
      healthScore: extractHealthScore(healthAnalysis),
      coverage: extractCoverage(healthAnalysis),
      stressIndicators: extractStressIndicators(healthAnalysis),
      recommendations: extractRecommendations(healthAnalysis),
      fullAnalysis: healthAnalysis,
      timestamp: new Date(),
      cropType
    };

  } catch (error) {
    logger.error('Crop health analysis error:', error);
    throw new Error('Crop health analysis failed');
  }
};

// Detect threats and anomalies
export const detectThreats = async (imageUrl, threatTypes = []) => {
  if (!genAI) {
    throw new Error('AI service not available');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const threatTypesStr = threatTypes.length > 0 
      ? `Focus specifically on: ${threatTypes.join(', ')}` 
      : 'Look for any potential threats or anomalies';

    const prompt = `Analyze this aerial image for threat detection. ${threatTypesStr}
    
    Identify:
    - Pest infestations
    - Disease outbreaks
    - Equipment failures
    - Security breaches
    - Wildlife interference
    - Weather damage
    - Unauthorized activities
    - Infrastructure issues
    
    For each threat found, provide:
    - Threat type and severity (low/medium/high/critical)
    - Location description
    - Confidence level
    - Immediate actions needed
    - Long-term recommendations
    
    Image URL: ${imageUrl}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const threatAnalysis = response.text();

    const threats = parseThreatAnalysis(threatAnalysis);

    return {
      threatsDetected: threats.length,
      threats,
      overallRiskLevel: calculateOverallRisk(threats),
      analysisTimestamp: new Date(),
      fullAnalysis: threatAnalysis
    };

  } catch (error) {
    logger.error('Threat detection error:', error);
    throw new Error('Threat detection failed');
  }
};

// Generate mission optimization suggestions
export const generateOptimizations = async (missionData) => {
  if (!genAI) {
    throw new Error('AI service not available');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this drone mission data and provide optimization recommendations:
    
    Mission Data: ${JSON.stringify(missionData, null, 2)}
    
    Provide optimizations for:
    1. Flight path efficiency
    2. Battery management
    3. Data collection quality
    4. Weather considerations
    5. Risk mitigation
    6. Cost reduction
    7. Time efficiency
    8. Safety improvements
    
    Format as actionable recommendations with expected benefits.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const optimizations = response.text();

    return {
      recommendations: parseOptimizationRecommendations(optimizations),
      expectedBenefits: extractExpectedBenefits(optimizations),
      priorityLevel: calculatePriorityLevel(optimizations),
      implementationComplexity: assessImplementationComplexity(optimizations),
      fullAnalysis: optimizations,
      generatedAt: new Date()
    };

  } catch (error) {
    logger.error('Optimization generation error:', error);
    throw new Error('Optimization generation failed');
  }
};

// Helper functions for parsing AI responses
function parseAnalysisResponse(analysisText, missionType) {
  // Extract key findings, confidence scores, and recommendations
  return {
    summary: analysisText.substring(0, 200) + '...',
    findings: extractFindings(analysisText),
    confidence: extractConfidence(analysisText),
    recommendations: extractRecommendations(analysisText),
    threats: extractThreats(analysisText),
    missionType,
    timestamp: new Date()
  };
}

function extractHealthScore(analysis) {
  const scoreMatch = analysis.match(/health score.*?(\d+)/i);
  return scoreMatch ? parseInt(scoreMatch[1]) : 75;
}

function extractCoverage(analysis) {
  const coverageMatch = analysis.match(/coverage.*?(\d+)%/i);
  return coverageMatch ? parseInt(coverageMatch[1]) : 85;
}

function extractStressIndicators(analysis) {
  const stressKeywords = ['stress', 'disease', 'pest', 'deficiency', 'drought'];
  return stressKeywords.filter(keyword => 
    analysis.toLowerCase().includes(keyword)
  );
}

function extractRecommendations(analysis) {
  const lines = analysis.split('\n');
  return lines
    .filter(line => line.toLowerCase().includes('recommend') || 
                    line.toLowerCase().includes('suggest') ||
                    line.toLowerCase().includes('should'))
    .map(line => line.trim())
    .slice(0, 5);
}

function parseThreatAnalysis(analysis) {
  // Simple threat extraction - in production, use more sophisticated parsing
  const threats = [];
  const threatTypes = ['pest', 'disease', 'equipment', 'security', 'weather'];
  
  threatTypes.forEach((type, index) => {
    if (analysis.toLowerCase().includes(type)) {
      threats.push({
        id: `threat_${Date.now()}_${index}`,
        type,
        severity: extractSeverity(analysis, type),
        confidence: 0.7 + Math.random() * 0.3,
        description: `${type} detected in aerial imagery`,
        location: 'Detected in image analysis'
      });
    }
  });
  
  return threats;
}

function extractSeverity(analysis, threatType) {
  const severityLevels = ['low', 'medium', 'high', 'critical'];
  const context = analysis.toLowerCase();
  
  if (context.includes('critical') || context.includes('severe')) return 'critical';
  if (context.includes('high') || context.includes('major')) return 'high';
  if (context.includes('medium') || context.includes('moderate')) return 'medium';
  return 'low';
}

function calculateOverallRisk(threats) {
  if (threats.length === 0) return 'low';
  
  const hascritical = threats.some(t => t.severity === 'critical');
  const hasHigh = threats.some(t => t.severity === 'high');
  
  if (hascritical) return 'critical';
  if (hasHigh || threats.length > 3) return 'high';
  if (threats.length > 1) return 'medium';
  return 'low';
}

function parseOptimizationRecommendations(optimizations) {
  const lines = optimizations.split('\n');
  return lines
    .filter(line => line.trim().length > 20)
    .map(line => line.trim())
    .slice(0, 10);
}

function extractExpectedBenefits(optimizations) {
  const benefitKeywords = ['save', 'reduce', 'improve', 'increase', 'optimize'];
  return benefitKeywords.filter(keyword => 
    optimizations.toLowerCase().includes(keyword)
  ).map(keyword => `Expected to ${keyword} performance`);
}

function calculatePriorityLevel(optimizations) {
  const urgentKeywords = ['urgent', 'critical', 'immediate', 'priority'];
  const hasUrgent = urgentKeywords.some(keyword => 
    optimizations.toLowerCase().includes(keyword)
  );
  
  return hasUrgent ? 'high' : 'medium';
}

function assessImplementationComplexity(optimizations) {
  const complexKeywords = ['complex', 'difficult', 'advanced', 'requires'];
  const hasComplex = complexKeywords.some(keyword => 
    optimizations.toLowerCase().includes(keyword)
  );
  
  return hasComplex ? 'high' : 'medium';
}

function extractFindings(analysis) {
  // Simple finding extraction
  const sentences = analysis.split(/[.!?]+/);
  return sentences
    .filter(sentence => sentence.trim().length > 20)
    .slice(0, 5)
    .map(sentence => sentence.trim());
}

function extractConfidence(analysis) {
  const confidenceMatch = analysis.match(/confidence.*?(\d+)%/i) ||
                          analysis.match(/(\d+)%.*?confidence/i);
  return confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.8;
}

function extractThreats(analysis) {
  // Extract potential threats mentioned in analysis
  const threatKeywords = ['threat', 'risk', 'danger', 'problem', 'issue'];
  const foundThreats = [];
  
  threatKeywords.forEach(keyword => {
    if (analysis.toLowerCase().includes(keyword)) {
      foundThreats.push({
        type: keyword,
        severity: 'medium',
        confidence: 0.7
      });
    }
  });
  
  return foundThreats;
}