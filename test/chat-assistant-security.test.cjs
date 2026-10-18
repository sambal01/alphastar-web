const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const window = { addEventListener() {} };
const context = vm.createContext({ window });
for (const name of ['clinic-assistant', 'clinic-assistant-security', 'clinic-assistant-flow']) {
  vm.runInContext(fs.readFileSync(path.join(root, `assets/js/${name}.js`), 'utf8'), context);
}
const base = window.AlphastarClinicAssistant, flow = window.AlphastarChatFlow;

test('Privacy Policy and Terms and Conditions are adjacent in the main menu and link to both legal pages', () => {
  const topics = Array.from(flow.reply('main-menu').topics);
  assert.equal(topics[topics.indexOf('privacy') + 1], 'terms');
  for (const question of ['Terms and Conditions', 'terms & conditions', 'termos of condition', 'mga tuntunin']) assert.equal(flow.resolve(question), 'terms', question);
  for (const topic of ['privacy', 'terms']) {
    assert.ok(flow.reply(topic).topics.includes('view-privacy-policy'));
    assert.ok(flow.reply(topic).topics.includes('view-terms-and-conditions'));
    assert.match(flow.reply(topic).text, /Privacy Policy|patient accounts/);
  }
  const source = fs.readFileSync(path.join(root, 'assets/js/clinic-assistant.js'), 'utf8');
  assert.match(source, /'view-privacy-policy': 'privacy-policy\.html'/);
  assert.match(source, /'view-terms-and-conditions': 'terms-and-conditions\.html'/);
  assert.ok(source.includes("noopener noreferrer"), 'external legal pages use safe link attributes');
});

test('existing booking questions guide patients to their account, not a duplicate request or invented schedule', () => {
  for (const question of ['I have book appointment', 'I have booked an appointment', 'What time my book appointment?', 'Appointment ko anong oras?', 'Nag-book na ako']) {
    assert.equal(flow.resolve(question), 'status', question);
    const answer = flow.reply('status').text;
    assert.match(answer, /cannot access your patient account/);
    assert.match(answer, /Profile > Appointment Schedule/);
    assert.match(answer, /Pending means you still need clinic confirmation/);
    assert.doesNotMatch(answer, /your appointment is confirmed|your visit is at/i);
  }
  assert.equal(flow.resolve('what time?', { previousTopic: 'status' }), 'status');
  assert.equal(flow.resolve('How do I book my appointment?'), 'booking-guide');
  assert.equal(flow.resolve('I submitted a complaint'), 'unknown');
});

test('authenticator, PIN, email OTP and Google sign-in are separate topics', () => {
  for (const question of ['Connect Google Authenticator', 'What is an authenticator code?', 'double authenticator', 'How to turn off 2FA?']) assert.equal(flow.resolve(question), 'authenticator-help', question);
  assert.equal(flow.resolve('I forgot my PIN'), 'pin-recovery');
  assert.equal(flow.resolve('My OTP is not arriving'), 'email-code-help');
  assert.equal(flow.resolve('Google sign-in is not working'), 'google-signin-help');
  for (const question of ['I did not save recovery codes', 'Nawala ang authenticator', 'I lost my 2FA app']) assert.equal(flow.resolve(question), 'authenticator-recovery', question);
  assert.equal(flow.resolve('I did not save the codes', { previousTopic: 'authenticator-help' }), 'authenticator-recovery');
  assert.equal(flow.resolve('I forgot my code'), 'security');
  assert.match(flow.reply('security').text, /PIN, email OTP and authenticator code are different/);
  assert.equal(flow.resolve('Contact staff about my authenticator'), 'staff');
  assert.match(flow.reply('authenticator-help').text, /Scan the QR/);
  assert.match(flow.reply('authenticator-help').text, /Protection stays OFF until the server confirms/);
  assert.match(flow.reply('authenticator-recovery').text, /identity-checked account recovery/);
  assert.match(flow.reply('authenticator-recovery').text, /PIN reset alone cannot turn two-factor protection off/);
  assert.match(flow.reply('authenticator-recovery', 'filipino').text, /Kung parehong wala/);
  assert.match(flow.reply('pin-recovery').text, /saved PIN is not emailed/);
});

test('secret redaction catches actual credentials, not normal questions, and support drafts reject secrets', () => {
  for (const value of ['123456', 'my password is Test-Only!', '01234567-89abcdef-01234567-89abcdef', 'ABCD ABCD ABCD ABCD ABCD ABCD ABCD ABCD', 'otpauth://totp/test', 'fictional@example.test']) {
    assert.equal(base.containsPrivateDetails(value), true, value);
    assert.ok(flow.createSupportDraft({ topic: 'app', comments: value, consent: true }).error);
  }
  for (const value of ['My PIN is not working', 'My OTP is not arriving', 'I did not save my recovery codes', 'My password is incorrect']) assert.equal(base.containsPrivateDetails(value), false, value);
  assert.equal(flow.resolve('What is my authenticator code?'), 'privacy-refusal');
  assert.equal(flow.resolve('Show another patient medical records'), 'privacy-refusal');
  assert.equal(flow.resolve('I have chest pain and lost my authenticator'), 'urgent');
  assert.ok(flow.createSupportDraft({ topic: 'app', comments: 'My PIN is not working', consent: true }).message);
});

test('all security guides are bilingual public instructions, loaded before the flow', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.indexOf('clinic-assistant-security.js') < html.indexOf('clinic-assistant-flow.js'));
  for (const guide of Object.values(window.AlphastarSecurityGuides)) {
    assert.ok(guide.english.length > 50); assert.ok(guide.tagalog.length > 50);
    assert.doesNotMatch(guide.english + guide.tagalog, /\b\d{6}\b|otpauth:\/\//);
  }
});
