/* Guided website adaptation of alphastar-mobile's Chat With Us.
 * No AI provider, patient lookup, appointment mutation, transcript upload, or
 * persistent chat storage. Plain-language replies use the clinic's public info.
 */
(() => {
  'use strict';

  const labels = {
    about: ['About Alphastar', 'Tungkol sa Alphastar'],
    app: ['About the App', 'Tungkol sa App'],
    'install-guide': ['Download Our App', 'I-download ang App'],
    staff: ['Talk to Clinic Staff', 'Kausapin ang Clinic Staff'],
    hours: ['Clinic Schedule', 'Oras at Lokasyon'],
    services: ['All Services Offered', 'Mga Serbisyo'],
    parking: ['Vehicle Parking', 'Paradahan'],
    'home-service': ['Home Service', 'Home Service'],
    license: ['Is Alphastar Licensed?', 'Lisensya ng Alphastar'],
    'booking-guide': ['How to Book', 'Paano Mag-book'],
    'records-guide': ['About Medical Records', 'Tungkol sa Medical Records'],
    'account-help': ['Login / PIN Help', 'Tulong sa Login / PIN'],
    'profile-help': ['Profile and Address', 'Profile at Address'],
    security: ['Security Settings', 'Security Settings'],
    privacy: ['Privacy Policy', 'Privacy Policy'],
    terms: ['Terms and Conditions', 'Mga Tuntunin at Kundisyon'],
    'view-privacy-policy': ['View Privacy Policy', 'Basahin ang Privacy Policy'],
    'view-terms-and-conditions': ['View Terms and Conditions', 'Basahin ang Terms and Conditions'],
    drafts: ['Saved Forms and Drafts', 'Mga Na-save na Form'],
    'mobile-data': ['Mobile Data / Wi-Fi', 'Mobile Data / Wi-Fi'],
    prices: ['Service Prices', 'Presyo ng Serbisyo'],
    results: ['Test Results', 'Mga Resulta'],
    requirements: ['Home-service Requirements', 'Kailangan sa Home Service'],
    reschedule: ['Reschedule an Appointment', 'Palitan ang Petsa o Oras'],
    cancel: ['Cancel an Appointment', 'Kanselahin ang Appointment'],
    'main-menu': ['Back to Main Menu', 'Balik sa Menu'],
    'view-faq': ['View FAQ', 'Tingnan ang FAQ'],
    'view-download': ['Go to App Download', 'Pumunta sa Download ng App'],
    'view-contact': ['Contact and Map', 'Contact at Mapa'],
    messenger: ['Open Messenger', 'Buksan ang Messenger'],
    email: ['Email the Clinic', 'Email ang Clinic'],
  };
  const mainTopics = ['about', 'app', 'install-guide', 'privacy', 'terms', 'security', 'staff'];
  const aboutTopics = ['hours', 'services', 'parking', 'home-service', 'license', 'main-menu'];
  const appTopics = ['booking-guide', 'records-guide', 'account-help', 'profile-help', 'security', 'main-menu'];
  const normalize = input => String(input).toLowerCase().normalize('NFKC')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/\b(?:appoinment|apointment|appoitment|appointement|appoitnment)s?\b/g, 'appointment')
    .replace(/\b(?:reschdule|reshedule|resched)\b/g, 'reschedule')
    .replace(/\bpano\b/g, 'paano').replace(/\bsan\b/g, 'saan').replace(/\s+/g, ' ').trim();

  // Specific privacy and account requests precede broad clinic words, as in
  // the mobile matcher. This public page can explain steps, not read accounts.
  function resolveTopic(input, previousTopic) {
    const text = normalize(input);
    const short = text.replace(/[?!.,]/g, '').trim();
    if (!text) return 'unknown';
    if (/\b(emergency|urgent|stroke|seizure|unconscious|severe bleeding|chest pain|can't breathe|cannot breathe|hirap huminga|(?:di|hindi) makahinga|nahimatay|nawalan ng malay|matinding pagdurugo|sakit sa dibdib|matinding sakit)\b/.test(text)) return 'urgent';
    if (/\b(diagnos(?:e|is|es|ing|ed)|prescriptions?|medications?|medicines?|gamot|reseta|symptoms?|sakit|lagnat|ubo|pain|masakit|treatments?|doses?|dosage|inom)\b/.test(text)) return 'medical-advice';
    const secret = /\b(passwords?|pin|passcode|otp|verification code|authenticator code|recovery codes?|setup key|api key|private key|access token)\b/;
    const reveal = /\b(show|tell|give|reveal|display|send|retrieve|what is|what's|ano ang|ipakita|pakita|ibigay)\b/;
    const instructions = /\b(reset|forgot|forgotten|change|create|recover|expired|invalid|incorrect|receive|resend|verify|not working|hindi|wala|nakalimutan|palitan)\b/;
    if ((/\b(other|another) (?:patient|person|user)|someone else's|ibang (?:pasyente|patient|tao)|(?:private|personal|confidential) (?:staff|employee)/.test(text) && /\b(record|records|results?|password|otp|pin|profile|medical history|address|email|phone|information|details)\b/.test(text)) || (secret.test(text) && reveal.test(text) && !instructions.test(text) && !/^(?:what is|what's|ano ang) (?:an? |the purpose of (?:an? )?)(?:authenticator code|pin|otp|recovery code|verification code)\b/.test(text))) return 'privacy-refusal';
    if (/\b(terms?(?: and| &)? (?:conditions?|service)|terms of (?:conditions?|service)|termos|kundisyon|mga tuntunin)\b/.test(text)) return 'terms';
    if (/\b(privacy|data protection|data privacy|confidentiality|who can see|sino.*makakakita)\b|\b(can|could|will).*\b(staff|clinic).*\b(see|access|view).*\bmy\b/.test(text)) return 'privacy';
    if (/\b(are you (?:an? )?(?:ai|bot|human|robot)|who are you|what are you|what can you do|sino ka|ano ka|bot ka|ai ka)\b/.test(text)) return 'identity';
    if (previousTopic === 'hours' && /^(?:(?:and|on|what about|how about|sa|kapag) )?(?:sunday|saturday|weekends?|holidays?|linggo|sabado)(?: po)?$/.test(short)) return 'hours';
    if (/^(?:how long|how many (?:hours|days)|gaano katagal|ilang (?:oras|araw))(?: po)?$/.test(short)) return previousTopic === 'results' ? 'results' : 'unknown';
    if (/\b(talk|speak|connect|contact|chat|need|want)\b.*\b(staff|agent|human|support|clinic|someone)\b|\b(staff|agent|human|receptionist)\b.*\b(available|online)\b|\b(kausap|makakausap)\b|\b(?:phone number|contact number)\b.*\bclinic\b|\bclinic\b.*\b(?:phone number|contact number)\b/.test(text) || /^(staff|agent|support|human|agent support)(?: please| po)?$/.test(short)) return 'staff';
    if (/\b(authenticator|authenticcator|authentecator|authentication app|2fa|two[- ](?:factor|step)|double authenticator|recovery codes?|backup codes?)\b/.test(text)) return /\b(lost|forgot|forgotten|missing|recover|recovery|backup|not saved|didn't save|did not save|haven't saved|cannot access|can't access|new phone|broken phone|nawala|nakalimutan|hindi na[- ]?save|di na[- ]?save|walang code)\b/.test(text) ? 'authenticator-recovery' : 'authenticator-help';
    if (['authenticator-help', 'authenticator-recovery'].includes(previousTopic) && /\bcodes?\b/.test(text) && /\b(lost|forgot|not saved|didn't save|did not save|nawala|hindi na[- ]?save)\b/.test(text)) return 'authenticator-recovery';
    if (/\bcodes?\b/.test(text) && /\b(lost|forgot|forgotten|not saved|didn't save|did not save|nawala|nakalimutan|hindi na[- ]?save)\b/.test(text) && !/\b(?:email|otp|verification|password|pin)\b/.test(text)) return 'security';
    if (/\bpin\b/.test(text) && /\b(forgot|forgotten|lost|recover|reset|nakalimutan|nawala)\b/.test(text)) return 'account-help';
    if (/^(?:what time|when|what date|what day|anong oras|anong petsa|kailan)(?: po)?$/.test(short) && previousTopic === 'status') return 'status';
    if (/\b(mobile data|wi-?fi|internet|connection|offline|not loading|won't load|ayaw mag[- ]?load)\b/.test(text)) return 'mobile-data';
    if (/\b(drafts?|minimize|switch apps|unsaved|uninstall|reinstall|nawala|disappeared|stay saved|save my form)\b/.test(text)) return 'drafts';
    if (/\b(security|seguridad|protect (?:my )?account|change (?:my )?(?:pin|password)|(?:palitan|baguhin).*(?:pin|password))\b/.test(text)) return 'security';
    if (secret.test(text) || /\b(log[- ]?in|sign[- ]?in|sign[- ]?up|log[- ]?out|register|registration|account|verification email)\b|\b(change|update|palitan)\b.*\bemail\b/.test(text)) return 'account-help';
    if (/\b(where|nasaan|saan|location|directions)\b.*\b(clinic|kasiglahan|alphastar)\b|\b(clinic|kasiglahan) address\b/.test(text)) return 'hours';
    if (/\b(profile|home address|house (?:number|no)|street|village|subdivision|barangay|province|zip|postal|my address|address ko)\b|\b(change|update|edit|palitan|baguhin)\b.*\b(name|pangalan|address|phone|contact number)\b/.test(text)) return 'profile-help';
    if (/\b(reschedule|move (?:my |the )?appointment|change (?:my |the )?(?:appointment|booking|schedule)|palitan ng (?:petsa|oras))\b|\b(change|move|baguhin|ilipat)\b.*\b(date|time|petsa|oras)\b.*\b(appointment|schedule|booking)\b/.test(text)) return 'reschedule';
    if (/\b(cancel|cancelled|canceled|cancellation|kanselahin|i-cancel)\b/.test(text)) return 'cancel';
    if (/\b(philhealth|hmo|payment|pay|gcash|cash)\b/.test(text)) return 'payment';
    if (/\b(prices?|cost|fees?|magkano|presyo|bayad|how much)\b/.test(text)) return 'prices';
    if (/\b(results?|resulta|lab report|laboratory report|turnaround)\b/.test(text)) return 'results';
    if (/\b(fasting|fast|eat|food|drink|preparation|prepare|paghahanda|kumain|uminom)\b/.test(text)) return 'preparation';
    if (/\b(requirements?|bring|dadalhin|dalhin)\b/.test(text)) return 'requirements';
    if (/\b(records?|smpe|medical history|medical forms?|physical examination|form ?2)\b/.test(text)) return 'records-guide';
    if (/\b(queue|pila|my turn|numero sa pila)\b/.test(text)) return 'queue-guide';
    if (/\b(my|aking)\b.{0,32}\b(?:appointment|schedule|booking)\b|\b(?:appointment|schedule|booking)\b.{0,24}\bko\b|\b(appointment|booking) (?:status|confirmed|pending)\b|\b(?:confirmed|pending) (?:appointment|booking)\b|\bi (?:have |have already |already )?booked\b|\bi (?:have |have already |already )?(?:submitted|requested)\b.{0,32}\b(?:appointment|booking)\b|\bi have (?:an? )?(?:book(?:ed)? )?(?:appointment|booking)\b|\b(?:nakapag[- ]?book|nag[- ]?book (?:na )?ako|may (?:appointment|booking) (?:na )?ako)\b|^(?:any update|update|status|what about now|may update)(?: po| na)?$/.test(short)) return /\b(how (?:to|do i|can i)|paano|saan)\b.*\b(book|booking|mag[- ]?book)\b/.test(text) ? 'booking-guide' : 'status';
    if (/\b(how|paano|guide|steps|saan)\b.*\b(book|booking|appointment|mag[- ]?book)\b/.test(text)) return 'booking-guide';
    if (/\b(walk[- ]?ins?)\b/.test(text)) return 'walk-ins';
    if (/\b(home[- ]service|home visit|house call|at home|walk[- ]?in|in[- ]?person|sa bahay)\b/.test(text)) return 'home-service';
    if (/\b(licensed?|licence|legit|doh|fda|lisensya|lisensyado)\b/.test(text)) return 'license';
    if (/\b(parking|park|motorcycle|motorbike|motor|kotse|paradahan)\b/.test(text)) return 'parking';
    if (/\b(hours?|opening|closing|open|close|location|directions|oras|saan|nasaan|clinic schedule)\b/.test(text)) return 'hours';
    if (/\b(services?|serbisyo|laboratory|tests?|drug testing|ecg|consultation|packages?|cbc|urinalysis|x-ray|ultrasound|vaccin(?:e|es|ation)|bakuna|check-up|anti-rabies|tetanus)\b/.test(text) && !/\b(book|booking|appointment|magpa|schedule)\b/.test(text)) return 'services';
    if (/\b(app|application|features|alphastar mobile|download|apk|install)\b/.test(text)) return 'app';
    if (/\b(book|booking|appointment|reserve|mag[- ]?book|magpa|schedule)\b/.test(text)) return 'booking-guide';
    if (/\b(alpha[ -]?star|about (?:the )?clinic|tungkol sa clinic)\b/.test(text)) return 'about';
    if (/^(hi|hello|hey|good morning|good afternoon|good evening|kumusta|kamusta|magandang (?:umaga|hapon|gabi))(?: po)?[!?. ]*$/.test(text)) return 'greeting';
    if (/^(thank you|thanks|salamat|maraming salamat)(?: po)?[!?. ]*$/.test(text)) return 'thanks';
    if (/\b(faq|questions?|tanong|help|menu|topics)\b/.test(text)) return 'main-menu';
    return 'unknown';
  }

  const languageFor = input => /\b(paano|pano|ano|saan|san|nasaan|po|ba|ko|aking|kailangan|magkano|salamat|kumusta|kamusta|hindi|di|wala|nawala|pwede|puwede|oras|bukas|gabi|pasyente|dalhin|palitan|nakalimutan|oo|opo|sige|ayaw|sagutan)\b/i.test(input) ? 'filipino' : 'english';
  const languageCommand = input => {
    const text = normalize(input).replace(/[!?.]/g, '').trim();
    if (/^(?:(?:translate|switch|change)(?: (?:this|it))? (?:to|into) |(?:in|sa) )?(?:tagalog|filipino)(?: please| po)?$/.test(text)) return 'filipino';
    if (/^(?:(?:translate|switch|change)(?: (?:this|it))? (?:to|into) |in )?english(?: please| po)?$/.test(text)) return 'english';
  };
  function replyFor(topic, language = 'english') {
    const filipino = language === 'filipino';
    const pair = (en, fil) => filipino ? fil : en;
    let topics = ['staff', 'main-menu'];
    const answers = {
      about: pair('Alphastar is a laboratory and clinic in Kasiglahan, San Jose, Rodriguez, Rizal. We offer lab tests and other clinic services. What would you like to know?', 'Ang Alphastar ay laboratory at clinic sa Kasiglahan, San Jose, Rodriguez, Rizal. May lab tests at iba pang serbisyo. Ano ang gusto mong malaman?'),
      app: pair('These features are in the Alphastar mobile app:\n• Request a home service.\n• Save your profile and address.\n• Fill out SMPE forms and view submitted forms in Medical History.\n• Manage your PIN and password in Security Settings.', 'Sa Alphastar mobile app mo magagamit ang mga ito:\n• Mag-request ng home service.\n• I-save ang profile at address.\n• Sagutan ang SMPE at tingnan ang na-submit na form sa Medical History.\n• Palitan ang PIN at password sa Security Settings.'),
      'install-guide': pair('Download the Alphastar Android app:\n1. Open this website in Google Chrome on your Android phone.\n2. Tap Go to App Download below to reach the download section on Home, then tap the download button when the official APK link is available.\n3. When the APK finishes downloading, open it and follow your phone’s installation prompts.\n4. Open Alphastar, sign in or create a patient account, and complete your profile.\n\nYou can then request home services and fill out SMPE forms in the mobile app. If the APK link is unavailable, ask clinic staff for the official link. The app does not book clinic visits.', 'I-download ang Alphastar Android app:\n1. Buksan ang website na ito sa Google Chrome ng Android phone mo.\n2. Pindutin ang Pumunta sa Download ng App sa ibaba para makita ang download sa Home. Pindutin ang download button kapag available na ang official APK link.\n3. Kapag tapos na ang download, buksan ang APK at sundin ang installation steps ng phone mo.\n4. Buksan ang Alphastar, mag-login o gumawa ng patient account, at kumpletuhin ang profile.\n\nSa mobile app, puwede kang mag-request ng home service at sumagot ng SMPE. Kung wala pang APK link, hingin ang official link sa staff. Hindi para sa pag-book ng clinic visit ang app.'),
      hours: pair('Regular hours: Monday through Sunday, 7:00 AM to 4:00 PM. Ask staff about holiday and doctor schedules.\n\nFind us at Lot 3-A, Block 9, Phase 1B, Kasiglahan Village, San Jose, Rodriguez, Rizal, near McDonald’s Kasiglahan.', 'Regular na bukas: Lunes–Linggo, 7:00 AM–4:00 PM. Magtanong muna sa staff para sa holidays at schedule ng doktor.\n\nNasa Lot 3-A, Block 9, Phase 1B, Kasiglahan Village, San Jose, Rodriguez, Rizal, malapit sa McDonald’s Kasiglahan.'),
      services: pair('We offer lab tests, drug testing, X-ray, ultrasound, ECG, check-ups, vaccinations, and company services. Choose a service below. Ask staff about the schedule and price.', 'May lab tests, drug testing, X-ray, ultrasound, ECG, check-up, bakuna, at serbisyo para sa mga kumpanya. Pumili sa ibaba. Magtanong sa staff tungkol sa schedule at presyo.'),
      'home-service': pair('Yes, you can request a home service in Alphastar Mobile. Save your address, choose a service and schedule, then send the request. Staff must confirm the service, area, and fee. Not every clinic service is available at home.', 'Oo! Puwede kang mag-request ng home service sa Alphastar Mobile. I-save ang address, pumili ng serbisyo at schedule, at ipadala ang request. Staff ang magkukumpirma kung puwede sa lugar mo at kung magkano. Hindi lahat ng serbisyo ay puwede sa bahay.'),
      'walk-ins': pair('Walk-ins are accepted for drug testing. For other services, ask staff before visiting. Alphastar Mobile is for home-service requests, not clinic-visit bookings.', 'Puwedeng walk-in sa drug testing. Para sa ibang serbisyo, magtanong muna sa staff bago pumunta. Para sa home service ang app, hindi para mag-book ng pagpunta sa clinic.'),
      'booking-guide': pair('In the Alphastar mobile app, request a home service:\n1. Save your address in Profile > Profile details.\n2. Open Book Appointment and complete any required forms.\n3. Choose a service, date, and time.\n4. Add directions in Notes, then review and submit.\n\nWait for staff to confirm your request. This chat has not booked anything.', 'Sa Alphastar mobile app, mag-request ng home service:\n1. I-save ang address sa Profile > Profile details.\n2. Buksan ang Book Appointment at sagutan ang kailangang form.\n3. Piliin ang serbisyo, petsa, at oras.\n4. Ilagay ang direksyon sa Notes, tingnan ang mga sagot, at i-submit.\n\nHintayin ang kumpirmasyon ng staff. Hindi pa booking ang request.'),
      'records-guide': pair('SMPE means Student Medical & Physical Examination. Fill it out in Medical Records. After submitting, check Profile > Medical History. The form is not a lab result. Open your own record in the app, not in this chat.', 'Ang SMPE ay Student Medical & Physical Examination. Sagutan ito sa Medical Records. Pagkatapos mag-submit, tingnan ang Profile > Medical History. Form ito, hindi lab result. Sa app mo buksan ang sarili mong record.'),
      'profile-help': pair('Open Profile > Profile details in the app. Fill in your name, contact number, and full address. Choose the province before the city, check your 4-digit ZIP code, then tap Save profile details. Keep your address out of this chat.', 'Buksan ang Profile > Profile details sa app. Ilagay ang pangalan, contact number, at kumpletong address. Piliin muna ang province bago ang city, tingnan ang 4-digit ZIP code, at pindutin ang Save profile details. Huwag ilagay ang address dito sa chat.'),
      'account-help': pair('Sign in using the same email or Google account you registered with. If you forgot your password or PIN, use Forgot password or Forgot PIN in the app. Need help with an email code? Choose a topic below. Keep passwords and codes private.', 'Mag-login gamit ang email o Google account na ginamit mo noon. Kung nakalimutan ang password o PIN, gamitin ang Forgot password o Forgot PIN sa app. Walang dumating na email code? Pumili ng tulong sa ibaba. Huwag ibigay ang password o code dito.'),
      security: pair('Open Profile > Security Settings in the app. Choose Change PIN or Change password. Change password is for email/password accounts; Google users change their password through Google.', 'Buksan ang Profile > Security Settings sa app. Piliin ang Change PIN o Change password. Para sa email/password account ang Change password. Kung Google ang gamit mo, sa Google palitan ang password.'),
      drafts: pair('Saved profiles and submitted forms stay with your account. Sign in to the same account after reinstalling. Unfinished drafts are only on your phone and may be lost after logout, uninstall, or clearing app data. Tap Save or Submit when ready.', 'Nasa account mo ang na-save na profile at na-submit na form. Gamitin ang parehong account kapag nag-install ulit. Sa phone lang ang hindi pa tapos na draft; puwedeng mawala kapag nag-logout, nag-uninstall, o nag-clear ng app data. Pindutin ang Save o Submit kapag tapos na.'),
      'mobile-data': pair('Yes, mobile data or Wi-Fi works. Check that your internet is connected, then try again. You need internet to sign in, submit forms, and open saved records. If it still will not load, ask staff for help.', 'Oo, puwede ang mobile data o Wi-Fi. Tingnan kung may internet, tapos subukan ulit. Kailangan ng internet para mag-login, mag-submit ng form, at buksan ang na-save na record. Kung ayaw pa rin, humingi ng tulong sa staff.'),
      status: pair('Already booked and asking for the date or time? This public website chatbot cannot access your patient account, see your booking or confirm a visit. Open Alphastar Mobile > Profile > Appointment Schedule and select your request. Pending means you still need clinic confirmation. If you cannot find it, ask staff privately before submitting another request. Do not post your booking ID or personal details here.', 'Nakapag-book ka na at hinahanap ang petsa o oras? Hindi nakikita ng public website chatbot ang account o booking mo at hindi ito makakakumpirma ng visit. Buksan ang Alphastar Mobile > Profile > Appointment Schedule at piliin ang request. Kapag Pending, kailangan pa ang kumpirmasyon ng clinic. Kung wala roon, magtanong muna nang pribado sa staff bago mag-submit ulit. Huwag ilagay rito ang booking ID o personal na detalye.'),
      reschedule: pair('To change the date or time of a home-service request, contact clinic staff. Wait for their confirmation before making plans. This chat has not changed your request.', 'Para palitan ang petsa o oras ng home-service request, kausapin ang staff. Hintayin ang kumpirmasyon nila bago magplano. Hindi binago ng chat ang request mo.'),
      cancel: pair('To cancel a home-service request, contact clinic staff and wait for confirmation. Nothing is cancelled through this chat.', 'Para kanselahin ang home-service request, kausapin ang staff at hintayin ang kumpirmasyon. Walang nakansela sa chat na ito.'),
      'queue-guide': pair('Home-service booking does not create a clinic queue ticket. For an in-person visit, clinic staff manage check-in and queue assignment. If an active ticket is available in your mobile account, use the app’s Queue screen. This public chatbot cannot look up, assign or change your queue number.', 'Hindi gumagawa ng clinic queue ticket ang home-service booking. Staff ang namamahala sa check-in at pila para sa in-person visit. Kung may active ticket sa mobile account mo, tingnan ang Queue screen. Hindi kayang makita, gumawa o baguhin ng public chatbot ang queue number mo.'),
      prices: pair('In the Alphastar mobile app, check the service in Book Appointment, then ask staff for the total price and any home-service fee. I do not have a final price quote here.', 'Sa Alphastar mobile app, tingnan ang serbisyo sa Book Appointment, tapos itanong sa staff ang kabuuang presyo at bayad sa home service. Wala akong tiyak na presyo dito.'),
      payment: pair('Ask staff which payment methods, PhilHealth benefits, or HMOs apply to your service. Confirm the fee and requirements before your visit.', 'Itanong sa staff kung anong bayad, PhilHealth benefit, o HMO ang puwede sa serbisyo mo. Alamin muna ang presyo at mga kailangan bago pumunta.'),
      results: pair('Result times depend on the test. Ask staff when and how to get yours. Medical History shows SMPE forms, not proof that a lab result is ready. I cannot open or explain your results here.', 'Depende sa test kung kailan lalabas ang resulta. Itanong sa staff kung kailan at paano makukuha. SMPE forms ang nasa Medical History, hindi patunay na ready na ang lab result. Hindi ko mabubuksan o maipapaliwanag ang resulta dito.'),
      preparation: pair('Test preparation depends on your test. Ask your doctor or staff about fasting, water, medicines, and what to bring. Do not change medicines based on a chatbot reply.', 'Depende sa test ang paghahanda. Itanong sa doktor o staff kung kailangang mag-ayuno, uminom ng tubig, o may kailangang dalhin. Huwag baguhin ang gamot dahil lang sa sagot ng bot.'),
      requirements: pair('Save your contact number and full address in the app. Fill out an SMPE form if required. Ask staff what ID, test preparation, and fees are needed for your home service.', 'I-save ang contact number at buong address sa app. Sagutan ang SMPE kung kailangan. Itanong sa staff kung anong ID, paghahanda, at bayad ang kailangan para sa home service.'),
      parking: pair('There is no car parking at Kasiglahan. Space for 1–3 motorcycles may be available. Ask staff before visiting; parking is not reserved through chat.', 'Walang paradahan ng kotse sa Kasiglahan. Puwedeng may lugar para sa 1–3 motor, depende sa bakante. Magtanong muna sa staff; hindi makakapag-reserve ng parking dito.'),
      license: pair('Ask Kasiglahan staff for the current DOH/FDA X-ray licence and its expiry date. An old notice does not confirm that it is still valid.', 'Itanong sa staff ang kasalukuyang DOH/FDA licence ng X-ray at kung kailan ito mag-e-expire. Hindi sapat ang lumang notice para malaman kung valid pa ito.'),
      privacy: pair('This chat does not look up patient accounts. Messages stay in this tab until you reload; nothing is sent to staff automatically. Keep passwords, PINs, codes, and medical results private. Contact clinic staff for questions about how patient information is handled.', 'Hindi nakikita ng chat ang patient account mo. Nasa tab na ito lang ang messages hanggang mag-reload; hindi ito kusang ipinapadala sa staff. Huwag ibigay ang password, PIN, code, o medical result. Sa staff magtanong kung paano iniingatan ang patient information.'),
      terms: pair('Read the Alphastar Terms and Conditions and Privacy Policy using the links below. They explain responsible use, account security, requests, SMPE forms and the limits of automated chat. A request is not a confirmed visit.', 'Basahin ang Alphastar Terms and Conditions at Privacy Policy sa mga link sa ibaba. Ipinaliliwanag nito ang tamang paggamit, account security, requests, SMPE forms at limitasyon ng chatbot. Hindi pa confirmed na visit ang isang request.'),
      identity: pair('I’m the Alphastar Help Bot, not a live staff member or doctor. I can explain clinic services and app steps. I cannot open private records, give medical advice, or confirm bookings.', 'Ako ang Alphastar Help Bot, hindi staff o doktor. Makakatulong ako sa mga serbisyo at paggamit ng app. Hindi ko mabubuksan ang private records, magbibigay ng payong medikal, o magkukumpirma ng booking.'),
      'privacy-refusal': pair('I cannot show private passwords, codes, or another patient’s records. For your own account, use the recovery steps in the app or ask staff. Do not share private details here.', 'Hindi ko maipapakita ang password, code, o record ng ibang pasyente. Para sa sarili mong account, gamitin ang recovery sa app o magtanong sa staff. Huwag ibigay ang private details dito.'),
      staff: pair('Do you need help? Choose Messenger or email below. Write and send your message there; this chat is not sent automatically. Staff may not reply right away.', 'Kailangan mo ba ng tulong? Piliin ang Messenger o email sa ibaba. Ikaw ang magsusulat at magpapadala doon; hindi kusang ipapadala ang chat na ito. Puwedeng hindi agad makasagot ang staff.'),
      'main-menu': pair('What do you need help with? Choose a topic below or type your question.', 'Saan mo kailangan ng tulong? Pumili sa ibaba o i-type ang tanong mo.'),
      greeting: pair('Choose a topic below or type your question. I’m here to guide you.', 'Pumili sa ibaba o i-type ang tanong mo. Tutulungan kita sa mga hakbang.'),
      thanks: pair('You’re welcome! What else can I help you with?', 'Walang anuman! Ano pa ang maitutulong ko?'),
      urgent: pair('For urgent symptoms, contact emergency services or go to the nearest emergency department immediately. Do not wait for this chat or a Messenger reply.', 'Kung emergency, tumawag sa emergency services o pumunta agad sa pinakamalapit na emergency room. Huwag hintayin ang sagot ng bot o Messenger.'),
      'medical-advice': pair('Please ask a doctor about symptoms, medicines, or test results. I cannot diagnose or prescribe. I can help you find clinic contact details.', 'Sa doktor magtanong tungkol sa nararamdaman, gamot, o resulta ng test. Hindi ako makakapagsuri o magrereseta. Puwede kitang tulungan kung paano makontak ang clinic.'),
      unknown: pair('Sorry, I’m not sure what you mean yet. Is this about a home service, the app, or an SMPE form? Choose a topic below or tell me a little more.', 'Pasensya, hindi ko pa gets ang tanong. Tungkol ba ito sa home service, app, o SMPE form? Pumili sa ibaba o dagdagan nang kaunti ang tanong mo.'),
    };
    if (['greeting', 'thanks', 'main-menu', 'identity'].includes(topic)) topics = mainTopics;
    if (topic === 'privacy') topics = ['view-privacy-policy', 'view-terms-and-conditions', 'main-menu'];
    if (topic === 'terms') topics = ['view-terms-and-conditions', 'view-privacy-policy', 'main-menu'];
    if (topic === 'about') topics = aboutTopics;
    if (topic === 'app') topics = [...appTopics, 'view-download'];
    if (topic === 'install-guide') topics = ['view-download', 'account-help', 'staff', 'main-menu'];
    if (['status', 'reschedule', 'cancel'].includes(topic)) topics = ['view-download', 'messenger', 'email', 'main-menu'];
    if (topic === 'queue-guide') topics = ['install-guide', 'staff', 'main-menu'];
    if (topic === 'hours') topics = ['view-contact', 'staff', 'main-menu'];
    if (topic === 'services') topics = ['home-service', 'prices', 'staff', 'main-menu'];
    if (topic === 'home-service') topics = ['booking-guide', 'requirements', 'staff', 'main-menu'];
    if (topic === 'booking-guide') topics = ['view-download', 'profile-help', 'staff', 'main-menu'];
    if (topic === 'records-guide') topics = ['drafts', 'mobile-data', 'staff', 'main-menu'];
    if (topic === 'account-help') topics = ['security', 'staff', 'main-menu'];
    if (['records-guide', 'profile-help', 'account-help', 'security', 'drafts', 'mobile-data'].includes(topic)) topics = [...topics.filter(id => id !== 'main-menu'), 'view-download', 'main-menu'];
    if (topic === 'staff') topics = ['messenger', 'email', 'main-menu'];
    if (topic === 'unknown') topics = ['main-menu', 'view-faq', 'staff'];
    if (topic === 'urgent') topics = []; // Do not present routine chat as emergency support.
    return { text: answers[topic] || answers.unknown, topics: topics.slice(), language };
  }

  const containsPrivateDetails = input => {
    if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\d[\s-]?){6,}|\b[a-f0-9]{8}(?:-[a-f0-9]{8}){3}\b|\b[A-Z2-7]{32}\b|\b(?:[A-Z2-7]{4}[ -]){7}[A-Z2-7]{4}\b|otpauth:\/\/|-----BEGIN (?:RSA )?PRIVATE KEY-----|\b(?:my|ang|aking) (?:address|name|full name|birthday|date of birth|patient id|record id|diagnosis|medical result|lab result|test result|blood sugar|blood pressure)\s*(?:is|ay|:|=)|\b(?:pangalan|address|tirahan|birthday|kaarawan|patient id|record id|resulta)\s+ko\s*(?:ay|:|=)/i.test(input)) return true;
    const labelled = String(input).match(/\b(?:password|pin|otp|verification code|authenticator code|setup key|recovery code|api key|private key|access token)(?:\s+ko)?\s*(?:is\b|ay\b|:|=)\s*(\S+)/i);
    return Boolean(labelled && !/^(?:not|incorrect|invalid|expired|missing|lost|forgotten|unavailable|different|hindi|wala|nawala|nakalimutan)\b/i.test(labelled[1]));
  };
  window.AlphastarClinicAssistant = Object.freeze({ resolveTopic, replyFor, languageFor, languageCommand, containsPrivateDetails });

  window.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('fab-menu');
    const log = document.getElementById('clinic-chat-messages');
    const topics = document.getElementById('clinic-chat-topics');
    const form = document.getElementById('clinic-chat-form');
    const input = document.getElementById('clinic-chat-input');
    const send = document.getElementById('clinic-chat-send');
    const status = document.getElementById('clinic-chat-status');
    const typing = document.getElementById('clinic-chat-typing');
    const typingLabel = document.getElementById('clinic-chat-typing-label');
    if (!panel || !log || !topics || !form || !input || !send || !status) return;
    const scroller = document.getElementById('clinic-chat-body') || log;
    let pendingOpenMessage;
    function revealMessage(row, smooth = true) {
      if (panel.hidden || panel.getAttribute('aria-hidden') === 'true' || panel.classList.contains('is-connecting')) {
        pendingOpenMessage = row;
        return;
      }
      pendingOpenMessage = undefined;
      const top = Math.max(0, (row.offsetTop || 0) - 10);
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      if (typeof scroller.scrollTo === 'function') {
        scroller.scrollTo({ top, behavior: smooth && !reducedMotion ? 'smooth' : 'auto' });
      } else {
        scroller.scrollTop = top;
      }
    }
    let previousTopic;
    let language = 'english';
    let languagePinned = false;
    let pendingTimer;
    let busy = false;
    const MENU_REPLY_DELAY_MS = 1500;
    let timestampTimer;
    const flow = window.AlphastarChatFlow;
    const languageControl = document.getElementById('clinic-chat-language');
    const translations = new Map();
    const messageDetails = new WeakMap();
    let pendingMenuSelection = false;
    let activePrompt;
    let unknownCount = 0;
    let lastReplyContent;
    let currentTopicCards = [];
    const labelFor = id => flow?.labelFor(id, language) || labels[id]?.[language === 'filipino' ? 1 : 0] || id;
    const localized = (en, fil) => language === 'filipino' ? fil : en;
    function syncTypingIndicator() {
      const visible = busy && !document.hidden && !panel.hidden && panel.getAttribute('aria-hidden') !== 'true' && !panel.classList.contains('is-connecting');
      if (typing) typing.hidden = !visible;
      if (typingLabel) typingLabel.textContent = localized('Alphastar is typing…', 'Sumasagot ang Alphastar…');
      log.setAttribute('aria-busy', String(busy));
    }
    new MutationObserver(syncTypingIndicator).observe(panel, { attributes: true, attributeFilter: ['hidden', 'aria-hidden', 'class'] });
    document.addEventListener('visibilitychange', syncTypingIndicator);
    const clockFormat = new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });

    function bindTranslation(element, update) {
      translations.set(element, update);
      update();
    }
    const bindText = (element, en, fil) => bindTranslation(element, () => { element.textContent = localized(en, fil); });
    const bindTopic = (element, id) => bindTranslation(element, () => { element.textContent = labelFor(id); });
    function labelText(en, fil) {
      const span = document.createElement('span');
      bindText(span, en, fil);
      return span;
    }
    const answerFor = topic => flow ? flow.reply(topic, language) : replyFor(topic, language);
    function syncLanguage() {
      panel.setAttribute('lang', language === 'filipino' ? 'tl' : 'en');
      if (languageControl) {
        const label = languageControl.querySelector('.clinic-chat-language-label') || languageControl;
        label.textContent = language === 'filipino' ? 'English' : 'Tagalog';
        languageControl.setAttribute('aria-label', language === 'filipino' ? 'Switch to English' : 'Switch to Tagalog');
        languageControl.setAttribute('title', languageControl.getAttribute('aria-label'));
      }
      const ui = {
        'clinic-chat-title': ['CHAT WITH US', 'KAUSAPIN KAMI'],
        'clinic-chat-intro-text': ['Connecting…', 'Binubuksan ang chat…'],
        'clinic-chat-input-label': ['Your question about Alphastar', 'Tanong mo tungkol sa Alphastar'],
        'clinic-chat-notice': ['Automated guide, not live staff. Don’t share PINs, passwords, codes, or medical results.', 'Bot na gabay, hindi live staff. Huwag ibigay ang PIN, password, code, o medical result.'],
      };
      for (const [id, words] of Object.entries(ui)) {
        const element = document.getElementById(id);
        if (element) element.textContent = localized(...words);
      }
      input.setAttribute('placeholder', localized('Type your message...', 'I-type ang tanong mo...'));
      log.setAttribute('aria-label', localized('Alphastar chat messages', 'Mga message sa Alphastar'));
      send.setAttribute('aria-label', localized('Send message', 'Ipadala ang message'));
      document.getElementById('clinic-chat-close')?.setAttribute('aria-label', localized('Close Alphastar Assistant', 'Isara ang Alphastar Assistant'));
      for (const [element, update] of translations) {
        if (panel.contains(element)) update(); else translations.delete(element);
      }
      for (const row of log.children) {
        const details = messageDetails.get(row);
        if (!details) continue;
        setMessageBody(details.body, answerFor(details.topic).text, details.greeting);
        details.body.setAttribute('lang', language === 'filipino' ? 'tl' : 'en');
      }
      if (busy) status.textContent = pendingMenuSelection ? localized('Loading…', 'Sandali lang…') : localized('Alphastar is replying…', 'Sumasagot ang Alphastar…');
      syncTypingIndicator();
      window.syncFabLanguage?.();
      refreshTimestamps();
    }
    function setLanguage(next, manual = false) {
      language = next;
      if (manual) languagePinned = true;
      syncLanguage();
    }
    function chooseLanguage(next) {
      setLanguage(next, true);
    }
    languageControl?.addEventListener('click', () => chooseLanguage(language === 'filipino' ? 'english' : 'filipino'));

    function pauseTimestamps() {
      window.clearTimeout(timestampTimer);
      timestampTimer = undefined;
    }
    function refreshTimestamps() {
      pauseTimestamps();
      if (document.hidden || panel.hidden || panel.getAttribute('aria-hidden') === 'true' || panel.classList.contains('is-connecting')) return;
      const now = Date.now();
      let nextUpdate = 60000;
      const timestamps = log.querySelectorAll('time');
      timestamps.forEach(timestamp => {
        const sentAt = Date.parse(timestamp.getAttribute('datetime'));
        const elapsed = Math.max(0, now - sentAt);
        const minutes = Math.floor(elapsed / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const age = language === 'filipino'
          ? days ? `${days} araw na` : hours ? `${hours} oras na` : minutes ? `${minutes} minuto na` : 'Ngayon lang'
          : days ? `${days} ${days === 1 ? 'day' : 'days'} ago`
            : hours ? `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
            : minutes ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago` : 'Just now';
        const label = `${age} \u00b7 ${clockFormat.format(sentAt)}`;
        if (timestamp.textContent !== label) timestamp.textContent = label;
        nextUpdate = Math.min(nextUpdate, 60000 - elapsed % 60000);
      });
      // One timer for the visible transcript; background/closed chat does no work.
      if (timestamps.length) timestampTimer = window.setTimeout(refreshTimestamps, nextUpdate);
    }

    const syncComposer = () => {
      send.disabled = busy || !input.value.trim();
      input.style.height = 'auto';
      input.style.height = `${Math.min(88, Math.max(36, input.scrollHeight))}px`;
    };
    function setMessageBody(body, text, greeting) {
      body.replaceChildren();
      if (!greeting) { body.textContent = text; return; }
      const hello = document.createElement('span');
      hello.textContent = 'Hello, ';
      const salutation = document.createElement('strong');
      salutation.className = 'clinic-chat-greeting';
      salutation.textContent = localized('Patient', 'Pasyente');
      const introduction = document.createElement('span');
      introduction.textContent = localized('! I’m the Alphastar Help Bot.', '! Ako ang Alphastar Help Bot.');
      const message = document.createElement('span');
      message.textContent = ` ${text}`;
      body.append(hello, salutation, introduction, message);
    }
    function appendMessage(role, text, { greeting = false, feedback = false, topic } = {}) {
      const row = document.createElement('div');
      row.className = `clinic-chat-message${role === 'patient' ? ' is-patient' : ''}`;
      const speaker = document.createElement('span');
      speaker.className = 'clinic-chat-speaker';
      bindText(speaker, role === 'patient' ? 'You' : 'Alphastar Help Bot', role === 'patient' ? 'Ikaw' : 'Alphastar Help Bot');
      const body = document.createElement('p');
      body.className = 'clinic-chat-bubble';
      setMessageBody(body, text, role === 'assistant' && greeting); // Text only, never HTML.
      const content = document.createElement('div');
      content.className = 'clinic-chat-message-content';
      content.append(speaker, body);
      if (feedback) renderFeedback(content);
      const sentAt = new Date();
      const timestamp = document.createElement('time');
      timestamp.className = 'clinic-chat-timestamp';
      timestamp.setAttribute('datetime', sentAt.toISOString());
      bindTranslation(timestamp, () => timestamp.setAttribute('title', `${localized('Sent', 'Ipinadala')} ${sentAt.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}`));
      // Keep minute-by-minute changes out of the live message announcements.
      timestamp.setAttribute('aria-live', 'off');
      timestamp.textContent = `Just now \u00b7 ${clockFormat.format(sentAt)}`;
      content.appendChild(timestamp);
      if (role !== 'patient') {
        const avatar = document.createElement('img');
        avatar.className = 'clinic-chat-avatar';
        avatar.src = 'assets/images/alphastarlogo.png';
        avatar.alt = '';
        avatar.width = 40;
        avatar.height = 40;
        avatar.setAttribute('aria-hidden', 'true');
        row.appendChild(avatar);
      }
      row.appendChild(content);
      if (role === 'patient') {
        const avatar = document.createElement('span');
        avatar.className = 'clinic-chat-patient-avatar';
        bindText(avatar, 'Me', 'Ako');
        // The hidden speaker already labels this message as "You".
        avatar.setAttribute('aria-hidden', 'true');
        row.appendChild(avatar);
      }
      if (role === 'assistant') lastReplyContent = content;
      if (role === 'assistant' && topic) messageDetails.set(row, { body, topic, greeting });
      log.appendChild(row);
      while (log.children.length > 40) log.firstElementChild.remove();
      refreshTimestamps();
      return row;
    }
    function renderFeedback(content) {
      const card = document.createElement('div');
      card.className = 'clinic-chat-feedback';
      card.setAttribute('role', 'group');
      bindTranslation(card, () => card.setAttribute('aria-label', localized('Was this helpful?', 'Nakatulong ba ito?')));
      const question = document.createElement('p');
      bindText(question, 'Did this help?', 'Nakatulong ba ito?');
      const buttons = document.createElement('div');
      buttons.className = 'clinic-chat-feedback-buttons';
      for (const id of ['feedback-helpful', 'feedback-unhelpful']) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `clinic-chat-rating${id === 'feedback-unhelpful' ? ' is-down' : ''}`;
        bindTranslation(button, () => button.setAttribute('aria-label', labelFor(id)));
        button.setAttribute('aria-pressed', 'false');
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M7 21H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m0 11V10l4-8a3 3 0 0 1 3 3v5h6a2 2 0 0 1 2 2l-2 7a2 2 0 0 1-2 2H7Z');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '1.7');
        path.setAttribute('stroke-linejoin', 'round');
        icon.appendChild(path);
        button.appendChild(icon);
        button.addEventListener('click', () => {
          if (busy || button.disabled) return;
          button.setAttribute('aria-pressed', 'true');
          respond(id, labelFor(id));
        });
        buttons.appendChild(button);
      }
      card.append(question, buttons);
      content.appendChild(card);
    }
    function archiveTopics(selectedTopic) {
      if (!lastReplyContent || !currentTopicCards.length) return;
      const card = document.createElement('div');
      card.className = 'clinic-chat-topic-history';
      bindTranslation(card, () => card.setAttribute('aria-label', localized('Previous topic choices', 'Mga naunang pagpipilian')));
      for (const { id } of currentTopicCards) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `clinic-chat-topic${id === selectedTopic ? ' is-selected' : ''}`;
        bindTopic(button, id);
        button.disabled = true; // Historical options cannot restart an old flow.
        card.appendChild(button);
      }
      lastReplyContent.appendChild(card);
      currentTopicCards = [];
    }
    function renderTopics(ids) {
      topics.replaceChildren();
      currentTopicCards = ids.map(id => ({ id, label: labelFor(id) }));
      for (const id of ids) {
        const legalPage = { 'view-privacy-policy': 'privacy-policy.html', 'view-terms-and-conditions': 'terms-and-conditions.html' }[id];
        const isLink = Boolean(legalPage) || ['messenger', 'email', 'view-download'].includes(id);
        const action = document.createElement(isLink ? 'a' : 'button');
        action.className = `clinic-chat-topic${id === 'staff' || isLink ? ' is-staff' : ''}`;
        bindTopic(action, id);
        if (isLink) {
          action.href = legalPage || (id === 'view-download' ? '#app-download' : id === 'messenger' ? 'https://m.me/alphastarlaboratory' : 'mailto:info@alphastarlabclinic.com');
          if (legalPage) { action.target = '_blank'; action.rel = 'noopener noreferrer'; }
          if (id === 'messenger') { action.target = '_blank'; action.rel = 'noopener noreferrer'; }
          if (id === 'view-download') action.addEventListener('click', event => {
            event.preventDefault();
            if (busy || panel.classList.contains('is-connecting')) return;
            window.closeFab?.();
            if (typeof window.scrollToAppDownload === 'function') window.scrollToAppDownload();
            else if (typeof scrollToSection === 'function') scrollToSection('#home');
          });
        } else {
          action.type = 'button';
          action.addEventListener('click', () => {
            if (busy || panel.classList.contains('is-connecting')) return;
            if (id.startsWith('view-')) {
              const section = { 'view-faq': '#faq', 'view-contact': '#contact' }[id];
              window.closeFab?.();
              if (typeof scrollToSection === 'function') scrollToSection(section);
              return;
            }
            respond(id, action.textContent, { menuSelection: true });
          });
        }
        topics.appendChild(action);
      }
    }
    function renderSupportForm() {
      const support = document.createElement('form');
      support.className = 'clinic-chat-support';
      support.noValidate = true;
      const heading = document.createElement('h3');
      bindText(heading, 'Message for staff', 'Message para sa staff');
      const topicLabel = document.createElement('label');
      topicLabel.appendChild(labelText('What is it about?', 'Tungkol saan?'));
      const category = document.createElement('select');
      category.name = 'supportTopic';
      category.required = true;
      bindTranslation(category, () => category.setAttribute('aria-label', localized('What is it about?', 'Tungkol saan?')));
      const placeholder = document.createElement('option');
      placeholder.value = '';
      bindText(placeholder, 'Choose a topic...', 'Pumili ng tanong...');
      category.appendChild(placeholder);
      for (const item of flow.supportTopics) {
        const option = document.createElement('option');
        option.value = item.id;
        bindText(option, item.label, item.tagalog);
        category.appendChild(option);
      }
      topicLabel.appendChild(category);
      const commentLabel = document.createElement('label');
      commentLabel.appendChild(labelText('What do you need help with?', 'Ano ang tanong o problema mo?'));
      const comments = document.createElement('textarea');
      comments.name = 'supportComments';
      comments.rows = 4;
      comments.maxLength = 600;
      comments.required = true;
      bindTranslation(comments, () => {
        comments.placeholder = localized('Tell us the issue. Leave out private details.', 'Isulat ang problema. Huwag isama ang private details.');
        comments.setAttribute('aria-label', localized('What do you need help with?', 'Ano ang tanong o problema mo?'));
      });
      commentLabel.appendChild(comments);
      const consentLabel = document.createElement('label');
      consentLabel.className = 'clinic-chat-consent';
      const consent = document.createElement('input');
      consent.type = 'checkbox';
      consent.name = 'supportConsent';
      consent.required = true;
      const consentText = document.createElement('span');
      bindText(consentText, 'I checked my message. It has no personal details, passwords, PINs, codes, or medical results.', 'Na-check ko ang message. Wala itong personal na detalye, password, PIN, code, o medical result.');
      consentLabel.append(consent, consentText);
      const error = document.createElement('p');
      error.className = 'clinic-chat-support-error';
      error.setAttribute('role', 'alert');
      let validationShown = false;
      const makeDraft = () => flow.createSupportDraft({ topic: category.value, comments: comments.value, consent: consent.checked, language });
      bindTranslation(error, () => { if (validationShown) error.textContent = makeDraft().error || ''; });
      const prepare = document.createElement('button');
      prepare.type = 'submit';
      prepare.className = 'clinic-chat-topic';
      bindText(prepare, 'Prepare message', 'Gumawa ng message');
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'clinic-chat-topic is-secondary';
      bindTopic(cancel, 'draft-cancelled');
      cancel.addEventListener('click', () => { if (!busy) respond('draft-cancelled', cancel.textContent); });
      support.addEventListener('submit', event => {
        event.preventDefault();
        if (busy || panel.classList.contains('is-connecting')) return;
        const draft = makeDraft();
        if (draft.error) {
          validationShown = true;
          error.textContent = draft.error;
          revealMessage(error, false);
          return;
        }
        respond('support-prepared', prepare.textContent, { draft });
      });
      support.append(heading, topicLabel, commentLabel, consentLabel, error, prepare, cancel);
      topics.appendChild(support);
      return support;
    }
    function renderSupportPreview(draft) {
      const card = document.createElement('div');
      card.className = 'clinic-chat-support';
      const label = document.createElement('label');
      label.appendChild(labelText('Review your message (not sent)', 'Basahin ang message (hindi pa naipadala)'));
      const preview = document.createElement('textarea');
      preview.readOnly = true;
      preview.rows = 6;
      preview.value = draft.message;
      bindTranslation(preview, () => preview.setAttribute('aria-label', localized('Review your message (not sent)', 'Basahin ang message (hindi pa naipadala)')));
      label.appendChild(preview);
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'clinic-chat-topic';
      bindText(copy, 'Copy message', 'Kopyahin ang message');
      const copyStatus = document.createElement('p');
      copyStatus.className = 'clinic-chat-support-note';
      copyStatus.setAttribute('role', 'status');
      copy.addEventListener('click', async () => {
        try {
          if (!window.navigator?.clipboard?.writeText) throw new Error('Clipboard unavailable');
          await window.navigator.clipboard.writeText(draft.message);
          bindText(copyStatus, 'Copied. Open Messenger and paste it when ready.', 'Nakopya na. Buksan ang Messenger at i-paste kapag handa na.');
        } catch {
          preview.focus({ preventScroll: true });
          preview.select();
          bindText(copyStatus, 'Message selected. Tap Copy on your device, then open Messenger.', 'Napili ang message. Pindutin ang Copy sa phone, tapos buksan ang Messenger.');
        }
      });
      for (const [href, en, fil] of [[draft.emailHref, 'Open email draft', 'Buksan ang email draft'], [draft.messengerHref, 'Open Messenger', 'Buksan ang Messenger']]) {
        const link = document.createElement('a');
        link.className = 'clinic-chat-topic';
        link.href = href;
        if (href.startsWith('https:')) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
        bindText(link, en, fil);
        card.appendChild(link);
      }
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'clinic-chat-topic is-secondary';
      bindTopic(cancel, 'draft-cancelled');
      cancel.addEventListener('click', () => { if (!busy) respond('draft-cancelled', cancel.textContent); });
      // Preview and copy stay before the channel links; nothing opens automatically.
      card.prepend(label, copy, copyStatus);
      card.appendChild(cancel);
      topics.appendChild(card);
      return card;
    }
    function respond(topic, displayedQuestion, { draft, menuSelection = false } = {}) {
      if (busy || panel.classList.contains('is-connecting')) return;
      busy = true;
      pendingMenuSelection = menuSelection;
      if (!['unknown', 'staff-offer'].includes(topic)) unknownCount = 0;
      archiveTopics(topic);
      topics.replaceChildren();
      log.querySelectorAll('button').forEach(button => { button.disabled = true; });
      const questionRow = appendMessage('patient', displayedQuestion);
      status.classList.add('is-typing');
      status.textContent = menuSelection ? localized('Loading…', 'Sandali lang…')
        : localized('Alphastar is replying…', 'Sumasagot ang Alphastar…');
      syncComposer();
      syncTypingIndicator();
      revealMessage(typing || questionRow);
      previousTopic = topic;
      activePrompt = undefined;
      pendingTimer = window.setTimeout(() => {
        pendingTimer = undefined;
        const reply = answerFor(topic);
        const replyRow = appendMessage('assistant', reply.text, { greeting: topic === 'greeting', feedback: reply.feedback, topic });
        status.textContent = '';
        status.classList.remove('is-typing');
        busy = false;
        pendingMenuSelection = false;
        activePrompt = reply.prompt;
        renderTopics(reply.topics);
        let visibleTarget = replyRow;
        if (reply.supportForm) visibleTarget = renderSupportForm();
        if (draft) visibleTarget = renderSupportPreview(draft);
        syncLanguage();
        syncComposer();
        // Show the start of the reply, not just the buttons below a long answer.
        revealMessage(visibleTarget);
      }, menuSelection ? MENU_REPLY_DELAY_MS : 420);
    }
    function resetChat() {
      window.clearTimeout(pendingTimer);
      busy = false;
      pendingMenuSelection = false;
      previousTopic = undefined;
      activePrompt = undefined;
      unknownCount = 0;
      currentTopicCards = [];
      lastReplyContent = undefined;
      language = 'english';
      languagePinned = false;
      translations.clear();
      input.value = '';
      status.textContent = '';
      status.classList.remove('is-typing');
      log.replaceChildren();
      const welcome = appendMessage('assistant', replyFor('greeting', language).text, { greeting: true, topic: 'greeting' });
      renderTopics(mainTopics);
      syncLanguage();
      syncComposer();
      scroller.scrollTop = 0;
      revealMessage(welcome, false);
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      const question = input.value.trim().slice(0, 600);
      if (!question || busy || panel.classList.contains('is-connecting')) return;
      const command = languageCommand(question);
      if (command) {
        input.value = '';
        chooseLanguage(command);
        syncComposer();
        return;
      }
      // Keep short follow-ups in the current language; an explicit switch wins.
      const shortFollowUp = /^(?:yes|yeah|yep|no|nope|not yet|ok|okay|sure|help|cancel|stop|how|how long|when|where|what next|what's next|any update|next|thanks|thank you)(?: please| thanks| po)?[!?.]*$/i.test(question);
      if (!languagePinned && !shortFollowUp) setLanguage(languageFor(question));
      const topic = flow ? flow.resolve(question, { previousTopic, prompt: activePrompt, unknownCount }) : resolveTopic(question, previousTopic);
      unknownCount = topic === 'unknown' ? unknownCount + 1 : topic === 'staff-offer' ? unknownCount : 0;
      const sensitive = containsPrivateDetails(question) || ['urgent', 'medical-advice', 'privacy-refusal'].includes(topic);
      const echo = sensitive ? (language === 'filipino' ? '[Inalis ang private details sa chat]' : '[Private details omitted from chat]') : question;
      input.value = '';
      respond(topic, echo);
    });
    input.addEventListener('input', syncComposer);
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        form.requestSubmit();
      }
    });
    window.alphastarChat = Object.freeze({
      setLanguage(value) { setLanguage(value === 'tl' ? 'filipino' : 'english', true); },
      getLanguage: () => language === 'filipino' ? 'tl' : 'en',
      prepareOpen() {
        refreshTimestamps();
        if (pendingOpenMessage) revealMessage(pendingOpenMessage, false);
      },
      pauseTimestamps,
      syncTimestamps: refreshTimestamps,
      syncViewport() {
        const viewport = window.visualViewport;
        const height = viewport?.height || window.innerHeight;
        // Pinch-zoom is not a keyboard opening. Leave the panel anchored then.
        const offset = viewport && viewport.scale === 1 ? Math.max(0, window.innerHeight - height - viewport.offsetTop) : 0;
        panel.style.setProperty('--chat-viewport-height', `${height}px`);
        panel.classList.toggle('is-compact', height < 540);
        const container = document.getElementById('fab-container');
        container?.style.setProperty('--chat-keyboard-offset', `${offset}px`);
        container?.classList.toggle('is-chat-compact', height < 540);
      },
    });
    resetChat();
  });
})();
