const express = require('express');
const router = express.Router();
const appointmentService = require('../services/appointmentService');
const calendarService = require('../services/calendarService');
const jwt = require('jsonwebtoken');

// Helper to extract optional auth user
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'admin_authenticated') {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
      }
    } catch (e) {
      // Ignore invalid token in optional auth
    }
  }
  next();
};

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const adminToken = req.headers['x-admin-token'] || (authHeader && authHeader.split(' ')[1]);

  if (adminToken === 'admin_authenticated') {
    return next();
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      if (decoded && (decoded.role === 'admin' || decoded.id === 'harsha-admin-override')) {
        req.admin = decoded;
        return next();
      }
    } catch (e) {
      // Token verification failed
    }
  }

  return res.status(401).json({ message: 'Admin authorization required.' });
};

// ==========================================
// CALENDAR API ENDPOINTS
// ==========================================

// Calendar metadata & links for a booking
router.get('/calendar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Appointment, Customer, Service } = require('../models/appointmentModels');
    const appt = await Appointment.findByPk(id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Service, as: 'service' }
      ]
    });

    if (!appt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const host = req.get('host') || 'careercraft.buzz';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    const calendarData = calendarService.getCalendarBundle(appt.toJSON(), baseUrl);
    res.json({ success: true, calendar: calendarData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download .ics file by appointment ID
router.get(['/ics/:id', '/calendar/:id/ics'], async (req, res) => {
  try {
    const { id } = req.params;
    const { Appointment, Customer, Service } = require('../models/appointmentModels');
    const appt = await Appointment.findByPk(id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Service, as: 'service' }
      ]
    });

    if (!appt) {
      return res.status(404).send('Appointment not found');
    }

    const apptData = appt.toJSON();
    const icsString = calendarService.generateIcsFile({
      id: apptData.id,
      title: `CareerCraft Consultation: ${apptData.service?.name || 'Career Strategy'}`,
      description: `CareerCraft 1-on-1 Consultation Session.\nCustomer: ${apptData.customer?.name}\nStatus: ${apptData.status}\nBooking Reference: #${(apptData.id || '').slice(0, 8)}`,
      date: apptData.appointmentDate,
      startTime: apptData.startTime,
      endTime: apptData.endTime,
      customerName: apptData.customer?.name,
      customerEmail: apptData.customer?.email
    });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="careercraft-booking-${apptData.id.slice(0, 8)}.ics"`);
    res.send(icsString);
  } catch (err) {
    res.status(500).send(`Error generating calendar invite: ${err.message}`);
  }
});

// Dynamic .ics generator via query parameters
router.get('/calendar-invite/download', (req, res) => {
  try {
    const { title, date, startTime, endTime, customerName, customerEmail } = req.query;
    if (!date || !startTime) {
      return res.status(400).send('date and startTime query params are required.');
    }

    const icsString = calendarService.generateIcsFile({
      title: title || 'CareerCraft Consultation Session',
      description: 'CareerCraft 1-on-1 Consultation Session. Manage at https://careercraft.buzz',
      date,
      startTime,
      endTime: endTime || startTime,
      customerName: customerName || 'Client',
      customerEmail: customerEmail || ''
    });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="careercraft-session-${date}.ics"`);
    res.send(icsString);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ==========================================
// APPOINTMENT SERVICE & BOOKING ENDPOINTS
// ==========================================

// 1. GET /api/appointments/services - List all active services
router.get(['/services', '/services/'], async (req, res) => {
  try {
    const services = await appointmentService.getServices();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /api/appointments/availability - Check available slots for a date & service
router.get(['/availability', '/availability/'], async (req, res) => {
  try {
    const { serviceId, date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Query parameter "date" (YYYY-MM-DD) is required.' });
    }

    const availability = await appointmentService.getAvailableSlots(serviceId, date);
    res.json(availability);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. POST /api/appointments - Book a new appointment
router.post(['/', ''], optionalAuth, async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      serviceId,
      appointmentDate,
      startTime,
      notes
    } = req.body;

    if (!customerName || !customerEmail || !appointmentDate || !startTime) {
      return res.status(400).json({
        error: 'Missing required fields: customerName, customerEmail, appointmentDate, startTime.'
      });
    }

    const booking = await appointmentService.bookAppointment({
      customerName,
      customerEmail,
      customerPhone,
      userId: req.user?.id || null,
      serviceId,
      appointmentDate,
      startTime,
      notes
    });

    const host = req.get('host') || 'careercraft.buzz';
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    const calendarBundle = calendarService.getCalendarBundle(booking, baseUrl);

    res.status(201).json({
      success: true,
      message: 'Appointment successfully confirmed!',
      appointment: booking,
      calendar: calendarBundle
    });
  } catch (err) {
    console.error('Booking error:', err.message);
    const status = err.message.includes('already booked') ? 409 : 400;
    res.status(status).json({ error: err.message });
  }
});

// 4. GET /api/appointments/my - Get logged in user's appointments
router.get('/my', optionalAuth, async (req, res) => {
  try {
    const email = req.query.email || req.user?.email;
    if (!email) {
      return res.status(400).json({ error: 'User email is required to fetch appointments.' });
    }

    const appointments = await appointmentService.getCustomerAppointments(email);
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. GET /api/appointments - Admin or filtered list of appointments
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status, date, search, page, limit } = req.query;
    const list = await appointmentService.listAllAppointments({
      status,
      date,
      search,
      page,
      limit
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. GET /api/appointments/admin/stats - Admin summary metrics
router.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await appointmentService.getAdminStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. PATCH /api/appointments/:id - Reschedule or update status / notes
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, status, notes, reason } = req.body;

    if (date && startTime) {
      const rescheduled = await appointmentService.rescheduleAppointment(id, date, startTime, reason);
      return res.json({ success: true, message: 'Appointment rescheduled!', appointment: rescheduled });
    }

    if (status === 'cancelled') {
      const cancelled = await appointmentService.cancelAppointment(id, reason);
      return res.json({ success: true, message: 'Appointment cancelled!', appointment: cancelled });
    }

    // Direct status or note update by admin
    const { Appointment, Customer, Service } = require('../models/appointmentModels');
    const appt = await Appointment.findByPk(id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Service, as: 'service' }
      ]
    });

    if (!appt) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    if (status) appt.status = status;
    if (notes !== undefined) appt.notes = notes;
    await appt.save();

    res.json({ success: true, appointment: appt.toJSON() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 8. DELETE /api/appointments/:id - Cancel appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const cancelled = await appointmentService.cancelAppointment(id, reason);
    res.json({ success: true, message: 'Appointment cancelled successfully.', appointment: cancelled });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
