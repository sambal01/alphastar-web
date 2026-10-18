/* Video-inspired guided conversations, not a live-agent or AI integration.
 * Only public clinic/app guidance; never identify patients or invent a queue.
 */
(() => {
  'use strict';
  const base = () => window.AlphastarClinicAssistant;
  const normalize = value => String(value || '').normalize('NFKC').toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\b(?:passowrd|pasword)\b/g, 'password')
    .replace(/\b(?:verfication|verifcation)\b/g, 'verification')
    .replace(/\bpano\b/g, 'paano')
    .replace(/\bsmep\b/g, 'smpe').replace(/\s+/g, ' ').trim();
  const labels = {
    'technical-help': ['App / Technical Help', 'Tulong sa App'],
    'password-recovery': ['Forgot Password', 'Nakalimutang Password'],
    'pin-recovery': ['Forgot PIN', 'Nakalimutang PIN'],
    'email-code-help': ['Email Verification / OTP', 'Code sa Email / OTP'],
    'google-signin-help': ['Google Sign-in', 'Google Sign-in'],
    'create-account-help': ['Create a Patient Account', 'Gumawa ng Patient Account'],
    'change-password-help': ['Change Password', 'Palitan ang Password'],
    'change-pin-help': ['Change PIN', 'Palitan ang PIN'],
    'authenticator-help': ['Authenticator Setup and Sign-in', 'Pag-setup at Sign-in sa Authenticator'],
    'authenticator-recovery': ['Lost Authenticator / Recovery Codes', 'Nawalang Authenticator / Recovery Codes'],
    'smpe-fill-help': ['Fill Up an SMPE Form', 'Sagutan ang SMPE Form'],
    'smpe-view-help': ['View Submitted SMPE Forms', 'Tingnan ang Na-submit na SMPE'],
    'smpe-review-help': ['Pending Review / Form Status', 'Status ng SMPE Form'],
    'laboratory-services': ['Laboratory Tests', 'Laboratory Tests'],
    'imaging-services': ['X-ray / Ultrasound / ECG', 'X-ray / Ultrasound / ECG'],
    'consultation-services': ['Consultations / Check-ups', 'Konsulta / Check-up'],
    'vaccination-services': ['Vaccination Services', 'Bakuna'],
    'examination-services': ['APE / Employment Services', 'APE / Employment Services'],
    'onsite-services': ['Company On-site Services', 'Serbisyo sa Lugar ng Kumpanya'],
    'support-request': ['Prepare a Support Message', 'Gumawa ng Message para sa Staff'],
    'support-declined': ['No, Continue with the Bot', 'Hindi, Ituloy ang Bot'],
    'staff-offer': ['Contact Clinic Staff', 'Kausapin ang Staff'],
    'feedback-helpful': ['Yes, That Helped', 'Oo, Nakatulong'],
    'feedback-unhelpful': ['No, I Still Need Help', 'Hindi, Kailangan Pa ng Tulong'],
    'app-installed': ['Yes, I Have the App', 'Oo, May App Na Ako'],
    'draft-cancelled': ['Cancel Support Draft', 'Huwag Ituloy ang Message'],
  };
  const supportTopics = Object.freeze([
    ['booking', 'Home-service request', 'Pag-book ng home service'], ['app', 'App / sign-in problem', 'Problema sa app / login'],
    ['smpe', 'SMPE form / review status', 'SMPE form / status'], ['services', 'Service availability / fees', 'Serbisyo / presyo'],
    ['results', 'Result-release enquiry', 'Pagkuha ng resulta'], ['other', 'Other clinic question', 'Ibang tanong sa clinic'],
  ].map(([id, label, tagalog]) => Object.freeze({ id, label, tagalog })));
  const technicalTopics = ['password-recovery', 'pin-recovery', 'authenticator-help', 'authenticator-recovery', 'email-code-help', 'google-signin-help', 'mobile-data', 'main-menu'];
  function resolve(input, { previousTopic, prompt, unknownCount = 0 } = {}) {
    const text = normalize(input);
    const short = text.replace(/[!?.,]/g, '').trim();
    const topic = base().resolveTopic(text, previousTopic);
    // Safety always wins, even in the middle of a yes/no or support flow.
    if (['urgent', 'medical-advice', 'privacy-refusal'].includes(topic)) return topic;
    if (['terms', 'privacy', 'authenticator-help', 'authenticator-recovery'].includes(topic)) return topic;
    if (topic === 'staff' && /\b(?:talk|speak|connect|contact|kausap|makakausap)\b/.test(text)) return 'staff';
    if (/^(?:not helpful|that (?:did not|didn't) help|this (?:did not|didn't) help|hindi nakatulong)(?: po)?$/.test(short)) return 'feedback-unhelpful';
    if (/^(?:cancel|stop|cancel (?:the |my )?(?:draft|support (?:draft|request))|kanselahin|i-cancel)(?: po)?$/.test(short)
      && prompt === 'support-draft') return 'draft-cancelled';
    const yes = /^(?:yes|yeah|yep|ok|okay|sure|oo|opo|sige)(?: please| po)?$/.test(short);
    const no = /^(?:no|nope|not yet|hindi|hindi pa|ayoko)(?: thanks| thank you| po)?$/.test(short);
    if (yes || no) {
      if (prompt === 'staff-offer') return yes ? 'support-request' : 'support-declined';
      if (prompt === 'install-check') return yes ? 'app-installed' : 'install-guide';
      return 'clarify-answer';
    }
    if (/^(?:help|human|agent|support|tulong)(?: please| po)?$/.test(short)) return 'staff';
    if (/\b(?:cancel|stop)\b.*\b(?:support draft|support request)\b/.test(text)) return 'draft-cancelled';
    if (/\b(?:technical support|technical help|app issue|app problem|troubleshoot|tulong sa app|problema sa app|ayaw gumana ang app)\b/.test(text)) return 'technical-help';
    if (/\b(?:prepare|write|draft)\b.*\b(?:support|message|clinic|staff)\b/.test(text)) return 'support-request';
    if (/\b(?:download|install|apk)\b/.test(text)) return 'install-guide';
    if (/\bpin\b/.test(text) && /\b(?:forgot|forgotten|lost|reset|recover|nakalimutan|nawala)\b/.test(text)) return 'pin-recovery';
    if (topic === 'account-help' || /\b(?:google|otp|verification|password|pin)\b/.test(text)) {
      if (/\b(?:google|gmail sign[- ]?in)\b/.test(text)) return 'google-signin-help';
      if (/\b(?:otp|verification|verify|code|resend)\b/.test(text)) return 'email-code-help';
      if (/\b(?:forgot|forgotten|forget|reset|recover|nakalimutan)\b/.test(text)) {
        if (/\bpin\b/.test(text)) return 'pin-recovery';
        if (/\bpassword\b/.test(text)) return 'password-recovery';
      }
      if (/\b(?:create|register|sign[- ]?up|registration|gumawa)\b/.test(text)) return 'create-account-help';
    }
    if (topic === 'security') {
      if (/\bpassword\b/.test(text)) return 'change-password-help';
      if (/\bpin\b/.test(text)) return 'change-pin-help';
    }
    if (['records-guide', 'services'].includes(topic) && /\b(?:annual physical|ape|employment)\b/.test(text) && !/\bsmpe\b/.test(text)) return 'examination-services';
    if (topic === 'records-guide') {
      if (/\b(?:pending|review|approved|rejected|status)\b/.test(text)) return 'smpe-review-help';
      if (/\b(?:fill|complete|submit|sagutan)\b/.test(text)) return 'smpe-fill-help';
      if (/\b(?:view|open|find|see|tingnan|buksan)\b/.test(text)) return 'smpe-view-help';
    }
    if (topic === 'services') {
      if (/\b(?:cbc|urinalysis|laboratory tests?|blood tests?|drug testing)\b/.test(text)) return 'laboratory-services';
      if (/\b(?:x-ray|xray|ultrasound|ecg|imaging)\b/.test(text)) return 'imaging-services';
      if (/\b(?:vaccin(?:e|es|ation)|bakuna|anti-rabies|tetanus)\b/.test(text)) return 'vaccination-services';
      if (/\b(?:consultation|check-ups?|doctor)\b/.test(text)) return 'consultation-services';
      if (/\b(?:ape|employment|annual physical)\b/.test(text)) return 'examination-services';
      if (/\b(?:company|on-site|onsite)\b/.test(text)) return 'onsite-services';
    }
    if (/^(?:how|how do i do (?:that|it)|what next|what's next|next|paano|paano naman|paano gawin (?:yan|ito)|ano ang susunod)(?: po)?$/.test(short)) {
      if (['home-service', 'booking-guide'].includes(previousTopic)) return 'booking-guide';
      if (['security', 'account-help', 'technical-help'].includes(previousTopic)) return 'technical-help';
      if (previousTopic?.startsWith('smpe-')) return previousTopic;
      if (previousTopic === 'records-guide') return 'smpe-fill-help';
      if (['password-recovery', 'pin-recovery', 'google-signin-help', 'email-code-help', 'create-account-help', 'change-pin-help', 'change-password-help', 'authenticator-help', 'authenticator-recovery', 'status'].includes(previousTopic)) return previousTopic;
    }
    if (previousTopic === 'hours' && /^(?:where|what address|address|saan|nasaan)(?: po)?$/.test(short)) return 'hours';
    if (previousTopic === 'smpe-review-help' && /^(?:when|how long|any update|kailan|gaano katagal)(?: po)?$/.test(short)) return 'smpe-review-help';
    return topic === 'unknown' && unknownCount >= 1 ? 'staff-offer' : topic;
  }
  function reply(topic, language = 'english') {
    const fil = language === 'filipino';
    const pair = (en, tagalog) => fil ? tagalog : en;
    const result = base().replyFor(topic, language);
    const details = {
      'technical-help': pair('Which part of the app needs help? Choose below and I’ll walk you through it.', 'Saan ka nahihirapan sa app? Pumili sa ibaba at tutulungan kita sa mga hakbang.'),
      'password-recovery': pair('Forgot your Alphastar password?\n1. On the app’s email login screen, tap Forgot password.\n2. Follow the email-code and new-password steps.\n3. Sign in with your new password.\n\nUsing Google? Reset your password through Google instead.', 'Nakalimutan ang password?\n1. Sa email login ng app, pindutin ang Forgot password.\n2. Sundin ang code sa email at paggawa ng bagong password.\n3. Mag-login gamit ang bagong password.\n\nKung Google ang gamit mo, sa Google ito i-reset.'),
      'pin-recovery': pair('On the app’s PIN screen, tap Forgot PIN. Follow the email-code steps and set a new 6-digit PIN. Already signed in? Use Profile > Security Settings > Change PIN. Keep your PIN and code private.', 'Sa PIN screen ng app, pindutin ang Forgot PIN. Sundin ang code sa email at gumawa ng bagong 6-digit PIN. Naka-login ka na? Gamitin ang Profile > Security Settings > Change PIN. Huwag ibigay ang PIN o code dito.'),
      'email-code-help': pair('No email code yet?\n1. Check your email address and Spam / Junk folder.\n2. Wait for the timer, then tap Resend in the app.\n3. Use the newest code.\n\nStill missing? Ask staff. Do not share the code here.', 'Wala pang code sa email?\n1. Tingnan kung tama ang email at silipin ang Spam / Junk.\n2. Hintayin ang timer, tapos pindutin ang Resend sa app.\n3. Gamitin ang pinakabagong code.\n\nWala pa rin? Magtanong sa staff. Huwag ibigay ang code dito.'),
      'google-signin-help': pair('Reopen Alphastar and choose the same Google account you used before. Check your internet and finish any profile or PIN steps shown. For a Google password problem, use Google’s recovery page.', 'Buksan ulit ang Alphastar at piliin ang parehong Google account na ginamit mo noon. Tingnan ang internet at tapusin ang profile o PIN kung hinihingi. Kung Google password ang problema, sa Google ito i-recover.'),
      'create-account-help': pair('Open Alphastar and choose Create account or Google. Follow the email-code steps, fill in your details, and set a 6-digit PIN. Already have an account? Sign in to that one instead of making another.', 'Buksan ang Alphastar at piliin ang Create account o Google. Sundin ang code sa email, sagutan ang details, at gumawa ng 6-digit PIN. May account ka na? Doon mag-login para hindi ka magkaroon ng dalawang account.'),
      'change-password-help': pair('In Alphastar Mobile, open Profile > Security Settings > Change password. Enter your current and new password, confirm it, then follow the email-code steps. For Google accounts, change the password through Google.', 'Sa Alphastar Mobile, buksan ang Profile > Security Settings > Change password. Ilagay ang dating password at bagong password, ulitin ito, at sundin ang code sa email. Kung Google account ang gamit mo, sa Google magpalit ng password.'),
      'change-pin-help': pair('In Alphastar Mobile, open Profile > Security Settings > Change PIN. Enter your current PIN, set a new 6-digit PIN, and confirm it. Wait for the success message. Forgot your PIN? Use Forgot PIN on the PIN login screen.', 'Sa Alphastar Mobile, buksan ang Profile > Security Settings > Change PIN. Ilagay ang dating PIN, gumawa ng bagong 6-digit PIN, at ulitin ito. Hintayin ang success message. Nakalimutan ang PIN? Gamitin ang Forgot PIN sa PIN login.'),
      'smpe-fill-help': pair('Open Medical Records > SMPE in the app. Fill in your details, tap Next, check your answers, and submit. A draft is not submitted yet. Check Profile > Medical History afterward.', 'Buksan ang Medical Records > SMPE sa app. Sagutan ang details, pindutin ang Next, tingnan ang mga sagot, at i-submit. Hindi pa na-submit ang draft. Pagkatapos, tingnan ang Profile > Medical History.'),
      'smpe-view-help': pair('In Alphastar Mobile, open Profile > Medical History and tap View SMPE Record. Use mobile data or Wi-Fi. No form there? Check that you used the same account and submitted it, not just saved a draft.', 'Sa Alphastar Mobile, buksan ang Profile > Medical History at pindutin ang View SMPE Record. Puwede ang mobile data o Wi-Fi. Walang form? Tingnan kung parehong account ang gamit mo at na-submit ang form, hindi draft lang.'),
      'smpe-review-help': pair('Pending Review means staff have not finished checking your SMPE form. In Alphastar Mobile, check Medical History and notifications. Only clinic staff can confirm progress. This status does not mean your lab result is ready.', 'Ang Pending Review ay hindi pa tapos suriin ng staff ang SMPE form mo. Sa Alphastar Mobile, tingnan ang Medical History at mga abiso. Staff ang makakapagsabi ng update. Hindi ibig sabihin nito na ready na ang lab result.'),
      'laboratory-services': pair('We offer lab tests and drug testing. Ask staff about your test’s price and preparation. For home collection, check the app and confirm whether your test and area are covered.', 'May lab tests at drug testing. Itanong sa staff ang presyo at paghahanda para sa test mo. Para sa pagkuha ng sample sa bahay, tingnan ang app at itanong kung puwede ang test sa lugar mo.'),
      'imaging-services': pair('We offer digital X-ray, ultrasound, and ECG. Ask staff about the schedule, price, and requirements before visiting. These are not automatically available at home.', 'May digital X-ray, ultrasound, at ECG. Itanong sa staff ang schedule, presyo, at kailangan bago pumunta. Hindi ibig sabihin na puwede agad ang mga ito sa bahay.'),
      'consultation-services': pair('We offer consultations and check-ups. Ask staff about the doctor’s schedule before visiting. Clinic consultations are not booked in Alphastar Mobile.', 'May konsulta at check-up. Itanong muna sa staff ang schedule ng doktor bago pumunta. Hindi sa Alphastar Mobile bina-book ang konsulta sa clinic.'),
      'vaccination-services': pair('We offer vaccinations. Ask a doctor which vaccine is right for you, and ask staff about stock, schedule, and price. This chat cannot recommend a vaccine or dose.', 'May bakuna sa Alphastar. Sa doktor itanong kung anong bakuna ang para sa iyo. Sa staff naman itanong kung may stock, ang schedule, at presyo. Hindi nagrerekomenda ng bakuna o dose ang chat.'),
      'examination-services': pair('We offer APE and employment-related services. Ask staff what tests and documents are included and how much the package costs. An SMPE form is not automatically an APE package.', 'May APE at serbisyo para sa trabaho. Itanong sa staff ang kasamang tests, dokumento, at presyo ng package. Hindi awtomatikong APE package ang SMPE form.'),
      'onsite-services': pair('For company on-site services, contact staff about the location, schedule, tests, and price quote. Company bookings are not made through this chat.', 'Para sa serbisyo sa lugar ng kumpanya, kausapin ang staff tungkol sa lugar, schedule, tests, at presyo. Hindi dito sa chat ginagawa ang company booking.'),
      'feedback-helpful': pair('Glad that helped! Your feedback stays in this chat only. What else do you need?', 'Mabuti at nakatulong! Dito lang sa chat ang feedback mo. Ano pa ang kailangan mo?'),
      'feedback-unhelpful': pair('Sorry that did not help. Want help writing a message to staff?', 'Pasensya kung hindi nakatulong. Gusto mo bang gumawa ng message para sa staff?'),
      'staff-offer': pair('I’m not sure of the answer. Want help writing a message to staff?', 'Hindi ako sigurado sa sagot. Gusto mo bang gumawa ng message para sa staff?'),
      'support-request': pair('Write your question below. I’ll help prepare a message for staff. You will review it and send it through Messenger or email yourself.', 'Isulat ang tanong mo sa ibaba. Tutulungan kitang gumawa ng message para sa staff. Babasahin mo muna ito, tapos ikaw ang magpapadala sa Messenger o email.'),
      'support-prepared': pair('Your message is ready. It has not been sent. Review it, then send the email draft or copy it into Messenger.', 'Handa na ang message mo. Hindi pa ito naipapadala. Basahin muna, tapos i-send sa email o kopyahin sa Messenger.'),
      'support-declined': pair('No problem! Choose another topic and we’ll continue.', 'Sige, walang problema! Pumili ng ibang tanong at ituloy natin.'),
      'draft-cancelled': pair('Draft cancelled. No message was sent. What else can I help with?', 'Hindi na itinuloy ang draft. Walang message na ipinadala. Ano pa ang maitutulong ko?'),
      'app-installed': pair('Great! Open Book Appointment in the app. Choose a home service, date, and time, add notes, then review and submit. Wait for staff to confirm. No booking was made in this chat.', 'Sige! Buksan ang Book Appointment sa app. Piliin ang home service, petsa, at oras, maglagay ng notes, tapos tingnan ang sagot at i-submit. Hintayin ang kumpirmasyon ng staff. Walang booking na ginawa sa chat.'),
      'clarify-answer': pair('What is your yes or no about? Choose a topic below so I can help.', 'Tungkol saan ang oo o hindi mo? Pumili sa ibaba para matulungan kita.'),
    };
    if (details[topic]) result.text = details[topic];
    const security = window.AlphastarSecurityGuides?.[topic === 'pin-recovery' || topic === 'change-pin-help' ? 'pin-help' : topic];
    if (security) result.text = fil ? security.tagalog : security.english;
    if (topic === 'terms') result.text = pair('The Terms and Conditions explain responsible use of Alphastar, account security, home-service requests, SMPE forms and the limits of automated chat. A request is not a confirmed visit. Read them together with Privacy Policy using the links below. The legal pages open separately so you can keep this conversation.', 'Ipinaliliwanag ng Terms and Conditions ang tamang paggamit ng Alphastar, account security, home-service requests, SMPE forms at limitasyon ng chatbot. Hindi pa confirmed na visit ang isang request. Basahin ito kasama ng Privacy Policy sa mga link sa ibaba. Bubukas nang hiwalay ang legal page para manatili ang usapan.');
    let topics = result.topics;
    let prompt;
    if (topic === 'app') topics = ['booking-guide', 'records-guide', 'technical-help', 'profile-help', 'security', 'install-guide', 'main-menu'];
    if (['account-help', 'technical-help'].includes(topic)) topics = technicalTopics;
    if (topic === 'security') topics = ['pin-recovery', 'change-password-help', 'authenticator-help', 'authenticator-recovery', 'main-menu'];
    if (['authenticator-help', 'authenticator-recovery'].includes(topic)) topics = ['authenticator-help', 'authenticator-recovery', 'security', 'staff', 'main-menu'];
    if (topic === 'services') topics = ['laboratory-services', 'imaging-services', 'consultation-services', 'vaccination-services', 'examination-services', 'onsite-services', 'main-menu'];
    if (topic === 'records-guide') topics = ['smpe-fill-help', 'smpe-view-help', 'smpe-review-help', 'drafts', 'main-menu'];
    if (['password-recovery', 'pin-recovery', 'email-code-help', 'google-signin-help', 'create-account-help'].includes(topic)) topics = ['technical-help', 'staff', 'main-menu'];
    if (['change-password-help', 'change-pin-help'].includes(topic)) topics = ['security', 'staff', 'main-menu'];
    if (topic.startsWith('smpe-')) topics = ['records-guide', 'drafts', 'mobile-data', 'staff', 'main-menu'];
    if (topic.endsWith('-services')) topics = ['services', 'home-service', 'prices', 'staff', 'main-menu'];
    if (topic === 'install-guide') topics = ['view-download', 'create-account-help', 'staff', 'main-menu'];
    if (topic === 'booking-guide') {
      result.text += pair('\n\nHave you already installed Alphastar?', '\n\nNaka-install na ba ang Alphastar?');
      topics = ['app-installed', 'install-guide', 'profile-help', 'main-menu']; prompt = 'install-check';
    }
    if (['feedback-unhelpful', 'staff-offer'].includes(topic)) {
      topics = ['support-request', 'support-declined']; prompt = 'staff-offer';
    }
    if (topic === 'staff') topics = ['messenger', 'email', 'support-request', 'main-menu'];
    if (['support-request', 'support-prepared'].includes(topic)) { topics = []; prompt = 'support-draft'; }
    if (['feedback-helpful', 'support-declined', 'draft-cancelled'].includes(topic)) topics = base().replyFor('main-menu', language).topics;
    if (topic === 'app-installed') topics = ['profile-help', 'requirements', 'staff', 'main-menu'];
    if (['unknown', 'clarify-answer'].includes(topic)) topics = ['technical-help', 'about', 'staff', 'main-menu'];
    // Every mobile-feature guide offers a way to reach the official download,
    // without suggesting that the website can operate a patient's account.
    const mobileGuides = ['app', 'booking-guide', 'records-guide', 'account-help', 'technical-help', 'profile-help', 'security', 'drafts', 'mobile-data', 'requirements', 'app-installed', 'password-recovery', 'pin-recovery', 'email-code-help', 'google-signin-help', 'create-account-help', 'change-password-help', 'change-pin-help', 'authenticator-help', 'authenticator-recovery'];
    if ((mobileGuides.includes(topic) || topic.startsWith('smpe-')) && !topics.includes('view-download') && !topics.includes('install-guide')) topics = [...topics.filter(id => id !== 'main-menu'), 'view-download', 'main-menu'];
    const noFeedback = ['greeting', 'thanks', 'main-menu', 'identity', 'about', 'app', 'services', 'account-help', 'technical-help', 'security', 'records-guide', 'staff', 'support-request', 'support-declined', 'draft-cancelled', 'staff-offer', 'feedback-helpful', 'feedback-unhelpful', 'unknown', 'clarify-answer', 'urgent', 'medical-advice', 'privacy-refusal'];
    return { ...result, topics: topics.slice(), prompt, feedback: !prompt && !noFeedback.includes(topic), supportForm: topic === 'support-request' };
  }
  function createSupportDraft({ topic, comments, consent, language = 'english' }) {
    const pair = (en, fil) => language === 'filipino' ? fil : en;
    const category = supportTopics.find(item => item.id === topic);
    const note = String(comments || '').trim();
    if (!category) return { error: pair('Choose a support topic.', 'Piliin muna kung tungkol saan ang tanong.') };
    if (!note) return { error: pair('Please describe the general issue.', 'Isulat muna ang tanong o problema mo.') };
    if (note.length > 600) return { error: pair('Keep your message within 600 characters.', 'Hanggang 600 characters lang ang message.') };
    if (base().containsPrivateDetails(note) || /\b(?:api key|private key|access token|patient id|record id|medical result|lab result|my diagnosis)\s*(?:is|ay|:|=)/i.test(note)) return { error: pair('Remove personal information, PINs, passwords, codes, and medical results. Describe only the general issue.', 'Alisin ang personal na detalye, PIN, password, code, at medical result. Ang tanong o problema lang ang ilagay.') };
    if (['urgent', 'medical-advice', 'privacy-refusal'].includes(base().resolveTopic(note))) return { error: pair('Ask a doctor or emergency service for medical concerns. This message form is for clinic and app questions.', 'Sa doktor o emergency services lumapit kung medikal o emergency ang problema. Para sa clinic at app questions ang form na ito.') };
    if (!consent) return { error: pair('Confirm that you reviewed the message before preparing it.', 'I-check muna na nabasa mo ang message at walang private details.') };
    const categoryLabel = pair(category.label, category.tagalog);
    const message = pair(`Hello, Alphastar staff.\n\nTopic: ${categoryLabel}\n${note}\n\nPlease let me know the next steps. Thank you.`, `Hello, Alphastar staff.\n\nTungkol sa: ${categoryLabel}\n${note}\n\nAno po ang susunod na gagawin? Salamat.`);
    return { message, emailHref: `mailto:info@alphastarlabclinic.com?subject=${encodeURIComponent(`Alphastar support: ${categoryLabel}`)}&body=${encodeURIComponent(message)}`, messengerHref: 'https://m.me/alphastarlaboratory' };
  }
  window.AlphastarChatFlow = Object.freeze({ resolve, reply, supportTopics, createSupportDraft, labelFor: (id, language) => labels[id]?.[language === 'filipino' ? 1 : 0] });
})();
