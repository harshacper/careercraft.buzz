/**
 * CareerCraft Appointment Service (Supabase-Native Edition)
 * Persists all appointments, customers, services, and schedules directly to Supabase Postgres.
 */

const supabase = require('../config/supabase');
const businessRules = require('../config/businessRules');
const notificationService = require('./notificationService');

// Helper to format Supabase customer record to application format
function formatCustomer(c) {
  if (!c) return null;
  return {
    id: c.id,
    userId: c.user_id,
    name: c.name,
    email: c.email,
    phone: c.phone || 'N/A',
    notes: c.notes,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  };
}

// Helper to format Supabase service record to application format
function formatService(s) {
  if (!s) return null;
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    durationMinutes: s.duration_minutes || 30,
    price: Number(s.price || 0),
    currency: s.currency || 'INR',
    isActive: s.is_active !== false,
    createdAt: s.created_at,
    updatedAt: s.updated_at
  };
}

// Helper to format Supabase appointment record to application format
function formatAppointment(a) {
  if (!a) return null;
  const customer = a.customer ? formatCustomer(a.customer) : null;
  const service = a.service ? formatService(a.service) : null;

  return {
    id: a.id,
    customerId: a.customer_id,
    serviceId: a.service_id,
    appointmentDate: typeof a.appointment_date === 'string' ? a.appointment_date.slice(0, 10) : a.appointment_date,
    startTime: typeof a.start_time === 'string' ? a.start_time.slice(0, 5) : a.start_time,
    endTime: typeof a.end_time === 'string' ? a.end_time.slice(0, 5) : a.end_time,
    status: a.status || 'confirmed',
    notes: a.notes,
    cancelledReason: a.cancelled_reason,
    meetLink: a.meet_link,
    customer,
    service,
    createdAt: a.created_at,
    updatedAt: a.updated_at
  };
}

class AppointmentService {
  /**
   * List all active consultation services from Supabase
   */
  async getServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('duration_minutes', { ascending: true });

      if (error) {
        console.warn('Supabase getServices query error:', error.message);
        throw error;
      }

      if (data && data.length > 0) {
        return data.map(formatService);
      }
    } catch (e) {
      console.warn('Falling back to default services list:', e.message);
    }

    // Default static services fallback if table is empty
    return [
      { id: '11111111-1111-1111-1111-111111111101', name: 'Resume Consultation & Review', durationMinutes: 30, price: 0, currency: 'INR', isActive: true },
      { id: '11111111-1111-1111-1111-111111111102', name: '1-on-1 Career Strategy & Roadmap', durationMinutes: 45, price: 0, currency: 'INR', isActive: true },
      { id: '11111111-1111-1111-1111-111111111103', name: 'Mock Technical & HR Interview', durationMinutes: 60, price: 0, currency: 'INR', isActive: true },
      { id: '11111111-1111-1111-1111-111111111104', name: 'ATS Optimization & Job Match Advice', durationMinutes: 30, price: 0, currency: 'INR', isActive: true },
      { id: '11111111-1111-1111-1111-111111111105', name: 'Skill Gap Analysis & Transition Plan', durationMinutes: 45, price: 0, currency: 'INR', isActive: true }
    ];
  }

  /**
   * Find service by ID or Name from Supabase
   */
  async findService(identifier) {
    if (!identifier) return null;

    try {
      if (typeof identifier === 'string' && identifier.includes('-')) {
        const { data } = await supabase
          .from('services')
          .select('*')
          .eq('id', identifier)
          .maybeSingle();

        if (data) return formatService(data);
      }

      const { data } = await supabase
        .from('services')
        .select('*')
        .ilike('name', `%${identifier}%`)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (data) return formatService(data);
    } catch (e) {
      console.warn('findService error:', e.message);
    }

    const all = await this.getServices();
    return all.find(s => s.id === identifier || s.name.toLowerCase().includes(String(identifier).toLowerCase())) || all[0];
  }

  /**
   * Calculate available time slots for a given service and date
   */
  async getAvailableSlots(serviceId, dateStr) {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD.');
    }

    const service = await this.findService(serviceId);
    if (!service) {
      throw new Error('Selected service was not found.');
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay();

    if (!businessRules.workingDays.includes(dayOfWeek)) {
      return {
        date: dateStr,
        service,
        isWorkingDay: false,
        reason: 'Sunday is a non-working day.',
        slots: []
      };
    }

    // Query availability schedule from Supabase
    let sched = null;
    try {
      const { data } = await supabase
        .from('availability')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .maybeSingle();
      sched = data;
    } catch (err) {
      console.warn('Availability schedule query warning:', err.message);
    }

    if (sched && !sched.is_available) {
      return {
        date: dateStr,
        service,
        isWorkingDay: false,
        reason: 'No availability scheduled for this day.',
        slots: []
      };
    }

    const startTimeStr = (sched?.start_time ? sched.start_time.slice(0, 5) : null) || businessRules.businessHours.start;
    const endTimeStr = (sched?.end_time ? sched.end_time.slice(0, 5) : null) || businessRules.businessHours.end;
    const breakStartStr = (sched?.break_start ? sched.break_start.slice(0, 5) : null) || businessRules.breakHours.start;
    const breakEndStr = (sched?.break_end ? sched.break_end.slice(0, 5) : null) || businessRules.breakHours.end;
    const slotDuration = service.durationMinutes || businessRules.defaultSlotDurationMinutes;

    const toMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

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

    // Fetch existing appointments from Supabase for this date
    let bookedSlotStarts = new Set();
    try {
      const { data: existingAppts } = await supabase
        .from('appointments')
        .select('start_time, status')
        .eq('appointment_date', dateStr)
        .neq('status', 'cancelled');

      if (existingAppts) {
        bookedSlotStarts = new Set(existingAppts.map(b => (b.start_time || '').slice(0, 5)));
      }
    } catch (e) {
      console.warn('Could not query existing appointments for slot check:', e.message);
    }

    // Determine current time in configured timezone
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: businessRules.timezone });
    const isToday = (dateStr === todayStr);

    if (dateStr < todayStr) {
      return {
        date: dateStr,
        service,
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
    for (let current = startMin; current + slotDuration <= endMin; current += slotDuration) {
      const slotEnd = current + slotDuration;
      const isDuringBreak = (current < breakEndMin && slotEnd > breakStartMin);
      if (isDuringBreak) continue;

      const { time24, displayTime } = toTimeObj(current);
      const endObj = toTimeObj(slotEnd);

      if (isToday && current < currentMinutesNow) continue;
      if (bookedSlotStarts.has(time24)) continue;

      availableSlots.push({
        startTime: time24,
        endTime: endObj.time24,
        displayTime: `${displayTime} - ${endObj.displayTime}`,
        startDisplay: displayTime,
        durationMinutes: slotDuration,
        period: current < 720 ? 'Morning' : (current < 1020 ? 'Afternoon' : 'Evening')
      });
    }

    return {
      date: dateStr,
      service,
      isWorkingDay: true,
      totalAvailable: availableSlots.length,
      slots: availableSlots
    };
  }

  /**
   * Create or update customer record in Supabase
   */
  async createOrGetCustomer({ name, email, phone, userId = null }) {
    if (!email || !name) {
      throw new Error('Name and email are required.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanPhone = (phone || 'N/A').trim();

    // Check if customer exists in Supabase
    const { data: existing, error: findErr } = await supabase
      .from('customers')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (findErr) {
      console.warn('Customer lookup error:', findErr.message);
    }

    if (existing) {
      // Update phone or name if provided
      const updates = {};
      if (name && existing.name !== name.trim()) updates.name = name.trim();
      if (cleanPhone && existing.phone !== cleanPhone && cleanPhone !== 'N/A') updates.phone = cleanPhone;
      if (userId && !existing.user_id) updates.user_id = userId;

      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString();
        const { data: updated } = await supabase
          .from('customers')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single();
        if (updated) return formatCustomer(updated);
      }
      return formatCustomer(existing);
    }

    // Insert new customer into Supabase
    const { data: created, error: createErr } = await supabase
      .from('customers')
      .insert([{
        name: name.trim(),
        email: normalizedEmail,
        phone: cleanPhone,
        user_id: userId || null
      }])
      .select()
      .single();

    if (createErr) {
      console.error('Supabase customer insert error:', createErr);
      throw createErr;
    }

    return formatCustomer(created);
  }

  /**
   * Book a new appointment directly in Supabase
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

    // Fetch service
    const service = await this.findService(serviceId);
    if (!service) {
      throw new Error('Selected consultation service was not found.');
    }

    // Calculate end time
    const [sh, sm] = formattedStartTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = startMin + (service.durationMinutes || 30);
    const eh = Math.floor(endMin / 60);
    const em = endMin % 60;
    const formattedEndTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

    // Conflict prevention check in Supabase
    const { data: conflict } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', appointmentDate)
      .eq('start_time', `${formattedStartTime}:00`)
      .eq('service_id', service.id)
      .neq('status', 'cancelled')
      .maybeSingle();

    if (conflict) {
      throw new Error(`The slot on ${appointmentDate} at ${formattedStartTime} is already booked. Please choose another slot.`);
    }

    // Create or retrieve customer
    const customer = await this.createOrGetCustomer({
      name: customerName,
      email: customerEmail,
      phone: customerPhone || 'N/A',
      userId
    });

    // Insert Appointment into Supabase
    const { data: appt, error: apptErr } = await supabase
      .from('appointments')
      .insert([{
        customer_id: customer.id,
        service_id: service.id,
        appointment_date: appointmentDate,
        start_time: `${formattedStartTime}:00`,
        end_time: `${formattedEndTime}:00`,
        status: 'confirmed',
        notes: notes || 'Booked via CareerCraft AI'
      }])
      .select()
      .single();

    if (apptErr) {
      console.error('Supabase appointment insert error:', apptErr);
      throw apptErr;
    }

    const appointmentJson = formatAppointment({
      ...appt,
      customer,
      service
    });

    // Trigger notification asynchronously
    notificationService.sendConfirmationNotification({
      appointment: appointmentJson,
      customer,
      service
    }).catch(err => {
      console.warn('[Notification Engine] Background dispatch error:', err.message);
    });

    return appointmentJson;
  }

  /**
   * Get all appointments for a customer from Supabase
   */
  async getCustomerAppointments(emailOrUserId) {
    if (!emailOrUserId) return [];
    const normalized = emailOrUserId.toLowerCase().trim();

    try {
      // Find customer
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .or(`email.eq.${normalized},user_id.eq.${emailOrUserId}`)
        .maybeSingle();

      if (!customer) return [];

      const { data: appts, error } = await supabase
        .from('appointments')
        .select('*, customer:customers(*), service:services(*)')
        .eq('customer_id', customer.id)
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) {
        console.warn('Customer appointments fetch error:', error.message);
        return [];
      }

      return (appts || []).map(formatAppointment);
    } catch (e) {
      console.warn('getCustomerAppointments error:', e.message);
      return [];
    }
  }

  /**
   * Get appointment by ID from Supabase
   */
  async getAppointmentById(id) {
    if (!id) return null;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, customer:customers(*), service:services(*)')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return null;
      return formatAppointment(data);
    } catch (e) {
      console.warn('getAppointmentById error:', e.message);
      return null;
    }
  }

  /**
   * Reschedule an appointment in Supabase
   */
  async rescheduleAppointment(appointmentId, newDate, newStartTime, reason = '') {
    if (!appointmentId) throw new Error('Appointment ID is required.');
    if (!newDate || !newStartTime) throw new Error('New date and start time are required.');

    const appt = await this.getAppointmentById(appointmentId);
    if (!appt) throw new Error('Appointment not found.');

    const formattedStartTime = newStartTime.slice(0, 5);
    const service = appt.service;
    const [sh, sm] = formattedStartTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = startMin + (service?.durationMinutes || 30);
    const eh = Math.floor(endMin / 60);
    const em = endMin % 60;
    const formattedEndTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

    // Conflict check
    const { data: conflict } = await supabase
      .from('appointments')
      .select('id')
      .neq('id', appointmentId)
      .eq('appointment_date', newDate)
      .eq('start_time', `${formattedStartTime}:00`)
      .eq('service_id', appt.serviceId)
      .neq('status', 'cancelled')
      .maybeSingle();

    if (conflict) {
      throw new Error(`The requested slot on ${newDate} at ${formattedStartTime} is already booked.`);
    }

    const previousDate = appt.appointmentDate;
    const previousTime = appt.startTime;

    const { data: updated, error } = await supabase
      .from('appointments')
      .update({
        appointment_date: newDate,
        start_time: `${formattedStartTime}:00`,
        end_time: `${formattedEndTime}:00`,
        status: 'rescheduled',
        notes: `${appt.notes || ''} [Rescheduled from ${previousDate} ${previousTime}]`,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select('*, customer:customers(*), service:services(*)')
      .single();

    if (error) throw error;
    const formatted = formatAppointment(updated);

    try {
      await notificationService.sendRescheduleNotification({
        appointment: formatted,
        customer: formatted.customer,
        service: formatted.service,
        previousDate,
        previousTime
      });
    } catch (err) {
      console.warn('Reschedule notification error:', err.message);
    }

    return formatted;
  }

  /**
   * Cancel an appointment in Supabase
   */
  async cancelAppointment(appointmentId, reason = '') {
    if (!appointmentId) throw new Error('Appointment ID is required.');

    const { data: updated, error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_reason: reason || 'Cancelled by user',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select('*, customer:customers(*), service:services(*)')
      .single();

    if (error) throw error;
    const formatted = formatAppointment(updated);

    try {
      await notificationService.sendCancellationNotification({
        appointment: formatted,
        customer: formatted.customer,
        service: formatted.service,
        reason: formatted.cancelledReason
      });
    } catch (err) {
      console.warn('Cancellation notification error:', err.message);
    }

    return formatted;
  }

  /**
   * Admin: List all appointments from Supabase
   */
  async listAllAppointments({ status, date, search, page = 1, limit = 50 }) {
    try {
      let query = supabase
        .from('appointments')
        .select('*, customer:customers(*), service:services(*)')
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      if (date) {
        query = query.eq('appointment_date', date);
      }

      const offset = (Number(page) - 1) * Number(limit);
      query = query.range(offset, offset + Number(limit) - 1);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(formatAppointment);
    } catch (e) {
      console.warn('listAllAppointments error:', e.message);
      return [];
    }
  }

  /**
   * Admin: Get statistics summary from Supabase
   */
  async getAdminStats() {
    try {
      const { data: allAppts, error } = await supabase
        .from('appointments')
        .select('status');

      if (error || !allAppts) {
        return { total: 0, confirmed: 0, pending: 0, completed: 0, cancelled: 0, rescheduled: 0 };
      }

      const total = allAppts.length;
      const confirmed = allAppts.filter(a => a.status === 'confirmed').length;
      const pending = allAppts.filter(a => a.status === 'pending').length;
      const completed = allAppts.filter(a => a.status === 'completed').length;
      const cancelled = allAppts.filter(a => a.status === 'cancelled').length;
      const rescheduled = allAppts.filter(a => a.status === 'rescheduled').length;

      return { total, confirmed, pending, completed, cancelled, rescheduled };
    } catch (e) {
      return { total: 0, confirmed: 0, pending: 0, completed: 0, cancelled: 0, rescheduled: 0 };
    }
  }
}

module.exports = new AppointmentService();
