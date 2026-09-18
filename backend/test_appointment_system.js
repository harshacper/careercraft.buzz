/**
 * Comprehensive Automated Verification Suite for CareerCraft Appointment System
 * Tests services, availability calculation, slot generation, double-booking prevention,
 * rescheduling, cancellation, and AI Chat / Tool endpoints.
 */

const appointmentService = require('./services/appointmentService');
const aiProvider = require('./services/aiProvider');
const { executeTool } = require('./services/aiTools');
const { initAppointmentDb } = require('./models/appointmentModels');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting CareerCraft AI & Appointments Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Initialize Database
    await initAppointmentDb();
    console.log('📦 Database initialized successfully.\n');

    // 2. Test Services Listing
    console.log('--- Test 1: Services Listing ---');
    const services = await appointmentService.getServices();
    assert(Array.isArray(services) && services.length >= 5, 'Should return at least 5 default consultation services');
    assert(services.some(s => s.name.includes('Resume Consultation')), 'Should contain "Resume Consultation & Review"');
    console.log(`Found ${services.length} active consultation services.\n`);

    // 3. Test Availability Calculation for a Future Working Day (e.g. 2026-09-25)
    console.log('--- Test 2: Availability Calculation ---');
    const testService = services[0];
    const testDate = '2026-09-25'; // Friday
    const avail = await appointmentService.getAvailableSlots(testService.id, testDate);
    
    assert(avail.isWorkingDay === true, 'Friday should be a working day');
    assert(Array.isArray(avail.slots) && avail.slots.length > 0, `Should generate available slots (found ${avail.slots.length})`);
    assert(avail.slots.every(s => !s.startTime.startsWith('13:')), 'Should exclude lunch break (13:00 - 14:00)');
    console.log(`Sample slot: ${avail.slots[0]?.displayTime} (${avail.slots[0]?.startTime})\n`);

    // 4. Test Sunday / Holiday Availability
    console.log('--- Test 3: Non-Working Day / Holiday Handling ---');
    const sundayDate = '2026-09-27'; // Sunday
    const sundayAvail = await appointmentService.getAvailableSlots(testService.id, sundayDate);
    assert(sundayAvail.isWorkingDay === false, 'Sunday should be marked as non-working day with 0 slots');
    assert(sundayAvail.slots.length === 0, 'Sunday slots list should be empty');

    // 5. Test Appointment Booking
    console.log('\n--- Test 4: Appointment Booking ---');
    const selectedSlot = avail.slots[0];
    const testEmail = `test.user.${Date.now()}@example.com`;

    const booking = await appointmentService.bookAppointment({
      customerName: 'Rahul Kumar',
      customerEmail: testEmail,
      customerPhone: '+91 9876543210',
      serviceId: testService.id,
      appointmentDate: testDate,
      startTime: selectedSlot.startTime,
      notes: 'Need urgent resume review for Google application'
    });

    assert(booking && booking.id, 'Should create appointment and return unique ID');
    assert(booking.status === 'confirmed', 'New booking should have status "confirmed"');
    assert(booking.customer.name === 'Rahul Kumar', 'Customer name should match');
    assert(booking.appointmentDate === testDate, 'Appointment date should match');
    console.log(`Created Appointment: ID ${booking.id} on ${booking.appointmentDate} at ${booking.startTime}\n`);

    // 6. Test Double-Booking Prevention
    console.log('--- Test 5: Double-Booking Prevention ---');
    let doubleBookingBlocked = false;
    try {
      await appointmentService.bookAppointment({
        customerName: 'Another User',
        customerEmail: 'another@example.com',
        customerPhone: '+91 9999999999',
        serviceId: testService.id,
        appointmentDate: testDate,
        startTime: selectedSlot.startTime, // Exact same date and time
        notes: 'Attempting conflicting booking'
      });
    } catch (err) {
      doubleBookingBlocked = true;
      assert(err.message.includes('already booked'), 'Error message should clearly state slot is already booked');
    }
    assert(doubleBookingBlocked === true, 'Double-booking must be strictly blocked by server validation');

    // 7. Test Customer Appointments Lookup
    console.log('\n--- Test 6: Customer Appointment Retrieval ---');
    const userAppts = await appointmentService.getCustomerAppointments(testEmail);
    assert(userAppts.length === 1, `Should find 1 appointment for ${testEmail}`);
    assert(userAppts[0].id === booking.id, 'Retrieved appointment ID must match booked appointment');

    // 8. Test Rescheduling
    console.log('\n--- Test 7: Rescheduling Appointment ---');
    const newSlot = avail.slots[1]; // Next available slot
    const rescheduled = await appointmentService.rescheduleAppointment(
      booking.id,
      testDate,
      newSlot.startTime,
      'Moved to later slot due to college class'
    );
    assert(rescheduled.status === 'rescheduled', 'Status should be updated to "rescheduled"');
    assert(rescheduled.startTime === newSlot.startTime, 'Start time should be updated');

    // 9. Test Cancellation
    console.log('\n--- Test 8: Cancellation ---');
    const cancelled = await appointmentService.cancelAppointment(booking.id, 'No longer needed');
    assert(cancelled.status === 'cancelled', 'Status should be updated to "cancelled"');

    // 10. Test AI Provider and Tool Calling
    console.log('\n--- Test 9: CareerCraft AI & Tool Execution ---');
    const toolRes = await executeTool('get_website_information', { topic: 'pricing' });
    assert(toolRes.success === true && toolRes.data.pricing, 'get_website_information should return pricing facts');

    const chatRes = await aiProvider.processChat({
      message: 'What is CareerCraft and how does the resume builder work?',
      conversationHistory: []
    });
    assert(chatRes && chatRes.reply && chatRes.reply.length > 20, 'CareerCraft AI should return informative response');
    console.log(`AI Sample Response snippet: "${chatRes.reply.slice(0, 100)}..."\n`);

    console.log('====================================================');
    console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 Test suite encountered an unexpected error:', err);
    process.exit(1);
  }
}

runTests();
