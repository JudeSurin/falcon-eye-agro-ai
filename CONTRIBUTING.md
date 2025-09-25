# Contributing to HoverFly 🚁

Thank you for your interest in contributing to HoverFly! We welcome contributions from developers of all skill levels. This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Workflow](#contributing-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful** and inclusive to all contributors
- **Be collaborative** and constructive in discussions
- **Be patient** with newcomers and those learning
- **Focus on what's best** for the community and project
- **Show empathy** towards other community members

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js 18+** installed
- **MongoDB 7+** (local or Atlas)
- **Git** for version control
- **Code editor** (VS Code recommended)
- **API keys** for testing (Google Maps, OpenWeather, Gemini)

### Areas Where You Can Help

- 🐛 **Bug fixes** and issue resolution
- ✨ **New features** and enhancements
- 📚 **Documentation** improvements
- 🧪 **Testing** and test coverage
- 🎨 **UI/UX** improvements
- 🌐 **Internationalization** support
- 🔧 **Performance** optimizations

## 💻 Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/yourusername/hoverfly.git
cd hoverfly

# Add upstream remote
git remote add upstream https://github.com/originalowner/hoverfly.git
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm run setup

# Or install separately
npm install              # Frontend dependencies
cd server && npm install # Backend dependencies
```

### 3. Environment Setup

```bash
# Copy environment files
cp server/.env.example server/.env
cp .env.example .env

# Configure your development API keys
# Don't commit real API keys to the repository!
```

### 4. Database Setup

```bash
# Start MongoDB locally
mongod

# Or use Docker
docker run -d -p 27017:27017 --name hoverfly-mongo mongo:7.0
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev:full

# Or start separately
npm run dev          # Frontend (localhost:8080)
npm run server:dev   # Backend (localhost:5000)
```

## 🔄 Contributing Workflow

### 1. Create a Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-number-description
```

### 2. Make Changes

- Write clean, readable code
- Follow existing code patterns
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run frontend checks
npm run lint
npm run type-check

# Run backend checks
cd server
npm run lint
npm test
```

### 4. Commit Changes

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add real-time drone telemetry display"
```

**Commit Message Format:**
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create a pull request on GitHub
```

## 📝 Coding Standards

### TypeScript/JavaScript

```typescript
// ✅ Good - Clear naming and type safety
interface DronePosition {
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: Date;
}

const updateDronePosition = (position: DronePosition): void => {
  // Implementation
};

// ❌ Avoid - Unclear naming and no types
const updatePos = (pos: any) => {
  // Implementation
};
```

### React Components

```tsx
// ✅ Good - Proper component structure
interface MissionCardProps {
  mission: Mission;
  onSelect: (id: string) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({ 
  mission, 
  onSelect 
}) => {
  return (
    <Card className="mission-card">
      <CardHeader>
        <CardTitle>{mission.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
};
```

### CSS/Styling

```css
/* ✅ Good - Use design system tokens */
.mission-status {
  @apply bg-success/10 text-success border-success/20;
}

/* ❌ Avoid - Direct color values */
.mission-status {
  background-color: #10b981;
  color: white;
}
```

### API Design

```typescript
// ✅ Good - RESTful and consistent
GET    /api/missions              // List missions
POST   /api/missions              // Create mission
GET    /api/missions/:id          // Get specific mission
PUT    /api/missions/:id          // Update mission
DELETE /api/missions/:id          // Delete mission

// ✅ Good - Proper error handling
app.get('/api/missions/:id', async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    res.json({ mission });
  } catch (error) {
    logger.error('Error fetching mission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## 🧪 Testing Guidelines

### Frontend Testing

```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { MissionCard } from './MissionCard';

describe('MissionCard', () => {
  const mockMission = {
    id: '1',
    name: 'Test Mission',
    status: 'active'
  };

  it('renders mission name correctly', () => {
    render(<MissionCard mission={mockMission} onSelect={jest.fn()} />);
    expect(screen.getByText('Test Mission')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const mockOnSelect = jest.fn();
    render(<MissionCard mission={mockMission} onSelect={mockOnSelect} />);
    
    fireEvent.click(screen.getByText('Test Mission'));
    expect(mockOnSelect).toHaveBeenCalledWith('1');
  });
});
```

### Backend Testing

```typescript
// API endpoint testing with Jest and Supertest
import request from 'supertest';
import app from '../server';

describe('GET /api/missions', () => {
  it('should return list of missions', async () => {
    const response = await request(app)
      .get('/api/missions')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('missions');
    expect(Array.isArray(response.body.missions)).toBe(true);
  });

  it('should require authentication', async () => {
    await request(app)
      .get('/api/missions')
      .expect(401);
  });
});
```

## 📨 Pull Request Process

### PR Checklist

Before submitting your PR, ensure:

- [ ] **Code follows** project coding standards
- [ ] **Tests pass** locally
- [ ] **Documentation updated** if needed
- [ ] **No console errors** or warnings
- [ ] **Responsive design** works on mobile
- [ ] **Accessibility** standards met
- [ ] **Performance** impact considered

### PR Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Include screenshots for UI changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

### Review Process

1. **Automated Checks** - CI/CD pipeline runs tests
2. **Code Review** - Maintainers review your code
3. **Feedback** - Address any requested changes
4. **Approval** - Once approved, PR will be merged

## 🐛 Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Clear title** describing the issue
- **Steps to reproduce** the bug
- **Expected behavior** vs actual behavior
- **Environment details** (browser, OS, Node version)
- **Screenshots** or error messages
- **Minimal code example** if applicable

### Bug Report Template

```markdown
## Bug Description
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear description of what you expected to happen.

## Actual Behavior
A clear description of what actually happened.

## Environment
- OS: [e.g. iOS, Windows, Linux]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]
- Node.js version: [e.g. 18.17.0]

## Additional Context
Add any other context about the problem here.
```

## 💡 Feature Requests

We welcome feature requests! Please:

- **Search existing issues** to avoid duplicates
- **Provide clear use case** for the feature
- **Describe the solution** you'd like to see
- **Consider alternatives** you've thought about
- **Be open to discussion** about implementation

### Feature Request Template

```markdown
## Feature Summary
A clear and concise description of the feature you'd like to see.

## Problem Statement
What problem does this feature solve? What's the current limitation?

## Proposed Solution
Describe your ideal solution to this problem.

## Alternatives Considered
Describe any alternative solutions or features you've considered.

## Additional Context
Add any other context, screenshots, or examples about the feature request.

## Implementation Ideas
If you have ideas about how this could be implemented, please share them.
```

## 🎯 Development Tips

### Useful Commands

```bash
# Lint and fix code
npm run lint:fix

# Type checking
npm run type-check

# Build for production
npm run build

# Run specific tests
npm test -- --testNamePattern="MissionCard"

# Update dependencies
npm run update-deps

# Clean install
npm run clean-install
```

### Debugging

```typescript
// Use structured logging
import { logger } from '../utils/logger';

logger.info('Mission created', { missionId, userId });
logger.error('Database connection failed', { error: error.message });

// Use TypeScript strict mode
// Enable in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Performance Considerations

- **Optimize images** before adding to the repository
- **Lazy load components** for better initial load times
- **Use React.memo** for expensive component renders
- **Implement proper caching** for API responses
- **Monitor bundle size** with webpack-bundle-analyzer

## 📚 Resources

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Node.js Documentation](https://nodejs.org/en/docs)
- [MongoDB Manual](https://docs.mongodb.com/manual)

### Tools
- [VS Code Extensions](https://marketplace.visualstudio.com/search?term=react%20typescript)
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools)
- [MongoDB Compass](https://www.mongodb.com/products/compass)

## 🆘 Getting Help

If you need help with contributing:

- **GitHub Discussions** - Ask questions and get help from the community
- **GitHub Issues** - Report bugs or request features
- **Code Review** - Learn from feedback on your pull requests
- **Documentation** - Refer to this guide and project README

## 🎉 Recognition

Contributors are recognized in:

- **Contributors section** of the README
- **Release notes** for their contributions
- **Special mentions** for significant contributions

Thank you for contributing to HoverFly! Your efforts help make precision agriculture more accessible and effective. 🌱✨