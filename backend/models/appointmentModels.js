const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// 1. Service Model
const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'services',
  timestamps: true,
});

// 2. Customer Model
const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'customers',
  timestamps: true,
  indexes: [
    { fields: ['email'] }
  ]
});

// 3. Appointment Model
const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  appointmentDate: {
    type: DataTypes.STRING, // YYYY-MM-DD
    allowNull: false,
  },
  startTime: {
    type: DataTypes.STRING, // HH:MM
    allowNull: false,
  },
  endTime: {
    type: DataTypes.STRING, // HH:MM
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show'),
    defaultValue: 'confirmed',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cancelledReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'appointments',
  timestamps: true,
  indexes: [
    { fields: ['appointmentDate'] },
    { fields: ['status'] },
    { fields: ['customerId'] },
    { fields: ['serviceId'] }
  ]
});

// 4. Availability Model
const Availability = sequelize.define('Availability', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  dayOfWeek: {
    type: DataTypes.INTEGER, // 0=Sunday, 1=Monday, ..., 6=Saturday
    allowNull: false,
  },
  startTime: {
    type: DataTypes.STRING,
    defaultValue: '09:00',
  },
  endTime: {
    type: DataTypes.STRING,
    defaultValue: '18:00',
  },
  breakStart: {
    type: DataTypes.STRING,
    defaultValue: '13:00',
  },
  breakEnd: {
    type: DataTypes.STRING,
    defaultValue: '14:00',
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'availability',
  timestamps: true,
});

// 5. ConversationSession Model
const ConversationSession = sequelize.define('ConversationSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  contextData: {
    type: DataTypes.TEXT, // Stored as JSON string
    get() {
      const raw = this.getDataValue('contextData');
      try {
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    },
    set(val) {
      this.setDataValue('contextData', typeof val === 'object' ? JSON.stringify(val) : val);
    }
  },
  lastActivity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'conversation_sessions',
  timestamps: true,
  indexes: [
    { fields: ['sessionId'] }
  ]
});

// Associations
Customer.hasMany(Appointment, { foreignKey: 'customerId', as: 'appointments' });
Appointment.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Service.hasMany(Appointment, { foreignKey: 'serviceId', as: 'appointments' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

// Seed initial default services and availability if table is empty
async function initAppointmentDb() {
  try {
    await sequelize.sync();

    const servicesCount = await Service.count();
    if (servicesCount === 0) {
      console.log('Seeding default CareerCraft consultation services...');
      await Service.bulkCreate([
        {
          id: '11111111-1111-1111-1111-111111111101',
          name: 'Resume Consultation & Review',
          description: 'Comprehensive 1-on-1 resume audit, bullet-point optimization, and ATS pass-rate review with a career advisor.',
          durationMinutes: 30,
          price: 0,
          currency: 'INR',
          isActive: true
        },
        {
          id: '11111111-1111-1111-1111-111111111102',
          name: '1-on-1 Career Strategy & Roadmap',
          description: 'Personalized career roadmap session tailored for landing product-based, service-based, or startup roles.',
          durationMinutes: 45,
          price: 0,
          currency: 'INR',
          isActive: true
        },
        {
          id: '11111111-1111-1111-1111-111111111103',
          name: 'Mock Technical & HR Interview',
          description: 'Realistic mock interview simulation with behavioral feedback, DSA/technical questions, and communication tips.',
          durationMinutes: 60,
          price: 0,
          currency: 'INR',
          isActive: true
        },
        {
          id: '11111111-1111-1111-1111-111111111104',
          name: 'ATS Optimization & Job Match Advice',
          description: 'Direct alignment of your existing resume with specific target company JDs (Google, Amazon, TCS, etc.).',
          durationMinutes: 30,
          price: 0,
          currency: 'INR',
          isActive: true
        },
        {
          id: '11111111-1111-1111-1111-111111111105',
          name: 'Skill Gap Analysis & Transition Plan',
          description: 'Detailed breakdown of missing technical skills and project recommendations to crack your next dream role.',
          durationMinutes: 45,
          price: 0,
          currency: 'INR',
          isActive: true
        }
      ]);
    }

    const availCount = await Availability.count();
    if (availCount === 0) {
      console.log('Seeding default CareerCraft availability schedule...');
      await Availability.bulkCreate([
        { dayOfWeek: 0, isAvailable: false }, // Sunday
        { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00', isAvailable: true },
        { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00', isAvailable: true },
        { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00', isAvailable: true },
        { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00', isAvailable: true },
        { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00', isAvailable: true },
        { dayOfWeek: 6, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00', isAvailable: true },
      ]);
    }
  } catch (err) {
    console.error('Error initializing appointment models:', err.message);
  }
}

module.exports = {
  Service,
  Customer,
  Appointment,
  Availability,
  ConversationSession,
  initAppointmentDb,
  sequelize
};
