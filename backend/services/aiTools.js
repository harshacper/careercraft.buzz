/**
 * Controlled Server-Side AI Tool Functions
 * Safe interfaces for the AI agent to query website knowledge and execute appointment operations.
 */

const { getKnowledge, websiteKnowledge } = require('../knowledge/websiteKnowledge');
const appointmentService = require('./appointmentService');
const businessRules = require('../config/businessRules');

const toolDefinitions = [
  {
    name: 'get_website_information',
    description: 'Retrieve verified information about CareerCraft features, resume builder, ATS scoring, skill gap roadmap, 100+ companies directory, pricing plans, authentication, or FAQs.',
    parameters: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Topic to lookup: e.g. "pricing", "resume-builder", "ats-analyzer", "skill-gap", "companies", "appointments", "support", "auth", or "all".'
        }
      },
      required: ['topic']
    }
  },
  {
    name: 'search_services',
    description: 'List all available CareerCraft 1-on-1 consultation services (e.g. Resume Consultation, Career Strategy, Mock Interview, ATS Advice, Skill Gap Transition Plan).',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_available_slots',
    description: 'Check available appointment time slots for a specified consultation service on a specific date (YYYY-MM-DD).',
    parameters: {
      type: 'object',
      properties: {
        service_id: {
          type: 'string',
          description: 'UUID of the service or service name keyword.'
        },
        date: {
          type: 'string',
          description: 'Target booking date in YYYY-MM-DD format (e.g. "2026-09-25").'
        }
      },
      required: ['date']
    }
  },
  {
    name: 'book_appointment',
    description: 'Create and confirm a new consultation appointment after customer details, service, date, and start time are confirmed.',
    parameters: {
      type: 'object',
      properties: {
        customer_name: {
          type: 'string',
          description: "Customer's full name"
        },
        customer_email: {
          type: 'string',
          description: "Customer's email address"
        },
        customer_phone: {
          type: 'string',
          description: "Customer's phone number"
        },
        service_id: {
          type: 'string',
          description: 'UUID of the consultation service'
        },
        date: {
          type: 'string',
          description: 'Appointment date in YYYY-MM-DD format'
        },
        start_time: {
          type: 'string',
          description: 'Start time in HH:MM 24-hour format (e.g. "15:00")'
        },
        notes: {
          type: 'string',
          description: 'Optional notes or specific topics to discuss'
        }
      },
      required: ['customer_name', 'customer_email', 'date', 'start_time']
    }
  },
  {
    name: 'get_customer_appointments',
    description: 'Lookup existing bookings for a customer by their email address or user ID.',
    parameters: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Customer email address'
        }
      },
      required: ['email']
    }
  },
  {
    name: 'reschedule_appointment',
    description: 'Reschedule an existing appointment to a new date and time slot.',
    parameters: {
      type: 'object',
      properties: {
        appointment_id: {
          type: 'string',
          description: 'ID of the appointment to reschedule'
        },
        new_date: {
          type: 'string',
          description: 'New date in YYYY-MM-DD format'
        },
        new_start_time: {
          type: 'string',
          description: 'New start time in HH:MM format'
        }
      },
      required: ['appointment_id', 'new_date', 'new_start_time']
    }
  },
  {
    name: 'cancel_appointment',
    description: 'Cancel an existing consultation appointment.',
    parameters: {
      type: 'object',
      properties: {
        appointment_id: {
          type: 'string',
          description: 'ID of the appointment to cancel'
        },
        reason: {
          type: 'string',
          description: 'Reason for cancellation'
        }
      },
      required: ['appointment_id']
    }
  },
  {
    name: 'get_support_information',
    description: 'Get official contact channels, support email, phone, operating hours, and location for CareerCraft.',
    parameters: {
      type: 'object',
      properties: {}
    }
  }
];

/**
 * Tool Executor Implementation
 */
async function executeTool(name, args, sessionUser = null) {
  try {
    switch (name) {
      case 'get_website_information': {
        const topic = args?.topic || 'all';
        return {
          success: true,
          data: getKnowledge(topic)
        };
      }

      case 'search_services': {
        const services = await appointmentService.getServices();
        return {
          success: true,
          count: services.length,
          services
        };
      }

      case 'get_available_slots': {
        const { service_id, date } = args;
        let targetServiceId = service_id;

        // If not a UUID, attempt to resolve by name
        if (!targetServiceId || !targetServiceId.includes('-')) {
          const matched = await appointmentService.findService(targetServiceId);
          if (matched) {
            targetServiceId = matched.id;
          } else {
            const all = await appointmentService.getServices();
            targetServiceId = all[0]?.id;
          }
        }

        const availability = await appointmentService.getAvailableSlots(targetServiceId, date);
        return {
          success: true,
          ...availability
        };
      }

      case 'book_appointment': {
        const { customer_name, customer_email, customer_phone, service_id, date, start_time, notes } = args;
        
        let targetServiceId = service_id;
        if (!targetServiceId || !targetServiceId.includes('-')) {
          const matched = await appointmentService.findService(targetServiceId);
          if (matched) targetServiceId = matched.id;
          else {
            const all = await appointmentService.getServices();
            targetServiceId = all[0]?.id;
          }
        }

        const booking = await appointmentService.bookAppointment({
          customerName: customer_name || sessionUser?.fullName,
          customerEmail: customer_email || sessionUser?.email,
          customerPhone: customer_phone || sessionUser?.phoneNumber || 'N/A',
          userId: sessionUser?.id || sessionUser?._id || null,
          serviceId: targetServiceId,
          appointmentDate: date,
          startTime: start_time,
          notes: notes || 'Booked via CareerCraft AI'
        });

        return {
          success: true,
          message: 'Appointment confirmed successfully!',
          appointment: booking
        };
      }

      case 'get_customer_appointments': {
        const email = args?.email || sessionUser?.email;
        if (!email) {
          return {
            success: false,
            message: 'Please provide an email address to look up appointments.'
          };
        }

        const bookings = await appointmentService.getCustomerAppointments(email);
        return {
          success: true,
          email,
          count: bookings.length,
          appointments: bookings
        };
      }

      case 'reschedule_appointment': {
        const { appointment_id, new_date, new_start_time } = args;
        const updated = await appointmentService.rescheduleAppointment(appointment_id, new_date, new_start_time);
        return {
          success: true,
          message: 'Appointment rescheduled successfully!',
          appointment: updated
        };
      }

      case 'cancel_appointment': {
        const { appointment_id, reason } = args;
        const cancelled = await appointmentService.cancelAppointment(appointment_id, reason);
        return {
          success: true,
          message: 'Appointment cancelled successfully.',
          appointment: cancelled
        };
      }

      case 'get_support_information': {
        return {
          success: true,
          support: businessRules.supportContact
        };
      }

      default:
        return {
          success: false,
          error: `Unknown tool: ${name}`
        };
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  toolDefinitions,
  executeTool
};
