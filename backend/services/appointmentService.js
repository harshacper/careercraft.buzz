/**
 * CareerCraft Appointment Service
 * Handles slot generation, booking validation, conflict resolution, rescheduling, and cancellation.
 */

const { Service, Customer, Appointment, Availability, ConversationSession } = require('../models/appointmentModels');
const businessRules = require('../config/businessRules');
const notificationService = require('./notificationService');
const { Op } = require('sequelize');

class AppointmentService {
  /**
   * List all active consultation services
   */
  async getServices() {
    const services = await Service.findAll({
      where: { isActive: true },
      order: [['durationMinutes', 'ASC']]
    });

    return services.map(s => s.toJSON());
  }

  /**
   * Find service by ID or Name
   */
  async findService(identifier) {
    if (!identifier) return null;
    let service = null;

    // Check by ID if UUID
    if (typeof identifier === 'string' && identifier.includes('-')) {
      service = await Service.findByPk(identifier);
    }

    if (!service) {
      service = await Service.findOne({
        where: {
          name: {
            [Op.like]: `%${identifier}%`
          },
          isActive: true
        }
      });
    }

    return service ? service.toJSON() : null;
  }

  /**
   * Calculate available time slots for a given service and date
   * @param {string} serviceId
   * @param {string} dateStr YYYY-MM-DD
   */
  async getAvailableSlots(serviceId, dateStr) {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD.');
    }

    const service = await Service.findByPk(serviceId) || await Service.findOne({ where: { isActive: true } });
    if (!service) {
      throw new Error('Service not found.');
    }

    const targetDate = new Date(`${dateStr}T00:00:00`);
    const dayOfWeek = targetDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

    // 1. Check if closed on configured holiday
    if (businessRules.holidays.includes(dateStr)) {
      return {
        date: dateStr,
        service: service.toJSON(),
        isWorkingDay: false,
        reason: 'Office closed for public holiday.',
        slots: []
      };
    }

    // 2. Check if working day
    if (!businessRules.workingDays.includes(dayOfWeek)) {
      return {
        date: dateStr,
        service: service.toJSON(),
        isWorkingDay: false,
        reason: 'Sunday is a non-working day.',
        slots: []
      };
    }

    // 3. Query availability schedule for this day
    const sched = await Availability.findOne({ where: { dayOfWeek } });
    if (!sched || !sched.isAvailable) {
      return {
        date: dateStr,
        service: service.toJSON(),
        isWorkingDay: false,
        reason: 'No availability scheduled for this day.',
        slots: []
      };
    }

    const startTimeStr = sched.startTime || businessRules.businessHours.start;
    const endTimeStr = sched.endTime || businessRules.businessHours.end;
    const breakStartStr = sched.breakStart || businessRules.breakHours.start;
    const breakEndStr = sched.breakEnd || businessRules.breakHours.end;
    const slotDuration = service.durationMinutes || businessRules.defaultSlotDurationMinutes;

    // Helper: convert HH:MM to minutes from midnight
    const toMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    // Helper: convert minutes from midnight to HH:MM (24h) and 12h formatted string
    const toTimeObj = (totalMinutes) => {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      const time24 = `${hh}:${mm}`;

      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const displayTime = `${h12}:${mm} ${period}`;

      return { time24, displayTime };
    };

    const startMin = toMinutes(startTimeStr);
    const endMin = toMinutes(endTimeStr);
    const breakStartMin = toMinutes(breakStartStr);
    const breakEndMin = toMinutes(breakEndStr);

    // 4. Fetch already booked appointments for this date (excluding cancelled)
    const existingBookings = await Appointment.findAll({
      where: {
        appointmentDate: dateStr,
        status: {
          [Op.notIn]: ['cancelled']
        }
      }
    });

    const bookedSlotStarts = new Set(existingBookings.map(b => b.startTime.slice(0, 5)));

    // 5. Determine current time in configured timezone to filter past slots if booking for today
    const now = new Date();
    // Format today in local business timezone (YYYY-MM-DD)
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: businessRules.timezone });
    const isToday = (dateStr === todayStr);
    
    // If target date is in the past
    if (dateStr < todayStr) {
      return {
        date: dateStr,
        service: service.toJSON(),
        isWorkingDay: true,
        reason: 'Selected date is in the past.',
        slots: []
      };
    }

    let currentMinutesNow = 0;
    if (isToday) {
      const currentHours = Number(now.toLocaleTimeString('en-US', { timeZone: businessRules.timezone, hour12: false, hour: '2-digit' }));
      const currentMins = Number(now.toLocaleTimeString('en-US', { timeZone: businessRules.timezone, minute: '2-digit' }));
      currentMinutesNow = currentHours * 60 + currentMins + businessRules.minimumAdvanceNoticeMinutes;
    }

    const availableSlots = [];

    // Generate intervals
    for (let current = startMin; current + slotDuration <= endMin; current += slotDuration) {
      const slotEnd = current + slotDuration;

      // Skip slots that overlap with lunch / break hours
      const isDuringBreak = (current < breakEndMin && slotEnd > breakStartMin);
      if (isDuringBreak) continue;

      const { time24, displayTime } = toTimeObj(current);
      const endObj = toTimeObj(slotEnd);

      // Skip past slots for today
      if (isToday && current < currentMinutesNow) {
        continue;
      }

      // Check if already booked
      const isBooked = bookedSlotStarts.has(time24);

      if (!isBooked) {
        availableSlots.push({
          startTime: time24,
          endTime: endObj.time24,
          displayTime: `${displayTime} - ${endObj.displayTime}`,
          startDisplay: displayTime,
          durationMinutes: slotDuration,
          period: current < 720 ? 'Morning' : (current < 1020 ? 'Afternoon' : 'Evening')
        });
      }
    }

    return {
      date: dateStr,
      service: service.toJSON(),
      isWorkingDay: true,
      totalAvailable: availableSlots.length,
      slots: availableSlots
    };
  }

  /**
   * Create or update customer record
   */
  async createOrGetCustomer({ name, email, phone, userId = null }) {
    if (!email || !name) {
      throw new Error('Name and email are required.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    let customer = await Customer.findOne({ where: { email: normalizedEmail } });

    if (!customer) {
      customer = await Customer.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: (phone || 'N/A').trim(),
        userId: userId || null
      });
    } else {
      // Update phone or name if provided
      let updated = false;
      if (name && customer.name !== name.trim()) {
        customer.name = name.trim();
        updated = true;
      }
      if (phone && customer.phone !== phone.trim() && phone !== 'N/A') {
        customer.phone = phone.trim();
        updated = true;
      }
      if (userId && !customer.userId) {
        customer.userId = userId;
        updated = true;
      }
      if (updated) {
        await customer.save();
      }
    }

    return customer.toJSON();
  }

  /**
   * Book a new appointment
   */
  async bookAppointment({
    customerName,
    customerEmail,
    customerPhone,
    userId = null,
    serviceId,
    appointmentDate,
    startTime,
    notes = ''
  }) {
    // 1. Validation
    if (!customerName || !customerEmail) {
      throw new Error('Customer name and email are required.');
    }
    if (!appointmentDate || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      throw new Error('Valid appointment date (YYYY-MM-DD) is required.');
    }
    if (!startTime || !/^\d{2}:\d{2}/.test(startTime)) {
      throw new Error('Valid start time (HH:MM) is required.');
    }

    const formattedStartTime = startTime.slice(0, 5);

    // 2. Fetch service
    const service = await Service.findByPk(serviceId) || await Service.findOne({ where: { isActive: true } });
    if (!service) {
      throw new Error('Selected service not found.');
    }

    // Calculate end time
    const [sh, sm] = formattedStartTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = startMin + (service.durationMinutes || 30);
    const eh = Math.floor(endMin / 60);
    const em = endMin % 60;
    const formattedEndTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

    // 3. Double booking prevention check
    const existing = await Appointment.findOne({
      where: {
        appointmentDate,
        startTime: formattedStartTime,
        serviceId: service.id,
        status: {
          [Op.notIn]: ['cancelled']
        }
      }
    });

    if (existing) {
      throw new Error(`The slot on ${appointmentDate} at ${formattedStartTime} is already booked. Please choose another slot.`);
    }

    // 4. Create or retrieve customer
    const customer = await this.createOrGetCustomer({
      name: customerName,
      email: customerEmail,
      phone: customerPhone || 'N/A',
      userId
    });

    // 5. Create Appointment
    const appointment = await Appointment.create({
      customerId: customer.id,
      serviceId: service.id,
      appointmentDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      status: 'confirmed',
      notes: notes || 'Booked via CareerCraft AI'
    });

    const appointmentJson = appointment.toJSON();
    appointmentJson.customer = customer;
    appointmentJson.service = service.toJSON();

    // 6. Trigger notification
    try {
      await notificationService.sendConfirmationNotification({
        appointment: appointmentJson,
        customer,
        service: service.toJSON()
      });
    } catch (err) {
      console.warn('Notification failed:', err.message);
    }

    return appointmentJson;
  }

  /**
   * Get all appointments for a customer (by email or userId)
   */
  async getCustomerAppointments(emailOrUserId) {
    if (!emailOrUserId) return [];

    let customer = await Customer.findOne({
      where: {
        [Op.or]: [
          { email: emailOrUserId.toLowerCase().trim() },
          { userId: emailOrUserId },
          { id: emailOrUserId }
        ]
      }
    });

    if (!customer) return [];

    const appointments = await Appointment.findAll({
      where: { customerId: customer.id },
      include: [
        { model: Service, as: 'service' },
        { model: Customer, as: 'customer' }
      ],
      order: [['appointmentDate', 'DESC'], ['startTime', 'DESC']]
    });

    return appointments.map(a => a.toJSON());
  }

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(appointmentId, newDate, newStartTime, reason = '') {
    if (!appointmentId) throw new Error('Appointment ID is required.');
    if (!newDate || !newStartTime) throw new Error('New date and start time are required.');

    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Service, as: 'service' },
        { model: Customer, as: 'customer' }
      ]
    });

    if (!appointment) throw new Error('Appointment not found.');

    const formattedStartTime = newStartTime.slice(0, 5);
    const service = appointment.service;
    const [sh, sm] = formattedStartTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = startMin + (service?.durationMinutes || 30);
    const eh = Math.floor(endMin / 60);
    const em = endMin % 60;
    const formattedEndTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

    // Check conflict
    const conflict = await Appointment.findOne({
      where: {
        id: { [Op.ne]: appointmentId },
        appointmentDate: newDate,
        startTime: formattedStartTime,
        serviceId: appointment.serviceId,
        status: { [Op.notIn]: ['cancelled'] }
      }
    });

    if (conflict) {
      throw new Error(`The requested slot on ${newDate} at ${formattedStartTime} is already booked.`);
    }

    const previousDate = appointment.appointmentDate;
    const previousTime = appointment.startTime;

    appointment.appointmentDate = newDate;
    appointment.startTime = formattedStartTime;
    appointment.endTime = formattedEndTime;
    appointment.status = 'rescheduled';
    appointment.notes = `${appointment.notes || ''} [Rescheduled from ${previousDate} ${previousTime}]`;
    await appointment.save();

    const updated = appointment.toJSON();

    try {
      await notificationService.sendRescheduleNotification({
        appointment: updated,
        customer: updated.customer,
        service: updated.service,
        previousDate,
        previousTime
      });
    } catch (err) {
      console.warn('Reschedule notification error:', err.message);
    }

    return updated;
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(appointmentId, reason = '') {
    if (!appointmentId) throw new Error('Appointment ID is required.');

    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Service, as: 'service' },
        { model: Customer, as: 'customer' }
      ]
    });

    if (!appointment) throw new Error('Appointment not found.');

    appointment.status = 'cancelled';
    appointment.cancelledReason = reason || 'Cancelled by user';
    await appointment.save();

    const updated = appointment.toJSON();

    try {
      await notificationService.sendCancellationNotification({
        appointment: updated,
        customer: updated.customer,
        service: updated.service,
        reason: appointment.cancelledReason
      });
    } catch (err) {
      console.warn('Cancellation notification error:', err.message);
    }

    return updated;
  }

  /**
   * Admin: List all appointments with filtering and search
   */
  async listAllAppointments({ status, date, search, page = 1, limit = 50 }) {
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (date) {
      where.appointmentDate = date;
    }

    const customerWhere = {};
    if (search) {
      customerWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const appointments = await Appointment.findAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          where: search ? customerWhere : undefined
        },
        { model: Service, as: 'service' }
      ],
      order: [['appointmentDate', 'DESC'], ['startTime', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit)
    });

    return appointments.map(a => a.toJSON());
  }

  /**
   * Admin: Get statistics summary
   */
  async getAdminStats() {
    const total = await Appointment.count();
    const confirmed = await Appointment.count({ where: { status: 'confirmed' } });
    const pending = await Appointment.count({ where: { status: 'pending' } });
    const completed = await Appointment.count({ where: { status: 'completed' } });
    const cancelled = await Appointment.count({ where: { status: 'cancelled' } });
    const rescheduled = await Appointment.count({ where: { status: 'rescheduled' } });

    return {
      total,
      confirmed,
      pending,
      completed,
      cancelled,
      rescheduled
    };
  }
}

module.exports = new AppointmentService();
