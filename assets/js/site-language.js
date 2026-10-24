/* Curated English/Tagalog copy. Only the language choice is saved, never chat
 * messages or patient details. Text bindings keep links, icons and UI state. */
(() => {
  'use strict';
  const STORAGE_KEY = 'alphastar_site_language_v1';
  const TAGALOG = Object.freeze({
    'nav.home': 'Simula', 'nav.about': 'Tungkol', 'nav.services': 'Serbisyo',
    'nav.why': 'Bakit Kami', 'nav.hours': 'Oras', 'nav.faq': 'Mga Tanong', 'nav.contact': 'Kontak',
    'messenger.official': 'Opisyal na Messenger', 'days.monSat': 'Lun–Sab', 'days.sun': 'Linggo',
    'hero.your': 'Ang', 'hero.trusted': 'Maaasahang', 'hero.diagnostic': 'Pagsusuri at', 'hero.clinic': 'Serbisyong Medikal',
    'hero.intro': 'Mabilis, maaasahan, at de-kalidad na serbisyong pangkalusugan na may malasakit sa iyo. Mula sa laboratory tests hanggang executive check-up, kasama mo kami sa bawat hakbang.',
    'download.heading': 'I-DOWNLOAD ANG APP', 'download.through': 'I-download gamit ang', 'download.for': 'I-download para sa',
    'download.ready': 'Pindutin ang I-download para sa Android para i-save ang APK. Buksan ang na-download na file para i-install ang Alphastar.',
    'download.release': 'Bersyon {version} · {size} MB · Testing build',
    'download.missing': 'Inihahanda pa ang download link. Hingin muna sa clinic staff ang opisyal na APK link.',
    'action.home': 'Pumunta sa Simula', 'action.faq': 'Tingnan ang mga tanong', 'action.scroll': 'Tingnan sa ibaba',
    'about.heading': 'Alaga sa Kalusugan na may', 'about.expertise': 'Kaalaman', 'word.and': 'at', 'about.compassion': 'Malasakit',
    'about.intro': 'Ang AlphaStar Laboratory Diagnostic and Multi-Specialty Clinic ay nagsisilbi sa Kasiglahan Village at mga kalapit na lugar sa Rodriguez, Rizal.',
    'about.visit': 'Magpapa-check-up o laboratory test? Magtanong muna sa clinic tungkol sa schedule, paghahanda, at kung available ang serbisyo bago pumunta.',
    'about.image': 'Health professional na nag-aalaga ng bata sa clinic',
    'services.our': 'Mga', 'services.medical': 'Serbisyong', 'services.services': 'Medikal',
    'services.intro': 'Narito ang mga serbisyo ng clinic. Itanong muna ang schedule, paghahanda, presyo, at kung available ang kailangan mo bago pumunta.',
    'services.more': 'Wala sa listahan ang kailangan mo? Kausapin kami para matulungan ka.',
    'why.patients': 'Bakit Kami', 'why.choose': 'Pinipili', 'why.us': 'ng mga Pasyente',
    'why.intro': 'Narito ang impormasyon ng clinic. Ang mga detalyeng puwedeng magbago ay kailangang kumpirmahin sa staff.',
    'why.doctor': 'Serbisyo ng Doktor', 'why.doctorDesc': 'May regular check-up, medical requirements para sa trabaho, bakuna, at executive check-up.',
    'why.lab': 'Laboratory Tests', 'why.labDesc': 'May automated blood chemistry, CBC, urinalysis, at iba pang available na laboratory tests.',
    'why.testSpecific': 'Pagkuha ng Resulta', 'why.release': 'Depende sa Test',
    'why.releaseDesc': 'Depende sa test at pagproseso kung kailan lalabas ang resulta. Itanong sa staff ang inaasahang oras ng release.',
    'why.hours': 'Bukas Araw-araw', 'why.hoursDesc': 'Ang regular na schedule ay Lunes hanggang Linggo. Magtanong muna kung may holiday o pagbabago sa oras.',
    'banner.visit': 'Pupunta ka ba sa clinic?', 'banner.visitDesc': 'I-download ang app para makita ang clinic updates at magamit ang mga mobile feature.',
    'banner.question': 'May tanong ka?', 'banner.questionDesc': 'Magtanong tungkol sa mga serbisyo, paghahanda sa test, o clinic. Nandito kami para tumulong.',
    'hours.clinic': 'Oras', 'hours.hours': 'ng Clinic', 'hours.availability': 'at mga Serbisyo',
    'hours.intro': 'Oras sa Pilipinas ang schedule sa ibaba. Puwedeng iba ang oras kapag holiday.',
    'hours.weekly': 'Schedule sa Bawat Araw', 'hours.daily': 'Bukas araw-araw, 7:00 AM hanggang 4:00 PM',
    'hours.note': 'Puwedeng magbago ang oras kapag holiday. Mag-message muna sa clinic bago pumunta.',
    'hours.home': 'Magtanong sa Home Service', 'hours.homeDesc': 'May home service, depende sa lugar, serbisyo, bayad, at schedule ng staff.',
    'hours.contact': 'Kontak ng Clinic', 'hours.walkin': 'Magtanong Muna para sa Walk-in',
    'hours.walkinDesc': 'Tumatanggap ng walk-in para sa drug testing. Kumpirmahin muna ang konsulta, imaging, bakuna, packages, at espesyal na tests.',
    'days.Monday': 'Lunes', 'days.Tuesday': 'Martes', 'days.Wednesday': 'Miyerkules', 'days.Thursday': 'Huwebes',
    'days.Friday': 'Biyernes', 'days.Saturday': 'Sabado', 'days.Sunday': 'Linggo', 'days.today': 'Ngayon',
    'status.open': 'Bukas Ngayon', 'status.closed': 'Sarado Ngayon',
    'status.openUntil': 'Bukas Hanggang {time}', 'status.begin': 'Regular na Bukas Mula {time}',
    'status.openNote': 'Bukas ngayon hanggang {time}. Depende sa serbisyo kung puwede ang walk-in.',
    'status.closedNote': 'Sarado ngayon. Ang regular na pagbubukas ay {time}.',
    'faq.frequently': 'Mga Madalas', 'faq.questions': 'na Tanong',
    'faq.intro': 'Mga sagot tungkol sa Alphastar Mobile, home service, patient forms, at pagpunta sa clinic.',
    'contact.contact': 'Kausapin', 'contact.us': 'Kami', 'contact.today': 'Ngayon', 'contact.intro': 'Mag-message sa clinic kung may tanong.',
    'contact.location': 'Lokasyon', 'contact.directions': 'Tingnan ang Direksyon', 'contact.availability': 'Magtanong sa clinic kung available ang serbisyo',
    'contact.email': 'Email Address', 'contact.officialEmail': 'Opisyal na email ng clinic', 'contact.address': 'Address ng Clinic',
    'contact.near': "Kasiglahan Village, San Jose, Rodriguez, Rizal (malapit sa McDonald's Kasiglahan)",
    'contact.hours': 'Oras ng Clinic', 'contact.monSat': 'Lun–Sab: 7:00 AM–4:00 PM', 'contact.sun': 'Linggo: 7:00 AM–4:00 PM',
    'bottom.ready': 'Gusto mo bang gamitin ang Alphastar app?', 'bottom.download': 'Pumunta sa Download',
    'footer.intro': 'Clinic para sa pagsusuri at iba pang serbisyong medikal sa Kasiglahan Village at mga kalapit na lugar sa Rodriguez, Rizal.',
    'footer.hours': 'Lun–Sab 7:00 AM–4:00 PM · Linggo 7:00 AM–4:00 PM',
    'footer.links': 'Mga Link', 'footer.about': 'Tungkol sa Amin', 'footer.why': 'Bakit Alphastar', 'footer.contact': 'Kausapin Kami',
    'footer.services': 'Mga Serbisyo', 'footer.contactInfo': 'Detalye ng Kontak', 'footer.rights': 'Lahat ng karapatan ay nakalaan.',
    'footer.privacy': 'Privacy ng Datos', 'footer.terms': 'Mga Tuntunin at Kondisyon',
    'a11y.legal': 'Mga notice at tuntunin',
    'menu.open': 'Buksan ang menu', 'menu.close': 'Isara ang menu',
    'a11y.clinicInfo': 'Impormasyon ng clinic', 'a11y.messenger': 'Mag-message sa Alpha Star Laboratory Clinic sa Messenger',
    'a11y.offers': 'Mga alok ng Alpha Star Clinic', 'a11y.offer1': 'Alok 1 sa 3', 'a11y.offer2': 'Alok 2 sa 3', 'a11y.offer3': 'Alok 3 sa 3',
    'a11y.poster1': 'Poster ng laboratory promo ng Alpha Star', 'a11y.poster2': 'Poster ng tuli package ng Alpha Star', 'a11y.poster3': 'Poster ng mga serbisyo at package ng Alpha Star',
    'a11y.banner': 'Pagpunta sa clinic at mga tanong', 'a11y.slide1': '1 sa 2', 'a11y.slide2': '2 sa 2',
    'a11y.mapContact': 'Mapa at kontak ng clinic', 'a11y.map': 'Mapa ng Alpha Star Laboratory Clinic', 'a11y.contact': 'Detalye ng kontak ng clinic',
    'a11y.facebook': 'Opisyal na Facebook ng AlphaStar', 'a11y.instagram': 'Opisyal na Instagram ng AlphaStar', 'a11y.socialMessenger': 'Opisyal na Messenger ng AlphaStar',
    'site.title': 'Alphastar – Clinic at Serbisyong Medikal',
    'site.description': 'Alphastar – Maaasahang laboratory at clinic sa Rodriguez, Rizal.',
    'service.1.title': 'Mga Laboratory Test', 'service.1.desc': 'May CBC, urinalysis, blood chemistry, at iba pang available na laboratory tests.',
    'service.2.title': 'Digital X-Ray', 'service.2.desc': 'May digital X-ray para sa mga available na pagsusuri.',
    'service.3.title': 'Ultrasound', 'service.3.desc': 'May ultrasound para sa mga available na pagsusuri.',
    'service.4.title': 'ECG', 'service.4.desc': 'May ECG para maitala ang ritmo ng tibok ng puso.',
    'service.5.title': 'Drug Testing', 'service.5.desc': 'May drug testing para sa trabaho, paaralan, legal, at personal na requirements.',
    'service.6.title': 'Medical Exam para sa Trabaho', 'service.6.desc': 'May pre-employment medical exam. Depende sa employer o agency ang mga kailangan.',
    'service.7.title': 'Executive Check-Up', 'service.7.desc': 'May executive check-up para sa mga gustong magpa-health screening.',
    'service.8.title': 'Regular na Check-Up', 'service.8.desc': 'May regular na medical check-up sa mga doktor ng clinic.',
    'service.9.title': 'Medical Certificate', 'service.9.desc': 'Puwedeng humiling ng medical certificate matapos suriin ng doktor. Hindi garantisado ang pag-isyu nito.',
    'service.10.title': 'Home Service', 'service.10.desc': 'May home service sa Alphastar. Kumpirmahin muna ang mga detalye sa Kasiglahan branch.',
    'service.11.title': 'Painless Tuli', 'service.11.desc': 'May painless tuli na isinasagawa sa pangangalaga ng mga medical professional.',
    'service.12.title': 'Student Pack', 'service.12.desc': 'Health package para sa karaniwang medical at laboratory requirements ng paaralan.',
    'faq.1.q': 'Ano ang Alphastar Mobile?',
    'faq.1.a': 'Ang Alphastar Mobile ay Android app para sa mga pasyente. Puwede kang mag-request ng home service, mag-update ng profile, sumagot ng SMPE form, at makita ang na-submit na forms at status. May Appointment Schedule, Appointment History, clinic notifications, Security Settings para sa PIN, at Agent Support. Hindi sa app bina-book ang pagpunta sa clinic.',
    'faq.2.q': 'Paano magsimula sa Alphastar Mobile?',
    'faq.2.a': 'Mag-login o gumawa ng account gamit ang email at password, o Google. Sundin ang verification, sagutan ang patient details, at gumawa ng pribadong 6-digit PIN. Bago mag-request ng home service, i-save ang buong pangalan, contact number, at kumpletong address sa Profile > Profile details.',
    'faq.3.q': 'May home service ba kayo?',
    'faq.3.a': 'Oo. Sa app, buksan ang Book Appointment. I-save muna ang address sa Profile > Profile details at kumpletuhin ang hinihinging requirements. Pumili ng isang serbisyo, available na petsa at oras, maglagay ng notes, at i-submit. Hindi pa confirmed ang booking kapag na-submit; staff ang magkukumpirma ng serbisyo, lugar, schedule, at bayad. Tingnan ang Appointment Schedule at notifications. Hindi lahat ng serbisyo ay puwede sa bahay.',
    'faq.4.q': 'Anong medical form ang puwedeng sagutan sa app?',
    'faq.4.a': 'May Student Medical & Physical Examination (SMPE) sa Medical Records. Sagutan ang kailangang detalye, tingnan ang mga sagot, at i-submit. Sa Profile > Medical History makikita ang na-submit na form at status. Hindi lab result ang form. Sa staff magtanong tungkol sa resulta at mga kailangan sa medical examination.',
    'faq.5.q': 'Naka-save pa ba ang impormasyon kapag umalis ako sa app?',
    'faq.5.a': 'Nasa account mo ang matagumpay na na-save na profile at na-submit na forms. Gamitin ang parehong account pagkatapos mag-logout o mag-install ulit. Ang hindi pa tapos na SMPE, booking, at profile form ay pansamantalang draft sa phone kapag nag-minimize o lumipat ng app. Hindi pa ito na-submit at puwedeng mawala kapag nag-logout, nag-uninstall, o nag-clear ng app data. Pindutin ang Save o Submit para mapunta sa account ang impormasyon.',
    'faq.6.q': 'Paano palitan ang PIN o password?',
    'faq.6.a': 'Buksan ang Profile > Security Settings. Sa Change PIN, ilagay ang kasalukuyang PIN, bagong 6-digit PIN, at ulitin ito. Sa email/password account, may Change password: ilagay ang kasalukuyang password, bagong password, at confirmation, tapos gamitin ang code sa email. Walang Change password sa app para sa Google account; sa Google ito palitan. Huwag ibigay ang PIN, password, o code sa iba.',
    'faq.7.q': 'Puwede ba ang mobile data?',
    'faq.7.a': 'Oo, puwede ang mobile data o Wi-Fi. Kailangan ng internet para mag-login, mag-submit ng home-service request o form, at makita ang bagong account at clinic updates. Kung ayaw mag-load, tingnan ang internet at subukan ulit. Para sa tulong, gamitin ang Agent Support sa app o mag-message sa Messenger ng clinic.',
    'faq.8.q': 'Anong mga serbisyo ang mayroon?',
    'faq.8.a': 'May konsulta at check-up, annual physical examination (APE), medical exam para sa trabaho, bakuna, executive check-up, laboratory tests, digital X-ray, ultrasound, ECG, drug testing, at serbisyo sa lugar ng kumpanya. Puwedeng magbago ang availability, schedule, at package. Itanong muna sa staff ang serbisyo, presyo, at requirements. Para sa home service, piliin ang available sa app; hindi lahat ng serbisyo sa clinic ay puwede sa bahay.',
    'faq.9.q': 'Saan ang Kasiglahan branch?',
    'faq.9.a': "Nasa Lot 3-A, Block 9, Phase 1B, Kasiglahan Village, San Jose, Rodriguez, Rizal ang Alphastar, malapit sa McDonald's Kasiglahan. Gamitin ang mapa at Tingnan ang Direksyon sa Kontak para sa pagpunta mo.",
    'faq.10.q': 'Anong oras bukas ang clinic?',
    'faq.10.a': 'Regular na bukas ang Kasiglahan clinic mula Lunes hanggang Linggo, 7:00 AM hanggang 4:00 PM. Puwedeng iba ang oras kapag holiday o para sa isang serbisyo o doktor. Tingnan ang Oras ng Clinic at kumpirmahin sa staff bago pumunta. Kailangan ding kumpirmahin ng clinic ang schedule ng home service.',
    'faq.11.q': 'Tumatanggap ba ng walk-in?',
    'faq.11.a': 'Oo, para sa drug testing. Mag-message muna sa Kasiglahan branch para sa konsulta, imaging, bakuna, packages, at espesyal na tests dahil puwedeng magbago ang availability. Para sa home-service requests ang app, hindi pag-book ng walk-in o pagpunta sa clinic.',
    'faq.12.q': 'Kailan makukuha ang resulta?',
    'faq.12.a': 'Depende sa test, package, at pagproseso. Itanong sa staff kung kailan at paano makukuha ang resulta pagkatapos ng pagkuha ng sample o examination. Ang Medical History sa app ay para sa SMPE forms at review status; hindi nito kinukumpirma na ready na ang lab result.',
    'faq.13.q': 'Kailangan bang hindi muna kumain bago mag-test?',
    'faq.13.a': 'Depende sa test. Itanong muna sa doktor o staff kung kailangang mag-fasting, uminom ng tubig, at kung may instructions sa gamot, ID, o iba pang requirements. Sundin ang instructions para sa mismong test mo. Hindi pare-pareho ang paghahanda sa lahat ng test.',
    'faq.14.q': 'Puwede ba ang PhilHealth, HMO, o ibang paraan ng bayad?',
    'faq.14.a': 'Kumpirmahin sa Kasiglahan branch ang PhilHealth benefits, HMO, paraan ng bayad, at fees bago pumunta o mag-home service. Hindi kinukumpirma ng app request ang coverage o bayad. Staff ang magpapaliwanag ng mga kailangan para sa napili mong serbisyo.',
    'faq.15.q': 'May lisensya ba ang X-ray sa Kasiglahan?',
    'faq.15.a': 'Itanong sa Kasiglahan branch ang kasalukuyang DOH/FDA license ng X-ray at validity dates. Para sa partikular na lugar at serbisyo ang lisensya. Hindi sapat ang lumang notice para kumpirmahin ang kasalukuyang status ng lahat ng serbisyo.',
    'faq.16.q': 'Paano makakausap ang Alphastar?',
    'faq.16.a': 'Gamitin ang Opisyal na Messenger sa website, ang Alphastar Laboratory Facebook page, o email sa info@alphastarlabclinic.com. Sa app, may Profile > Agent Support. Para sa booking confirmation, serbisyo, bayad, paghahanda, o pagkuha ng resulta, kausapin ang clinic staff. Huwag mag-send ng password, PIN, o verification code.',
  });
  let language = 'en';
  try { if (window.localStorage.getItem(STORAGE_KEY) === 'tl') language = 'tl'; } catch { /* Storage may be blocked. The switch still works. */ }
  document.documentElement.lang = language;
  const originals = new WeakMap();
  let revision = 0;
  function text(key, english, values = {}) {
    const copy = language === 'tl' ? TAGALOG[key] || window.AlphastarLegalTranslations?.[key] || english : english;
    return String(copy).replace(/\{(\w+)\}/g, (match, name) => Object.hasOwn(values, name) ? String(values[name]) : match);
  }
  function translate(element, attribute, key) {
    let saved = originals.get(element);
    if (!saved) { saved = new Map(); originals.set(element, saved); }
    if (!saved.has(attribute)) saved.set(attribute, attribute === 'text' ? element.textContent : element.getAttribute(attribute));
    const next = text(key, saved.get(attribute));
    if (attribute === 'text') { if (element.textContent !== next) element.textContent = next; }
    else if (element.getAttribute(attribute) !== next) element.setAttribute(attribute, next);
  }
  function apply(root = document) {
    for (const attribute of ['text', 'aria-label', 'title', 'alt', 'content']) {
      const binding = attribute === 'text' ? 'data-i18n' : `data-i18n-${attribute}`;
      const elements = [...root.querySelectorAll(`[${binding}]`)];
      if (root.matches?.(`[${binding}]`)) elements.unshift(root);
      // The chatbot owns its own language, including future chat bindings.
      for (const element of elements) if (!element.closest('#fab-container')) translate(element, attribute, element.getAttribute(binding));
    }
  }
  function syncToggle() {
    const toggle = document.getElementById('site-language-toggle');
    if (!toggle) return;
    toggle.hidden = false;
    const label = toggle.querySelector('.site-language-label') || toggle;
    label.textContent = language === 'tl' ? 'English' : 'Tagalog';
    toggle.setAttribute('aria-label', language === 'tl' ? 'Gawing English ang website' : 'Switch website to Tagalog');
    toggle.title = toggle.getAttribute('aria-label');
  }
  function setLanguage(next) {
    if (!['en', 'tl'].includes(next)) return;
    const currentRevision = ++revision;
    const marker = (document.getElementById('navbar')?.getBoundingClientRect().bottom || 0) + 24;
    const anchor = window.scrollY > 0 ? [...document.querySelectorAll('main section[id]')].find(section => {
      const rect = section.getBoundingClientRect();
      return rect.top <= marker && rect.bottom > marker;
    }) : null;
    const anchorTop = anchor?.getBoundingClientRect().top;
    document.documentElement.classList.add('is-language-switching');
    language = next;
    try { window.localStorage.setItem(STORAGE_KEY, language); } catch { /* In-memory fallback. */ }
    document.documentElement.lang = language;
    apply();
    syncToggle();
    window.dispatchEvent(new CustomEvent('alphastar:languagechange', { detail: { language } }));
    // Preserve the current section, open FAQ, carousel and form state.
    window.requestAnimationFrame(() => {
      if (currentRevision !== revision) return;
      window.syncNavbarHeightVariable?.();
      if (anchor) window.scrollTo({ top: Math.max(0, window.scrollY + anchor.getBoundingClientRect().top - anchorTop), behavior: 'auto' });
      window.requestAnimationFrame(() => { if (currentRevision === revision) document.documentElement.classList.remove('is-language-switching'); });
    });
  }
  window.AlphastarSiteLanguage = Object.freeze({ text, apply, setLanguage, getLanguage: () => language });
  window.addEventListener('DOMContentLoaded', () => {
    const bindings = [
      ['title', 'text', 'site.title'], ['meta[name="description"]', 'content', 'site.description'],
      ['#clinic-info', 'aria-label', 'a11y.clinicInfo'], ['.topbar-phone', 'aria-label', 'a11y.messenger'],
      ['[data-offers]', 'aria-label', 'a11y.offers'], ['.why-cta-banner', 'aria-label', 'a11y.banner'],
      ['.contact-info-side', 'aria-label', 'a11y.mapContact'], ['.map-embed', 'title', 'a11y.map'],
      ['.map-directions-link', 'text', 'contact.directions'], ['.contact-info-cards', 'aria-label', 'a11y.contact'],
      ['.social-btn[aria-label*="Facebook"]', 'aria-label', 'a11y.facebook'],
      ['.social-btn[aria-label*="Instagram"]', 'aria-label', 'a11y.instagram'],
      ['.social-btn[aria-label*="Messenger"]', 'aria-label', 'a11y.socialMessenger'],
    ];
    document.querySelectorAll('[data-offer-slide]').forEach((slide, index) => {
      slide.setAttribute('data-i18n-aria-label', `a11y.offer${index + 1}`);
      slide.querySelector('img')?.setAttribute('data-i18n-alt', `a11y.poster${index + 1}`);
    });
    document.querySelectorAll('.why-cta-slide').forEach((slide, index) => slide.setAttribute('data-i18n-aria-label', `a11y.slide${index + 1}`));
    for (const [selector, attribute, key] of bindings) document.querySelectorAll(selector).forEach(element => {
      const binding = attribute === 'text' ? 'data-i18n' : `data-i18n-${attribute}`;
      // Legal pages have their own title and description, not the Home metadata.
      if (!element.hasAttribute(binding)) element.setAttribute(binding, key);
    });
    apply(); syncToggle();
    document.getElementById('site-language-toggle')?.addEventListener('click', () => setLanguage(language === 'tl' ? 'en' : 'tl'));
  });
})();
