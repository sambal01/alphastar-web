const FAQ_DATA = [
  {
    q: 'What services do you offer?',
    a: 'Published services include doctor consultations and check-ups, APE and employment services, vaccinations, executive check-ups, automated laboratory testing, digital X-ray, ultrasound, ECG, drug testing, and company on-site services. Provider schedules, packages, and availability can vary, so confirm your requested service first.'
  },
  {
    q: 'Where is the Kasiglahan branch?',
    a: 'The published address is Lot 3-A, Block 9, Phase 1B, Kasiglahan Village, San Jose, Rodriguez, Rizal, near McDonald\'s Kasiglahan.'
  },
  {
    q: 'What are the regular clinic hours?',
    a: 'The Kasiglahan branch lists Monday through Saturday from 7:00 AM to 5:00 PM and Sunday from 7:00 AM to 4:00 PM. Holiday schedules can change, so message the clinic before visiting on a holiday.'
  },
  {
    q: 'Do you accept walk-ins?',
    a: 'The official clinic site explicitly accepts walk-ins for drug testing. Walk-in availability for consultations, imaging, vaccines, packages, and specialized tests may vary, so message the Kasiglahan branch before visiting.'
  },
  {
    q: 'Do you offer home service?',
    a: 'Home service is advertised in clinic promotional material, but the eligible services, coverage area, fees, and schedule are not published. Message the Kasiglahan branch to confirm whether your request is available.'
  },
  {
    q: 'How long does it take to get results?',
    a: 'Release times depend on the test, package, and processing requirements. Ask staff for the expected release schedule when your specimen is collected or your examination is completed.'
  },
  {
    q: 'Do I need to fast or prepare before a test?',
    a: 'Preparation depends on the requested test. Follow instructions from your doctor or AlphaStar staff, and confirm whether fasting, water, medication, identification, or other requirements apply. Do not assume one preparation rule fits every test.'
  },
  {
    q: 'Do you accept PhilHealth, HMOs, or specific payment methods?',
    a: 'The public clinic information reviewed does not confirm current PhilHealth benefits, HMO eligibility, or payment methods for this branch. Please ask the clinic directly before your visit.'
  },
  {
    q: 'Is the Kasiglahan X-ray facility licensed?',
    a: 'AlphaStar\'s July 2025 clinic notice states that the Kasiglahan Level One X-ray facility has a DOH/FDA license valid through December 17, 2026 and is inspected annually. Confirm the current license status if you are relying on this information after that date.'
  },
  {
    q: 'Which contact details are verified?',
    a: 'The verified public channels are the AlphaStar Laboratory Facebook page, Messenger account, and info@alphastarlabclinic.com. No authoritative Kasiglahan phone number was found, so this website does not publish an unverified number.'
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
        <span class="faq-q-text">${item.q}</span>
        <span class="faq-chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </span>
      </button>
      <div class="faq-answer" id="${answerId}" role="region" aria-labelledby="${questionId}" aria-hidden="${!isOpen}">
        <p>${item.a}</p>
      </div>
    `;

    accordion.appendChild(wrapper);
  });

  window.addEventListener('resize', syncOpenFaqHeight, { passive: true });
});
