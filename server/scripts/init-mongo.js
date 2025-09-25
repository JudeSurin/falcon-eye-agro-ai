// MongoDB initialization script
db = db.getSiblingDB('hoverfly');

// Create collections
db.createCollection('users');
db.createCollection('missions');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ auth0Id: 1 }, { unique: true, sparse: true });

db.missions.createIndex({ operatorId: 1, createdAt: -1 });
db.missions.createIndex({ status: 1 });
db.missions.createIndex({ 'schedule.startTime': 1 });
db.missions.createIndex({ 'area.center': '2dsphere' });

// Insert sample data
db.users.insertOne({
  name: 'Demo User',
  email: 'demo@hoverfly.com',
  role: 'admin',
  permissions: ['view_missions', 'create_missions', 'delete_missions', 'view_analytics', 'manage_users'],
  isActive: true,
  preferences: {
    theme: 'dark',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    units: {
      temperature: 'celsius',
      distance: 'metric',
      speed: 'kmh'
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print('HoverFly database initialized successfully!');