/**
 * CareerCraft.buzz Appointment Booking System Configuration
 * Business hours, slot intervals, holidays, and appointment policies.
 */

module.exports = {
  // Business timezone (Standard India Standard Time default, override with APP_TIMEZONE)
  timezone: process.env.APP_TIMEZONE || 'Asia/Kolkata',

  // Admin Notification Email for incoming consultation bookings
  adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'harshasubhash123@gmail.com',

  // Standard working days (0=Sunday, 1=Monday, ..., 6=Saturday)
  workingDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday

  // Operating Hours
  businessHours: {
    start: '09:00', // 9:00 AM
    end: '18:00',   // 6:00 PM
  },

  // Break / Lunch Hours
  breakHours: {
    start: '13:00', // 1:00 PM
    end: '14:00',   // 2:00 PM
  },

  // Default duration per slot in minutes (if not customized by service)
  defaultSlotDurationMinutes: 30,

  // Maximum simultaneous bookings allowed per specific service slot
  maxBookingsPerSlot: 1,

  // Minimum advance notice required for booking (in minutes, e.g., 30 mins)
  minimumAdvanceNoticeMinutes: 30,

  // Maximum days in advance a user can book an appointment
  maxAdvanceBookingDays: 60,

  // Configured company holidays (YYYY-MM-DD format)
  holidays: [
    '2026-01-26', // Republic Day
    '2026-08-15', // Independence Day
    '2026-10-02', // Gandhi Jayanti
    '2026-11-08', // Diwali
    '2026-12-25', // Christmas Day
  ],

  // Contact / Support Details
  supportContact: {
    email: 'support@careercraft.buzz',
    phone: '+91 93802 68436',
    hours: 'Mon-Sat: 9:00 AM - 6:00 PM IST',
    location: 'Bangalore, Karnataka, India',
    website: 'https://careercraft.buzz'
  }
};
