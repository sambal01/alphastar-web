const FAQ_DATA = [
  {
    q: 'What is the Alphastar mobile application?',
    a: 'Alphastar Mobile is our Android patient app for requesting home services and managing your patient information. You can update your profile, submit a Student Medical & Physical Examination (SMPE) form, view submitted forms and their review status, check Appointment Schedule and Appointment History, receive clinic notifications, and manage your PIN in Security Settings. It also provides clinic information and access to Agent Support. In-person clinic appointments are not booked through the app.'
  },
  {
    q: 'How do I start using Alphastar Mobile?',
    a: 'Sign in or create a patient account with email and password, or use Google sign-in. Complete the account verification and patient details requested by the app, then set up your private 6-digit PIN. Before requesting a home service, save your complete name, contact details, and home address in Profile > Profile details.'
  },
  {
    q: 'Do you offer home services?',
    a: 'Yes. Use Book Appointment in Alphastar Mobile to request an available home service. Save your complete address in Profile > Profile details, complete any requirements shown, choose one service and an available date and time, add any helpful notes, then review and submit. Clinic staff must confirm service availability, area coverage, the schedule, and fees; submitting a request does not confirm a booking. Check Appointment Schedule and notifications for updates. Not every clinic service is available at home.'
  },
  {
    q: 'Which medical forms can I complete in the app?',
    a: 'The Student Medical & Physical Examination (SMPE) form is currently available in Medical Records. Complete the required information, review your answers, and submit the form. Open Profile > Medical History to view your submitted SMPE records and their review status. A submitted form is not the same as a laboratory test result; ask clinic staff about test results and any examination requirements.'
  },
  {
    q: 'Will my information stay saved when I leave the app?',
    a: 'Successfully saved profile details and submitted forms remain linked to your patient account. Sign in to the same account to retrieve them after logout or reinstalling the app. Unfinished SMPE, booking, and profile forms are kept as temporary drafts on your phone when you switch apps or minimize Alphastar. These drafts are not submitted to the clinic and can be lost when you log out, uninstall, or clear app data. Always use Save or Submit to keep information in your account.'
  },
  {
    q: 'How do I change my PIN or password?',
    a: 'Open Profile > Security Settings. Change PIN asks for your current PIN, a new 6-digit PIN, and confirmation. Email-and-password accounts also have Change password: enter your current password, a new password and confirmation, then verify the code sent to your account email. Google sign-in accounts do not show Change password in Alphastar; manage your Google password through Google. Never share your PIN, password, or verification code.'
  },
  {
    q: 'Can I use the app with mobile data?',
    a: 'Yes. You can use mobile data or Wi-Fi. An internet connection is needed to sign in, submit home-service requests or forms, and refresh account information and clinic updates. If a screen cannot load, check your connection and retry. For help, use Agent Support in the app or message the clinic through Messenger.'
  },
  {
    q: 'What services do you offer?',
    a: 'Alphastar offers doctor consultations and check-ups, annual physical examinations (APE) and employment services, vaccinations, executive check-ups, laboratory testing, digital X-ray, ultrasound, ECG, drug testing, and company on-site services. Availability, provider schedules, and packages may vary. Message the clinic to confirm your requested service, price, and requirements. For home services, use the available options in the mobile app; the clinic service list does not mean every service is available at home.'
  },
  {
    q: 'Where is the Kasiglahan branch?',
    a: 'Visit Alphastar at Lot 3-A, Block 9, Phase 1B, Kasiglahan Village, San Jose, Rodriguez, Rizal, near McDonald\'s Kasiglahan. Use the map and Get Directions link in the Contact section to plan your visit.'
  },
  {
    q: 'What are the regular clinic hours?',
    a: 'The regular Kasiglahan clinic schedule is Monday through Sunday, 7:00 AM to 4:00 PM. Holiday hours and individual service or doctor schedules may differ. Check the Clinic Hours section and confirm with staff before your visit. Home-service schedules are subject to clinic confirmation.'
  },
  {
    q: 'Do you accept walk-ins?',
    a: 'Walk-ins are accepted for drug testing. Availability for consultations, imaging, vaccinations, packages, and specialized tests may vary, so message the Kasiglahan branch before visiting. The mobile app is for home-service requests, not for booking in-person or walk-in clinic visits.'
  },
  {
    q: 'How long does it take to get results?',
    a: 'Release times depend on the test, package, and processing requirements. Ask clinic staff when and how your results will be released after specimen collection or your examination. Medical History in Alphastar Mobile shows your submitted SMPE forms and review status; it does not confirm that a laboratory result is ready.'
  },
  {
    q: 'Do I need to fast or prepare before a test?',
    a: 'Preparation depends on your requested test. Ask your doctor or Alphastar staff about fasting, water, medication, identification, and other requirements before your visit or home service. Follow the instructions for your specific test; do not assume the same preparation applies to every test.'
  },
  {
    q: 'Do you accept PhilHealth, HMOs, or specific payment methods?',
    a: 'Please confirm current PhilHealth benefits, HMO eligibility, accepted payment methods, and any fees directly with the Kasiglahan branch before your visit or home service. Submitting an app request does not confirm coverage or payment. Staff can explain the requirements for your chosen service.'
  },
  {
    q: 'Is the Kasiglahan X-ray facility licensed?',
    a: 'For current X-ray facility licensing information, ask the Kasiglahan branch for its applicable DOH/FDA license details and validity dates. Licensing is specific to the facility and service; do not assume that an older notice confirms the current status of every clinic service.'
  },
  {
    q: 'How can I contact Alphastar?',
    a: 'Use the Official Messenger link on this website, visit the Alphastar Laboratory Facebook page, or email info@alphastarlabclinic.com. Mobile app users can also open Profile > Agent Support. For booking confirmation, service availability, fees, test preparation, or result release, contact clinic staff. Never send passwords, PINs, or verification codes in a message.'
  }
];

function setFaqItemState(item, isOpen) {
  const button = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  item.classList.toggle('faq-open', isOpen);
  button?.setAttribute('aria-expanded', String(isOpen));

  if (answer) {
    answer.setAttribute('aria-hidden', String(!isOpen));
    answer.style.maxHeight = isOpen ? `${answer.scrollHeight}px` : '0px';
  }
}

function toggleFaqItem(targetItem) {
  const accordion = document.getElementById('faq-accordion');
  if (!accordion) {
    return;
  }

  const willOpen = !targetItem.classList.contains('faq-open');
  accordion.querySelectorAll('.faq-item').forEach((item) => {
    setFaqItemState(item, willOpen && item === targetItem);
  });

  if (willOpen) {
    window.requestAnimationFrame(() => scrollFaqItemIntoView(targetItem, accordion));
    window.setTimeout(() => scrollFaqItemIntoView(targetItem, accordion), 380);
  }
}

function syncOpenFaqHeight() {
  document.querySelectorAll('.faq-item.faq-open .faq-answer').forEach((answer) => {
    answer.style.maxHeight = `${answer.scrollHeight}px`;
  });
}

function scrollFaqItemIntoView(item, accordion) {
  const padding = 12;
  const itemRect = item.getBoundingClientRect();
  const accordionRect = accordion.getBoundingClientRect();
  let nextScrollTop = accordion.scrollTop;

  if (itemRect.top < accordionRect.top + padding) {
    nextScrollTop -= accordionRect.top + padding - itemRect.top;
  } else if (itemRect.bottom > accordionRect.bottom - padding) {
    nextScrollTop += itemRect.bottom - (accordionRect.bottom - padding);
  } else {
    return;
  }

  accordion.scrollTo({
    top: Math.max(nextScrollTop, 0),
    behavior: 'smooth'
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const accordion = document.getElementById('faq-accordion');
  if (!accordion) {
    return;
  }

  accordion.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const question = target?.closest('.faq-question');
    if (!question || !accordion.contains(question)) {
      return;
    }

    const wrapper = question.closest('.faq-item');
    if (wrapper) {
      toggleFaqItem(wrapper);
    }
  });

  FAQ_DATA.forEach((item, index) => {
    const wrapper = document.createElement('article');
    const isOpen = false;
    const questionId = `faq-question-${index + 1}`;
    const answerId = `faq-answer-${index + 1}`;
    wrapper.className = 'faq-item' + (isOpen ? ' faq-open' : '');
    wrapper.innerHTML = `
      <button type="button" class="faq-question" id="${questionId}" aria-expanded="${isOpen}" aria-controls="${answerId}">
        <span class="faq-num">${index + 1}</span>
        <span class="faq-q-text" data-i18n="faq.${index + 1}.q">${item.q}</span>
        <span class="faq-chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </span>
      </button>
      <div class="faq-answer" id="${answerId}" role="region" aria-labelledby="${questionId}" aria-hidden="${!isOpen}">
        <p data-i18n="faq.${index + 1}.a">${item.a}</p>
      </div>
    `;

    accordion.appendChild(wrapper);
  });

  window.AlphastarSiteLanguage?.apply(accordion);
  window.addEventListener('alphastar:languagechange', syncOpenFaqHeight);
  window.addEventListener('resize', syncOpenFaqHeight, { passive: true });
});
