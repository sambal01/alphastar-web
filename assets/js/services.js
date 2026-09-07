const SERVICES_DATA = [
  {
    id: 1,
    title: 'Complete Laboratory',
    desc: 'Laboratory testing services include CBC, urinalysis, blood chemistry, and other available tests.',
    category: 'Diagnostics',
    color: 'teal',
    tag: null,
    bestFor: 'Routine and doctor-requested laboratory testing.',
    prep: 'Preparation varies by test. Confirm fasting, water, and medication instructions with Kasiglahan staff.',
    turnaround: 'Release times vary by test. Ask staff for the expected release schedule.',
    icon: `<svg viewBox="0 0 48 48" width="32" height="32" fill="none" aria-hidden="true">
      <rect x="14" y="6" width="8" height="20" rx="4" fill="#0D847B" opacity=".2"/>
      <rect x="26" y="6" width="8" height="20" rx="4" fill="#0D847B" opacity=".2"/>
      <rect x="14" y="6" width="8" height="8" rx="4" fill="#0D847B"/>
      <rect x="26" y="6" width="8" height="8" rx="4" fill="#0D847B"/>
      <path d="M12 28l4 10h16l4-10H12z" fill="#0D847B" opacity=".8"/>
      <circle cx="24" cy="35" r="2" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 2,
    title: 'Digital X-Ray',
    desc: 'Digital X-ray services are offered for available imaging examinations.',
    category: 'Imaging',
    color: 'teal',
    tag: null,
    bestFor: 'Patients seeking an available X-ray examination for a medical or agency requirement.',
    prep: 'Confirm examination-specific instructions and required documents with Kasiglahan staff.',
    turnaround: 'Confirm image and report release times with staff.',
    icon: `<svg viewBox="0 0 48 48" width="32" height="32" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="32" height="32" rx="4" fill="#0D847B" opacity=".15"/>
      <rect x="8" y="8" width="32" height="32" rx="4" stroke="#0D847B" stroke-width="2"/>
      <path d="M20 18v12M28 18v12M16 22h16M16 26h16" stroke="#0D847B" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 3,
    title: 'Ultrasound',
    desc: 'Ultrasound services are offered for available imaging examinations.',
    category: 'Imaging',
    color: 'teal',
    tag: null,
    bestFor: 'Patients seeking an available ultrasound examination.',
    prep: 'Preparation depends on the examination. Confirm instructions with Kasiglahan staff before visiting.',
    turnaround: 'Examination availability and report release times must be confirmed with staff.',
    icon: `<svg viewBox="0 0 48 48" width="32" height="32" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="14" fill="#0D847B" opacity=".15"/>
      <circle cx="24" cy="24" r="14" stroke="#0D847B" stroke-width="2"/>
      <path d="M16 28 Q20 18 24 22 Q28 26 32 20" stroke="#0D847B" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="24" cy="24" r="3" fill="#0D847B"/>
    </svg>`
  },
  {
    id: 4,
    title: 'ECG',
    desc: 'ECG services are offered for heart rhythm recording.',
    category: 'Diagnostics',
    color: 'teal',
    tag: null,
    bestFor: 'Patients seeking an ECG for a medical or agency requirement.',
    prep: 'Confirm availability, preparation, and document requirements with Kasiglahan staff.',
    turnaround: 'Ask staff for the expected test and report schedule.',
    icon: `<svg viewBox="0 0 48 48" width="32" height="32" fill="none" aria-hidden="true">
      <rect x="6" y="16" width="36" height="16" rx="3" fill="#0D847B" opacity=".1"/>
      <path d="M6 24h8l3-8 5 16 3-10 3 6h14" stroke="#0D847B" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 5,
    title: 'Drug Testing',
    desc: 'Drug testing services are offered for employment, school, legal, and personal requirements.',
    category: 'Screening',
    color: 'teal',
    tag: null,
    bestFor: 'Patients with an employment, school, agency, legal, or personal testing requirement.',
    prep: 'Confirm accepted identification and request-document requirements with Kasiglahan staff.',
    turnaround: 'Processing and release times depend on the requested test. Confirm them with staff.',
    icon: `<svg viewBox="0 0 48 48" width="32" height="32" fill="none" aria-hidden="true">
      <rect x="17" y="6" width="14" height="4" rx="2" fill="#0D847B"/>
      <rect x="15" y="8" width="18" height="30" rx="4" fill="#0D847B" opacity=".15"/>
      <rect x="15" y="8" width="18" height="30" rx="4" stroke="#0D847B" stroke-width="2"/>
      <path d="M20 20h8M20 26h5" stroke="#0D847B" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 6,
    title: 'Pre-Employment Medical Exam',
    desc: 'Pre-employment medical services are available, with requirements based on the employer or agency request.',
    category: 'Screening',
    color: 'teal',
    tag: null,
    bestFor: 'Applicants completing employer or agency medical requirements.',
    prep: 'Confirm the required tests, identification, forms, and preparation with Kasiglahan staff.',
    turnaround: 'Package availability and release times must be confirmed with staff.',
    icon: `<svg viewBox="0 0 48 48" width="32" height="32" fill="none" aria-hidden="true">
      <rect x="10" y="8" width="28" height="34" rx="4" fill="#0D847B" opacity=".1"/>
      <rect x="10" y="8" width="28" height="34" rx="4" stroke="#0D847B" stroke-width="2"/>
      <path d="M18 6v4M30 6v4" stroke="#0D847B" stroke-width="2" stroke-linecap="round"/>
      <path d="M16 22h16M16 28h10" stroke="#0D847B" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 7,
    title: 'Executive Check-Up',
    desc: 'Executive check-up services are available for patients arranging scheduled health screening.',
    category: 'Check-Up',
    color: 'teal',
    tag: null,
    bestFor: 'Patients arranging an executive check-up with the clinic.',
    prep: 'Confirm the package contents, schedule, and any preparation with Kasiglahan staff.',
    turnaround: 'Package availability and release times must be confirmed with staff.',
    icon: `<svg viewBox="0 0 48 48" width="32" height="32" fill="none" aria-hidden="true">
      <circle cx="24" cy="18" r="8" fill="#0D847B" opacity=".15"/>
      <circle cx="24" cy="18" r="8" stroke="#0D847B" stroke-width="2"/>
      <path d="M10 38c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#0D847B" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 8,
    title: 'General Check-Up',
    desc: 'General medical check-ups are available through the clinic\'s doctor services.',
    category: 'Check-Up',
    color: 'teal',
    tag: null,
    bestFor: 'Patients seeking a routine consultation or doctor-requested assessment.',
    prep: 'Confirm the doctor\'s schedule and any document requirements with Kasiglahan staff.',
    turnaround: 'Doctor availability and consultation schedules must be confirmed with staff.',
    icon: `<svg viewBox="0 0 48 48" width="32" height="32" fill="none" aria-hidden="true">
      <path d="M24 8C15.163 8 8 15.163 8 24s7.163 16 16 16 16-7.163 16-16S32.837 8 24 8z" fill="#0D847B" opacity=".1"/>
      <path d="M24 8C15.163 8 8 15.163 8 24s7.163 16 16 16 16-7.163 16-16S32.837 8 24 8z" stroke="#0D847B" stroke-width="2"/>
      <path d="M24 16v8l4 4" stroke="#0D847B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 9,
    title: 'Medical Certificate',
    desc: 'Medical certificate requests may be considered after a clinician\'s assessment.',
    category: 'Documents',
    color: 'teal',
    tag: null,
    bestFor: 'Patients who have been advised to obtain medical documentation.',
    prep: 'Confirm service availability, assessment requirements, and required documents with Kasiglahan staff.',
    turnaround: 'Issuance is not guaranteed, and release times depend on the assessment and clinic requirements.',
    icon: `<svg viewBox="0 0 48 48" width="32" height="32" fill="none" aria-hidden="true">
      <rect x="8" y="10" width="28" height="34" rx="3" fill="#0D847B" opacity=".1"/>
      <rect x="8" y="10" width="28" height="34" rx="3" stroke="#0D847B" stroke-width="2"/>
      <path d="M14 20h16M14 26h16M14 32h10" stroke="#0D847B" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="35" cy="35" r="7" fill="#0D847B"/>
      <path d="M32 35l2 2 4-4" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 10,
    title: 'Home Service',
    desc: 'Home service is advertised by AlphaStar, subject to confirmation with the Kasiglahan branch.',
    category: 'Home Care',
    color: 'teal',
    tag: null,
    bestFor: 'Patients asking whether an eligible service can be provided at their location.',
    prep: 'Confirm the requested service, coverage area, fees, requirements, and schedule with Kasiglahan staff.',
    turnaround: 'Availability and timing depend on the requested service and clinic schedule.',
    icon: `<svg viewBox="0 0 48 48" width="32" height="32" fill="none" aria-hidden="true">
      <path d="M24 8L8 20v22h12v-10h8v10h12V20L24 8z" fill="#0D847B" opacity=".15"/>
      <path d="M24 8L8 20v22h12v-10h8v10h12V20L24 8z" stroke="#0D847B" stroke-width="2" stroke-linejoin="round"/>
      <path d="M20 26h8M24 22v8" stroke="#0D847B" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 11,
    title: 'Painless Tuli',
    desc: 'Painless circumcision service for patients seeking a comfortable, professionally supervised procedure.',
    category: 'Specialty Care',
    color: 'teal',
    tag: null,
    bestFor: 'Patients asking about the clinic\'s painless circumcision service.',
    prep: 'Confirm eligibility, preparation instructions, scheduling, and required documents with clinic staff.',
    turnaround: 'Procedure timing, aftercare, and follow-up schedules must be confirmed with staff.',
    icon: `<svg viewBox="0 0 48 48" width="32" height="32" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="15" fill="#0D847B" opacity=".12"/>
      <circle cx="24" cy="24" r="15" stroke="#0D847B" stroke-width="2"/>
      <path d="M17 25l5 5 10-11" stroke="#0D847B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 12,
    title: 'Student Pack',
    desc: 'Student health package for common school-related medical and laboratory requirements.',
    category: 'Packages',
    color: 'teal',
    tag: null,
    bestFor: 'Students completing school admission, enrollment, or activity requirements.',
    prep: 'Confirm package inclusions, school requirements, identification, and preparation instructions with staff.',
    turnaround: 'Package availability and result release times must be confirmed with staff.',
    icon: `<svg viewBox="0 0 48 48" width="32" height="32" fill="none" aria-hidden="true">
      <path d="M8 18L24 10l16 8-16 8L8 18z" fill="#0D847B" opacity=".15"/>
      <path d="M8 18L24 10l16 8-16 8L8 18z" stroke="#0D847B" stroke-width="2" stroke-linejoin="round"/>
      <path d="M14 22v9c5 5 15 5 20 0v-9M40 18v10" stroke="#0D847B" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  }
];

window.SERVICES_DATA = SERVICES_DATA;
function getStoredSelectedService() {
  try {
    return sessionStorage.getItem('alphastar_selected_service') || '';
  } catch (error) {
    return '';
  }
}

function setStoredSelectedService(serviceTitle) {
  try {
    sessionStorage.setItem('alphastar_selected_service', serviceTitle);
  } catch (error) {
  }
}

let selectedServiceTitle = getStoredSelectedService();

function highlightServiceSelection(serviceTitle) {
  selectedServiceTitle = serviceTitle || '';

  document.querySelectorAll('.service-card').forEach((card) => {
    card.classList.toggle('is-selected', card.dataset.serviceTitle === selectedServiceTitle);
  });
}

function requestServiceBooking(service) {
  setStoredSelectedService(service.title);
  highlightServiceSelection(service.title);

  if (typeof window.prefillBookingService === 'function') {
    window.prefillBookingService(service.title, {
      focusForm: true,
      source: 'services',
      message: `${service.title} selected. Fill out the form below to request this service.`
    });
    return;
  }

  if (typeof window.showSiteToast === 'function') {
    window.showSiteToast(service.title + ' selected. Please complete the booking form below.');
  }

  scrollToSection('#contact');
}

function createServiceCard(service) {
  const card = document.createElement('article');
  card.className = `service-card service-card-${service.color}`;
  card.dataset.serviceTitle = service.title;
  card.innerHTML = `
    <h3 class="service-title">${service.title}</h3>
    <p class="service-desc">${service.desc}</p>
  `;

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--pointer-x', `${x}%`);
      card.style.setProperty('--pointer-y', `${y}%`);
    });
  }

  return card;
}

function renderServices() {
  const grid = document.getElementById('services-grid');
  if (!grid) {
    return;
  }

  grid.innerHTML = '';

  SERVICES_DATA.forEach((service) => {
    grid.appendChild(createServiceCard(service));
  });
  highlightServiceSelection(selectedServiceTitle);
}

window.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('services-grid');

  if (!grid) {
    return;
  }

  renderServices();
});

window.highlightServiceSelection = highlightServiceSelection;
