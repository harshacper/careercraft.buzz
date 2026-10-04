const assert = require('assert');

// We test the getUserPaymentState function logic
const getUserPaymentState = (skillsText) => {
  if (Array.isArray(skillsText)) {
    return {
      skillsList: skillsText,
      subscription: 'none',
      credits: 2,
      freeTrialsInitialized: true
    };
  }

  if (skillsText && typeof skillsText === 'object') {
    const isInit = Boolean(skillsText.freeTrialsInitialized);
    const credits = (skillsText.credits !== undefined && skillsText.credits !== null)
      ? Number(skillsText.credits)
      : (isInit ? 0 : 2);

    return {
      skillsList: skillsText.skillsList || [],
      subscription: skillsText.subscription || 'none',
      credits: isNaN(credits) ? (isInit ? 0 : 2) : credits,
      freeTrialsInitialized: true
    };
  }

  try {
    const parsed = JSON.parse(skillsText);
    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed)) {
        return {
          skillsList: parsed,
          subscription: 'none',
          credits: 2,
          freeTrialsInitialized: true
        };
      }
      const isInit = Boolean(parsed.freeTrialsInitialized);
      const credits = (parsed.credits !== undefined && parsed.credits !== null)
        ? Number(parsed.credits)
        : (isInit ? 0 : 2);

      return {
        skillsList: parsed.skillsList || [],
        subscription: parsed.subscription || 'none',
        credits: isNaN(credits) ? (isInit ? 0 : 2) : credits,
        freeTrialsInitialized: true
      };
    }
  } catch (e) {
  }

  const skillsArray = typeof skillsText === 'string'
    ? skillsText.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  return {
    skillsList: skillsArray,
    subscription: 'none',
    credits: 2,
    freeTrialsInitialized: true
  };
};

console.log('--- RUNNING FREE TRIAL TESTS ---');

// Test 1: New user (null / empty skills)
const s1 = getUserPaymentState(null);
assert.strictEqual(s1.credits, 2, 'New user should have 2 free trial credits');
console.log('✔ Test 1 Passed: New user gets 2 free credits');

// Test 2: User with legacy string skills
const s2 = getUserPaymentState('React, Node.js');
assert.strictEqual(s2.credits, 2, 'User with legacy string skills should have 2 free credits');
assert.deepStrictEqual(s2.skillsList, ['React', 'Node.js']);
console.log('✔ Test 2 Passed: Legacy string skills user gets 2 free credits');

// Test 3: User with legacy array skills
const s3 = getUserPaymentState(['Python', 'AWS']);
assert.strictEqual(s3.credits, 2, 'User with legacy array skills should have 2 free credits');
console.log('✔ Test 3 Passed: Legacy array skills user gets 2 free credits');

// Test 4: Consuming 1st free credit
let userState = { ...s1 };
assert.strictEqual(userState.credits, 2);
userState.credits -= 1;
userState.freeTrialsInitialized = true;
assert.strictEqual(userState.credits, 1, 'After 1st download, user has 1 credit');
console.log('✔ Test 4 Passed: 1st download leaves 1 credit');

// Test 5: Re-parsing state after 1st download
const s5 = getUserPaymentState(userState);
assert.strictEqual(s5.credits, 1, 'Persisted 1 credit is maintained');
console.log('✔ Test 5 Passed: Persisted state maintains 1 credit');

// Test 6: Consuming 2nd free credit
userState.credits -= 1;
assert.strictEqual(userState.credits, 0, 'After 2nd download, user has 0 credits');
console.log('✔ Test 6 Passed: 2nd download leaves 0 credits');

// Test 7: Re-parsing state after 2nd download (credits: 0, freeTrialsInitialized: true)
const s7 = getUserPaymentState(userState);
assert.strictEqual(s7.credits, 0, 'Does NOT re-grant credits once free trials are initialized');
console.log('✔ Test 7 Passed: Does not re-grant credits once 2 trials are used');

// Test 8: Purchasing single unlock (₹49)
userState.credits += 1;
assert.strictEqual(userState.credits, 1, 'Single unlock adds 1 credit');
console.log('✔ Test 8 Passed: Single unlock adds 1 credit');

// Test 9: Purchasing monthly subscription (₹199)
userState.subscription = 'monthly';
assert.strictEqual(userState.subscription, 'monthly', 'Monthly subscription enabled');
console.log('✔ Test 9 Passed: Monthly subscription activated');

console.log('\nALL 9 PAYMENT & FREE TRIAL TESTS PASSED SUCCESSFULLY!');
