# 🚁 HoverFly - Elite Aerial Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7+-green.svg)](https://www.mongodb.com/)

> **Elite agricultural intelligence through advanced drone surveillance and AI-powered crop monitoring.**

HoverFly is a cutting-edge full-stack application that revolutionizes precision agriculture through intelligent drone operations, real-time crop health monitoring, and AI-powered threat detection.

## 🌟 Key Features

### 🎯 **Mission Command Center**
- **Real-time drone tracking** with live GPS coordinates
- **Interactive mission planning** with waypoint mapping
- **Tactical mission deployment** with automated flight paths
- **Multi-drone fleet management** for large-scale operations

### 🌱 **AI-Powered Crop Intelligence** 
- **Computer vision analysis** for crop health assessment
- **Automated threat detection** (pests, diseases, nutrient deficiencies)
- **Predictive analytics** for yield optimization
- **Real-time alerts** for critical agricultural events

### 🗺️ **Advanced Mapping & Visualization**
- **Google Maps integration** with satellite and terrain views
- **Live drone camera feeds** overlaid on maps
- **Interactive agricultural zone management**
- **3D flight path visualization** and optimization

### ⚡ **Real-Time Intelligence Dashboard**
- **Live weather monitoring** with flight condition assessment
- **Comprehensive analytics** with actionable insights
- **Customizable alerts** and notification system
- **Executive reporting** with automated report generation

### 🔐 **Enterprise Security**
- **Zero-trust authentication** with Auth0 integration
- **Role-based access control** for multi-user environments
- **Encrypted data transmission** and secure API endpoints
- **Comprehensive audit logging** for compliance

## 🏗️ Technical Architecture

### **Frontend Stack**
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** with custom design system for responsive UI
- **shadcn/ui** component library for consistent design
- **Zustand** for lightweight state management
- **React Query** for efficient server state management
- **Framer Motion** for smooth animations and transitions

### **Backend Infrastructure**
- **Node.js** with Express.js for robust API development
- **MongoDB** with Mongoose for scalable data persistence
- **Socket.IO** for real-time communication
- **JWT authentication** with refresh token rotation
- **Rate limiting** and security middleware
- **Winston logging** for comprehensive monitoring

### **AI & External Integrations**
- **Google Gemini AI** for intelligent crop analysis
- **Google Maps API** for mapping and geolocation services
- **OpenWeather API** for weather data and flight conditions
- **Socket.IO** for real-time drone telemetry
- **Sharp** for image processing and optimization

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 18+** and npm/yarn
- **MongoDB 7+** (local or Atlas)
- **API Keys** for Google Maps, OpenWeather, and Gemini AI

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/yourusername/hoverfly.git
cd hoverfly

# Install dependencies (both frontend and backend)
npm run setup
```

### 2. Environment Configuration
```bash
# Copy environment templates
cp server/.env.example server/.env
cp .env.example .env

# Configure your API keys in server/.env
MONGODB_URI=mongodb://localhost:27017/hoverfly
GOOGLE_MAPS_API_KEY=your_google_maps_key
OPENWEATHER_API_KEY=your_openweather_key
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Database Setup
```bash
# Start MongoDB locally or use MongoDB Atlas
mongod

# The database will be automatically initialized on first run
```

### 4. Development Mode
```bash
# Start both frontend and backend simultaneously
npm run dev:full

# Or start separately:
npm run dev          # Frontend (http://localhost:8080)
npm run server:dev   # Backend (http://localhost:5000)
```

### 5. Production Deployment
```bash
# Using Docker (Recommended)
docker-compose up -d

# Or build manually
npm run build:full
```

## 📖 API Documentation

### Authentication Endpoints
```typescript
POST /api/auth/login     // User authentication
POST /api/auth/register  // User registration  
POST /api/auth/refresh   // Token refresh
POST /api/auth/logout    // User logout
```

### Mission Management
```typescript
GET    /api/missions              // List all missions
POST   /api/missions              // Create new mission
GET    /api/missions/:id          // Get mission details
PUT    /api/missions/:id          // Update mission
DELETE /api/missions/:id          // Delete mission
GET    /api/missions/:id/live     // Real-time mission data
```

### AI Analysis
```typescript
POST /api/ai/analyze-image        // Analyze crop images
POST /api/ai/generate-report      // Generate mission reports
POST /api/ai/chat                 // AI assistant chat
GET  /api/ai/insights             // Get AI insights
```

### Weather & Maps
```typescript
GET /api/weather/:location        // Weather conditions
GET /api/maps/geocode             // Location geocoding
GET /api/maps/elevation           // Elevation data
```

## 📁 Project Structure

```
hoverfly/
├── 📁 src/                          # Frontend React application
│   ├── 📁 components/               # Reusable UI components
│   │   ├── 📁 ui/                   # Base UI components (shadcn)
│   │   ├── 📁 dashboard/            # Dashboard-specific components
│   │   ├── 📁 layout/               # Layout components
│   │   └── 📁 chat/                 # AI chat components
│   ├── 📁 hooks/                    # Custom React hooks
│   ├── 📁 pages/                    # Application pages/routes
│   ├── 📁 services/                 # API client services
│   ├── 📁 store/                    # State management (Zustand)
│   └── 📁 lib/                      # Utility functions
├── 📁 server/                       # Backend Node.js application
│   ├── 📁 models/                   # MongoDB models (Mongoose)
│   ├── 📁 routes/                   # API route handlers
│   ├── 📁 middleware/               # Express middleware
│   ├── 📁 services/                 # Business logic services
│   ├── 📁 utils/                    # Backend utilities
│   └── 📁 scripts/                  # Database initialization
├── 📁 public/                       # Static assets
├── 📄 docker-compose.yml            # Multi-container deployment
├── 📄 Dockerfile                    # Frontend container
├── 📄 server/Dockerfile             # Backend container
└── 📄 DEPLOYMENT.md                 # Detailed deployment guide
```

## 🌐 Deployment Options

### Option 1: Docker Compose (Recommended)
```bash
# Production deployment with all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 2: Cloud Platforms
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Heroku, Railway, AWS, or DigitalOcean
- **Database**: MongoDB Atlas (recommended)

### Option 3: Local Development
```bash
# Development with hot reload
npm run dev:full
```

## 🔧 Configuration Guide

### Required API Keys

1. **Google Maps API** - [Get API Key](https://console.cloud.google.com/)
   - Enable: Maps JavaScript API, Geocoding API, Elevation API

2. **OpenWeather API** - [Get API Key](https://openweathermap.org/api)
   - Plan: Current Weather Data API

3. **Google Gemini AI** - [Get API Key](https://ai.google.dev/)
   - Model: Gemini Pro for text generation

4. **Auth0** (Optional) - [Setup Account](https://auth0.com/)
   - For production authentication

### Environment Variables
See [server/.env.example](server/.env.example) for complete configuration options.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- **TypeScript** for type safety
- **ESLint** and **Prettier** for code formatting
- **Conventional Commits** for commit messages
- **Jest** for testing (coming soon)

## 🔒 Security

- All API endpoints are protected with JWT authentication
- Rate limiting prevents API abuse
- Input validation and sanitization
- CORS configuration for secure cross-origin requests
- Environment variables for sensitive data

## 📊 Performance

- **Optimized React bundle** with code splitting
- **Efficient database queries** with proper indexing  
- **Image optimization** with Sharp processing
- **CDN ready** for global distribution
- **Caching strategies** for improved response times

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check if MongoDB is running
brew services list | grep mongodb
# or
sudo systemctl status mongod
```

**API Keys Not Working**
- Verify keys are correct in `.env` files
- Check API quotas and billing
- Ensure APIs are enabled in respective consoles

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📈 Roadmap

- [ ] **Mobile App** - React Native companion app
- [ ] **Advanced AI Models** - Custom trained models for crop recognition
- [ ] **IoT Integration** - Sensor data integration
- [ ] **Multi-tenant Architecture** - Enterprise customer management
- [ ] **Advanced Analytics** - Machine learning insights
- [ ] **Drone Hardware Integration** - Direct drone control APIs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for AI development inspiration
- **shadcn** for the incredible UI component library
- **Vercel** for Next.js and deployment infrastructure
- **MongoDB** for reliable data persistence
- **Google** for Maps and AI APIs

## 📞 Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/hoverfly/issues)
- **Discussions**: [Community discussions](https://github.com/yourusername/hoverfly/discussions)
- **Email**: support@hoverfly.com
- **Twitter**: [@HoverFlyTech](https://twitter.com/hoverflytech)

## ⭐ Show Your Support

If you find HoverFly useful, please consider:
- ⭐ **Starring** this repository
- 🍴 **Forking** for your own projects  
- 🐛 **Reporting issues** to help improve
- 💡 **Contributing** new features

---

**Built with ❤️ for the future of precision agriculture**

*HoverFly - Where artificial intelligence meets agricultural excellence*