# 📡 HoverFly API Documentation

Complete API reference for the HoverFly Elite Aerial Intelligence Platform.

## 🔗 Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## 🔐 Authentication

HoverFly uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Lifecycle
- **Access Token**: Expires in 24 hours
- **Refresh Token**: Expires in 7 days
- **Automatic Refresh**: Frontend handles token refresh automatically

---

## 🔑 Authentication Endpoints

### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "pilot@hoverfly.com",
  "password": "secure123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "pilot@hoverfly.com",
    "name": "Elite Pilot",
    "role": "operator"
  },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "New Pilot",
  "email": "newpilot@hoverfly.com",
  "password": "secure123",
  "role": "operator"
}
```

### Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### Logout
```http
POST /api/auth/logout
```

**Headers:** `Authorization: Bearer <token>`

---

## 🎯 Mission Management

### List All Missions
```http
GET /api/missions
```

**Query Parameters:**
- `status` (optional): Filter by mission status
- `limit` (optional): Number of missions to return (default: 50)
- `offset` (optional): Number of missions to skip (default: 0)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): asc or desc (default: desc)

**Example:**
```http
GET /api/missions?status=active&limit=10&sortBy=priority&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "missions": [
    {
      "_id": "mission_id",
      "name": "North Field Survey",
      "description": "Crop health monitoring mission",
      "status": "active",
      "priority": "high",
      "type": "crop_monitoring",
      "operatorId": "user_id",
      "area": {
        "name": "North Field",
        "polygon": [
          { "lat": 40.7128, "lng": -74.0060 },
          { "lat": 40.7130, "lng": -74.0058 }
        ],
        "center": { "lat": 40.7129, "lng": -74.0059 },
        "totalArea": 150.5
      },
      "schedule": {
        "startTime": "2024-01-15T08:00:00Z",
        "endTime": "2024-01-15T12:00:00Z",
        "duration": 240
      },
      "analytics": {
        "totalFlightTime": 120,
        "distanceCovered": 15.2,
        "imagesCaptures": 234,
        "videosRecorded": 12,
        "cropHealthScore": 85,
        "threatsDetected": 3,
        "areasAnalyzed": 8
      },
      "threats": [
        {
          "id": "threat_id",
          "type": "pest_infestation",
          "severity": "medium",
          "position": { "lat": 40.7129, "lng": -74.0059 },
          "description": "Aphid colony detected",
          "confidence": 0.89,
          "status": "active"
        }
      ],
      "createdAt": "2024-01-15T06:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

### Get Specific Mission
```http
GET /api/missions/:id
```

**Response:**
```json
{
  "success": true,
  "mission": {
    // Full mission object as shown above
  }
}
```

### Create Mission
```http
POST /api/missions
```

**Request Body:**
```json
{
  "name": "East Field Surveillance",
  "description": "Monitor crop health and detect pests",
  "type": "crop_monitoring",
  "priority": "high",
  "area": {
    "name": "East Field",
    "polygon": [
      { "lat": 40.7128, "lng": -74.0060 },
      { "lat": 40.7130, "lng": -74.0058 },
      { "lat": 40.7132, "lng": -74.0062 },
      { "lat": 40.7130, "lng": -74.0064 }
    ]
  },
  "schedule": {
    "startTime": "2024-01-16T08:00:00Z",
    "duration": 180
  }
}
```

**Response:**
```json
{
  "success": true,
  "mission": {
    "_id": "new_mission_id",
    // Full mission object
  }
}
```

### Update Mission
```http
PUT /api/missions/:id
```

**Request Body:** (Same as create, all fields optional)
```json
{
  "status": "paused",
  "description": "Updated mission description"
}
```

### Delete Mission
```http
DELETE /api/missions/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Mission deleted successfully"
}
```

### Get Real-time Mission Data
```http
GET /api/missions/:id/live
```

**Response:**
```json
{
  "success": true,
  "liveData": {
    "position": {
      "lat": 40.7129,
      "lng": -74.0059,
      "altitude": 50.5
    },
    "speed": 12.3,
    "batteryLevel": 87,
    "signalStrength": 95,
    "timestamp": "2024-01-15T10:35:22Z",
    "sensors": {
      "temperature": 22.5,
      "humidity": 65,
      "windSpeed": 8.2
    }
  }
}
```

---

## 🤖 AI Analysis Endpoints

### Analyze Image
```http
POST /api/ai/analyze-image
```

**Request Body:**
```json
{
  "imageUrl": "https://example.com/crop-image.jpg",
  "analysisType": "crop_health",
  "missionId": "mission_id"
}
```

**Analysis Types:**
- `crop_health`: Analyze crop health and identify issues
- `threat_detection`: Detect pests, diseases, and anomalies
- `mapping`: Generate field maps and boundaries
- `general`: General purpose image analysis

**Response:**
```json
{
  "success": true,
  "analysis": {
    "analysisId": "analysis_id",
    "type": "crop_health",
    "results": {
      "healthScore": 78,
      "issues": [
        {
          "type": "nutrient_deficiency",
          "severity": "medium",
          "confidence": 0.85,
          "location": "northeast_quadrant",
          "recommendation": "Apply nitrogen fertilizer"
        }
      ],
      "summary": "Crop shows signs of nitrogen deficiency in northeast section"
    },
    "metadata": {
      "processingTime": 2.3,
      "imageSize": "1920x1080",
      "analyzedAt": "2024-01-15T10:45:00Z"
    }
  }
}
```

### Generate Report
```http
POST /api/ai/generate-report
```

**Request Body:**
```json
{
  "missionId": "mission_id",
  "reportType": "detailed"
}
```

**Report Types:**
- `summary`: High-level overview
- `detailed`: Comprehensive analysis
- `executive`: Business-focused insights
- `technical`: Technical specifications and data

**Response:**
```json
{
  "success": true,
  "report": {
    "reportId": "report_id",
    "type": "detailed",
    "title": "Mission Analysis Report - North Field Survey",
    "generatedAt": "2024-01-15T11:00:00Z",
    "sections": [
      {
        "title": "Executive Summary",
        "content": "Mission completed successfully with 85% crop health score..."
      },
      {
        "title": "Threat Analysis",
        "content": "3 threats detected with medium to high severity..."
      }
    ],
    "downloadUrl": "https://api.hoverfly.com/reports/report_id.pdf"
  }
}
```

### AI Chat
```http
POST /api/ai/chat
```

**Request Body:**
```json
{
  "message": "What's the current status of my active missions?",
  "context": {
    "userId": "user_id",
    "currentPage": "dashboard"
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": "You currently have 3 active missions: North Field Survey (85% complete), East Orchard Monitoring (67% complete), and South Field Analysis (45% complete). All missions are running on schedule with optimal weather conditions.",
  "suggestions": [
    "View detailed mission analytics",
    "Check weather conditions",
    "Generate status report"
  ]
}
```

### Get AI Insights
```http
GET /api/ai/insights
```

**Response:**
```json
{
  "success": true,
  "insights": [
    {
      "type": "trend",
      "title": "Crop Health Improvement",
      "description": "Overall crop health has improved by 12% over the last 30 days",
      "severity": "positive",
      "actionRequired": false
    },
    {
      "type": "alert",
      "title": "Pest Activity Detected",
      "description": "Increased pest activity in East Field requires immediate attention",
      "severity": "high",
      "actionRequired": true,
      "recommendedActions": ["Deploy pest control mission", "Apply organic pesticide"]
    }
  ]
}
```

---

## 🌤️ Weather Endpoints

### Get Weather Data
```http
GET /api/weather/:location
```

**Parameters:**
- `location`: City name, coordinates, or zip code

**Example:**
```http
GET /api/weather/Miami,FL
GET /api/weather/40.7128,-74.0060
GET /api/weather/33101
```

**Response:**
```json
{
  "success": true,
  "weather": {
    "location": {
      "name": "Miami",
      "country": "US",
      "lat": 25.7617,
      "lng": -80.1918
    },
    "current": {
      "temperature": 78,
      "feelsLike": 82,
      "humidity": 65,
      "pressure": 30.12,
      "windSpeed": 8,
      "windDirection": 180,
      "visibility": 10,
      "uvIndex": 6,
      "condition": "Partly Cloudy",
      "icon": "partly-cloudy"
    },
    "forecast": {
      "today": {
        "high": 85,
        "low": 72,
        "condition": "Partly Cloudy"
      },
      "hourly": [
        {
          "time": "14:00",
          "temperature": 80,
          "condition": "Sunny",
          "windSpeed": 6
        }
      ]
    },
    "flightConditions": {
      "status": "optimal",
      "score": 95,
      "factors": {
        "windSpeed": "good",
        "visibility": "excellent",
        "precipitation": "none"
      },
      "recommendation": "Excellent conditions for drone operations"
    }
  }
}
```

---

## 🗺️ Maps & Geolocation

### Geocode Address
```http
GET /api/maps/geocode
```

**Query Parameters:**
- `address`: Address to geocode

**Example:**
```http
GET /api/maps/geocode?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "formattedAddress": "1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA",
      "location": {
        "lat": 37.4224764,
        "lng": -122.0842499
      },
      "placeId": "ChIJ2eUgeAK6j4ARbn5u_wAGqWA"
    }
  ]
}
```

### Get Elevation Data
```http
GET /api/maps/elevation
```

**Query Parameters:**
- `locations`: Pipe-separated lat,lng coordinates

**Example:**
```http
GET /api/maps/elevation?locations=40.7128,-74.0060|40.7130,-74.0058
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "elevation": 10.31,
      "location": {
        "lat": 40.7128,
        "lng": -74.0060
      },
      "resolution": 4.771976
    }
  ]
}
```

---

## 👥 User Management

### Get User Profile
```http
GET /api/users/profile
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "Elite Pilot",
    "email": "pilot@hoverfly.com",
    "role": "operator",
    "permissions": ["view_missions", "create_missions", "view_analytics"],
    "preferences": {
      "theme": "dark",
      "notifications": {
        "email": true,
        "push": true,
        "sms": false
      },
      "units": {
        "temperature": "fahrenheit",
        "distance": "imperial",
        "speed": "mph"
      }
    },
    "stats": {
      "totalMissions": 45,
      "successfulMissions": 42,
      "hoursFlown": 234.5,
      "areasAnalyzed": 1250
    }
  }
}
```

### Update User Profile
```http
PUT /api/users/profile
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "preferences": {
    "theme": "light",
    "notifications": {
      "email": false,
      "push": true
    }
  }
}
```

---

## 📊 Analytics Endpoints

### Get Dashboard Analytics
```http
GET /api/analytics/dashboard
```

**Query Parameters:**
- `period`: Time period (7d, 30d, 90d, 1y)
- `userId`: Specific user (admin only)

**Response:**
```json
{
  "success": true,
  "analytics": {
    "overview": {
      "totalMissions": 125,
      "activeMissions": 8,
      "completedMissions": 117,
      "averageCropHealth": 82,
      "threatsDetected": 23,
      "areasAnalyzed": 2340
    },
    "trends": {
      "missionGrowth": 15.3,
      "healthImprovement": 8.7,
      "threatReduction": -12.5
    },
    "chartData": {
      "missionsByDay": [
        { "date": "2024-01-10", "count": 12 },
        { "date": "2024-01-11", "count": 15 }
      ],
      "healthScores": [
        { "date": "2024-01-10", "score": 78 },
        { "date": "2024-01-11", "score": 82 }
      ]
    }
  }
}
```

---

## 🚨 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid mission parameters",
    "details": {
      "field": "area.polygon",
      "reason": "Polygon must have at least 3 points"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_12345"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_REQUIRED` | Valid authentication token required |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `MISSION_IN_PROGRESS` | Cannot modify active mission |
| `WEATHER_SERVICE_UNAVAILABLE` | Weather data temporarily unavailable |
| `AI_SERVICE_ERROR` | AI analysis service error |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

---

## 🔄 Rate Limiting

API endpoints are rate-limited to ensure fair usage:

- **Standard endpoints**: 100 requests per 15 minutes
- **AI analysis**: 10 requests per minute
- **Real-time data**: 60 requests per minute
- **Authentication**: 5 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🔐 Security Considerations

### API Key Security
- Never expose API keys in frontend code
- Use environment variables for sensitive data
- Rotate keys regularly
- Monitor API usage for anomalies

### Request Security
- All requests must use HTTPS in production
- Validate and sanitize all input data
- Implement proper CORS policies
- Use JWT tokens with appropriate expiration

### Data Privacy
- User data is encrypted at rest and in transit
- Personal information is never logged
- GDPR compliance for EU users
- Regular security audits and updates

---

## 📞 Support

For API support and questions:

- **Documentation**: [https://docs.hoverfly.com/api](https://docs.hoverfly.com/api)
- **GitHub Issues**: [Report API issues](https://github.com/yourusername/hoverfly/issues)
- **Email**: api-support@hoverfly.com
- **Response Time**: 24-48 hours for non-critical issues

---

*This API documentation is automatically updated with each release. For the latest version, visit our [online documentation](https://docs.hoverfly.com/api).*