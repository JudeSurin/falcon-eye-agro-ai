# HoverFly Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Clone and setup
git clone <repository-url>
cd hoverfly

# Configure environment variables
cp server/.env.example server/.env
# Edit server/.env with your API keys

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 2: Local Development

```bash
# Install dependencies
npm run setup

# Start MongoDB locally
mongod

# Development mode (starts both frontend and backend)
npm run dev:full

# Or start separately
npm run dev          # Frontend (http://localhost:8080)
npm run server:dev   # Backend (http://localhost:5000)
```

### Option 3: Production Deployment

#### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

#### Backend (Heroku/Railway/AWS)
```bash
cd server
# Set environment variables in your platform
# Deploy server folder
```

## 🔐 Required API Keys

Create accounts and get API keys for:

1. **MongoDB**: 
   - Local: `mongodb://localhost:27017/hoverfly`
   - Cloud: MongoDB Atlas connection string

2. **Auth0**: https://auth0.com
   - Domain, Client ID, Client Secret

3. **Google Maps**: https://console.cloud.google.com
   - Enable Maps JavaScript API, Geocoding API, Elevation API

4. **OpenWeather**: https://openweathermap.org/api
   - Current Weather Data API

5. **Google Gemini**: https://ai.google.dev
   - Generative AI API key

## 🔧 Environment Variables

### Server (.env)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/hoverfly

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# APIs
GOOGLE_MAPS_API_KEY=your-google-maps-key
OPENWEATHER_API_KEY=your-openweather-key  
GEMINI_API_KEY=your-gemini-api-key

# Server Config
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```bash
VITE_API_URL=https://your-backend-domain.com/api
VITE_AUTH0_DOMAIN=your-domain.auth0.com  
VITE_AUTH0_CLIENT_ID=your-client-id
```

## 📦 Production Checklist

- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Configure MongoDB with authentication
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS for your domain
- [ ] Set up monitoring and logging
- [ ] Configure backups for database
- [ ] Set up error tracking (Sentry)
- [ ] Configure CDN for static assets
- [ ] Set up health checks
- [ ] Configure auto-scaling (if needed)

## 🔍 Monitoring & Logs

### Backend Logs
```bash
# View application logs
tail -f server/logs/combined.log

# View error logs  
tail -f server/logs/error.log

# Docker logs
docker-compose logs backend
```

### Database Monitoring
```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/hoverfly

# Check database stats
db.stats()

# Monitor collections
db.missions.count()
db.users.count()
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB is running
   brew services list | grep mongodb
   # or
   sudo systemctl status mongod
   ```

2. **API Keys Not Working**
   - Verify keys are correct in .env files
   - Check API quotas and limits
   - Ensure APIs are enabled in respective consoles

3. **CORS Errors**
   - Update CLIENT_URL in backend .env
   - Check CORS configuration in server.js

4. **Build Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📊 Performance Optimization

### Database Optimization
- Use MongoDB Atlas for production
- Set up proper indexes (already configured)
- Enable sharding for large datasets
- Configure connection pooling

### API Optimization  
- Implement Redis caching
- Use CDN for static assets
- Enable gzip compression
- Set up request rate limiting

### Frontend Optimization
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle size analysis
- Service worker for caching

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy HoverFly
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      # Deploy steps here
```

## 📞 Support

For deployment issues:
1. Check logs for error details
2. Verify all environment variables
3. Test API endpoints individually
4. Check network connectivity and firewall rules
5. Consult service provider documentation

## 🎯 Scaling Considerations

### Horizontal Scaling
- Load balancer for multiple backend instances
- MongoDB replica sets
- Redis cluster for caching
- CDN for global distribution

### Monitoring & Alerts
- Application Performance Monitoring (APM)
- Database monitoring
- Error tracking and alerting
- Uptime monitoring
- Resource usage alerts