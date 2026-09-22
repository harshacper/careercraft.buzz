/**
 * CareerCraft Calendar API Service
 * Generates direct Google Calendar, Outlook, Office 365, Yahoo Calendar links
 * and standard RFC 5545 iCalendar (.ics) export files for Apple Calendar, Google Calendar, and Mobile devices.
 */

class CalendarService {
  /**
   * Helper to format Date & Time into UTC/Local iCal and URL format strings (YYYYMMDDTHHmmSSZ or YYYYMMDDTHHmmSS)
   */
  formatDateTime(dateStr, timeStr) {
    // dateStr: YYYY-MM-DD, timeStr: HH:MM
    const [year, month, day] = (dateStr || '').split('-').map(Number);
    const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);

    if (!year || !month || !day) {
      const now = new Date();
      return {
        iso: now.toISOString(),
        compactUtc: now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        compactLocal: `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}00`
      };
    }

    // Treat as Asia/Kolkata (+05:30) or local business time
    // Convert to ISO string
    const d = new Date(Date.UTC(year, month - 1, day, hours - 5, minutes - 30));
    const compactUtc = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const compactLocal = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}00`;

    return {
      iso: d.toISOString(),
      compactUtc,
      compactLocal
    };
  }

  /**
   * Generate Google Calendar Add Event link
   */
  generateGoogleCalendarUrl({ title, description, location, date, startTime, endTime }) {
    const startObj = this.formatDateTime(date, startTime);
    const endObj = this.formatDateTime(date, endTime || startTime);

    const dates = `${startObj.compactUtc}/${endObj.compactUtc}`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title || 'CareerCraft Consultation Session',
      dates: dates,
      details: description || 'CareerCraft 1-on-1 Consultation Session. Join at https://careercraft.buzz',
      location: location || 'Online Video Meeting (CareerCraft)',
      ctz: 'Asia/Kolkata'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /**
   * Generate Outlook Web Calendar Add Event link
   */
  generateOutlookUrl({ title, description, location, date, startTime, endTime }) {
    const startObj = this.formatDateTime(date, startTime);
    const endObj = this.formatDateTime(date, endTime || startTime);

    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: title || 'CareerCraft Consultation Session',
      body: description || 'CareerCraft 1-on-1 Consultation Session. Join at https://careercraft.buzz',
      location: location || 'Online Video Meeting (CareerCraft)',
      startdt: startObj.iso,
      enddt: endObj.iso
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }

  /**
   * Generate Office 365 Calendar link
   */
  generateOffice365Url({ title, description, location, date, startTime, endTime }) {
    const startObj = this.formatDateTime(date, startTime);
    const endObj = this.formatDateTime(date, endTime || startTime);

    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: title || 'CareerCraft Consultation Session',
      body: description || 'CareerCraft 1-on-1 Consultation Session. Join at https://careercraft.buzz',
      location: location || 'Online Video Meeting (CareerCraft)',
      startdt: startObj.iso,
      enddt: endObj.iso
    });

    return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
  }

  /**
   * Generate Yahoo Calendar link
   */
  generateYahooUrl({ title, description, location, date, startTime, endTime }) {
    const startObj = this.formatDateTime(date, startTime);
    const endObj = this.formatDateTime(date, endTime || startTime);

    const params = new URLSearchParams({
      v: '60',
      title: title || 'CareerCraft Consultation Session',
      st: startObj.compactUtc,
      et: endObj.compactUtc,
      desc: description || 'CareerCraft 1-on-1 Consultation Session. Join at https://careercraft.buzz',
      in_loc: location || 'Online Video Meeting (CareerCraft)'
    });

    return `https://calendar.yahoo.com/?${params.toString()}`;
  }

  /**
   * Generate standard RFC 5545 iCalendar (.ics) string content
   */
  generateIcsFile({ id, title, description, location, date, startTime, endTime, customerName, customerEmail }) {
    const startObj = this.formatDateTime(date, startTime);
    const endObj = this.formatDateTime(date, endTime || startTime);
    const nowObj = this.formatDateTime();

    const uid = id ? `appointment-${id}@careercraft.buzz` : `appt-${Date.now()}@careercraft.buzz`;
    const cleanTitle = (title || 'CareerCraft Consultation').replace(/\r?\n/g, ' ');
    const cleanDesc = (description || 'CareerCraft 1-on-1 Consultation Session. Visit https://careercraft.buzz to manage.').replace(/\r?\n/g, '\\n');
    const cleanLoc = (location || 'Online Video Conference (CareerCraft)').replace(/\r?\n/g, ' ');

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CareerCraft//Appointment Scheduler 2.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowObj.compactUtc}`,
      `DTSTART:${startObj.compactUtc}`,
      `DTEND:${endObj.compactUtc}`,
      `SUMMARY:${cleanTitle}`,
      `DESCRIPTION:${cleanDesc}`,
      `LOCATION:${cleanLoc}`,
      'STATUS:CONFIRMED',
      'ORGANIZER;CN="CareerCraft Bookings":MAILTO:bookings@careercraft.buzz',
      customerEmail ? `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN="${customerName || 'Customer'}":MAILTO:${customerEmail}` : '',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Your CareerCraft Consultation begins in 15 minutes',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
  }

  /**
   * Helper to construct all calendar metadata & deep-links for an appointment record
   */
  getCalendarBundle(appointment, baseUrl = 'https://careercraft.buzz') {
    const serviceName = appointment.service?.name || appointment.serviceName || 'Career Consultation';
    const title = `CareerCraft: ${serviceName}`;
    const description = `CareerCraft 1-on-1 Consultation Session.\\nService: ${serviceName}\\nDuration: ${appointment.service?.durationMinutes || 30} mins\\nCustomer: ${appointment.customer?.name || appointment.customerName || 'Client'}\\nStatus: ${appointment.status}\\nReference: #${(appointment.id || '').slice(0, 8)}\\n\\nManage your appointment anytime at https://careercraft.buzz`;
    const location = 'Online Video Meeting (CareerCraft)';

    const eventParams = {
      title,
      description,
      location,
      date: appointment.appointmentDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      customerName: appointment.customer?.name || appointment.customerName,
      customerEmail: appointment.customer?.email || appointment.customerEmail,
      id: appointment.id
    };

    const google = this.generateGoogleCalendarUrl(eventParams);
    const outlook = this.generateOutlookUrl(eventParams);
    const office365 = this.generateOffice365Url(eventParams);
    const yahoo = this.generateYahooUrl(eventParams);

    const icsUrl = appointment.id 
      ? `${baseUrl}/api/appointments/ics/${appointment.id}` 
      : `${baseUrl}/api/appointments/calendar/ics?date=${appointment.appointmentDate}&time=${appointment.startTime}&service=${encodeURIComponent(serviceName)}`;

    return {
      googleCalendarUrl: google,
      outlookCalendarUrl: outlook,
      office365CalendarUrl: office365,
      yahooCalendarUrl: yahoo,
      icsDownloadUrl: icsUrl,
      event: {
        title,
        date: appointment.appointmentDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        location
      }
    };
  }
}

module.exports = new CalendarService();
