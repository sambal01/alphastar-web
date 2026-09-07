const CLINIC_TIME_ZONE = 'Asia/Manila';
const CLINIC_OPEN_MINUTES = 7 * 60;
const CLINIC_WEEKDAY_CLOSE_MINUTES = 17 * 60;
const CLINIC_SUNDAY_CLOSE_MINUTES = 16 * 60;
const OFFER_INTERVAL_MS = 10000;

function formatClinicTime(totalMinutes) {
  const normalizedHour = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const displayHour = normalizedHour % 12 || 12;
  const period = normalizedHour >= 12 ? 'PM' : 'AM';
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

function getClinicSchedule(weekday) {
  const closeMinutes = weekday === 'Sunday'
    ? CLINIC_SUNDAY_CLOSE_MINUTES
    : CLINIC_WEEKDAY_CLOSE_MINUTES;

  return {
    openMinutes: CLINIC_OPEN_MINUTES,
    closeMinutes,
    openLabel: formatClinicTime(CLINIC_OPEN_MINUTES),
    closeLabel: formatClinicTime(closeMinutes),
    label: `${formatClinicTime(CLINIC_OPEN_MINUTES)} - ${formatClinicTime(closeMinutes)}`
  };
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getNavbarOffset() {
  const navbar = document.getElementById('navbar');
  if (!navbar) {
    return 0;
  }

  const topbar = navbar.querySelector('.navbar-topbar');
  const mainbar = navbar.querySelector('.navbar-main');
  const closedHeight = (topbar?.offsetHeight || 0) + (mainbar?.offsetHeight || 0);

  return Math.max((closedHeight || navbar.offsetHeight) - 4, 0);
}

function syncNavbarHeightVariable() {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const topbar = navbar.querySelector('.navbar-topbar');
    const mainbar = navbar.querySelector('.navbar-main');
    const closedHeight = (topbar?.offsetHeight || 0) + (mainbar?.offsetHeight || 0);
    document.documentElement.style.setProperty('--navbar-height', `${closedHeight || navbar.offsetHeight}px`);
  }
}

function scrollToSection(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    return;
  }

  const targetY = element.getBoundingClientRect().top + window.scrollY - getNavbarOffset();
  window.scrollTo({
    top: Math.max(targetY, 0),
    behavior: prefersReducedMotion() ? 'auto' : 'smooth'
  });
}

function scrollToBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) {
    scrollToSection('#contact');
    return;
  }

  syncNavbarHeightVariable();
  const navbarOffset = getNavbarOffset();
  form.scrollTop = 0;

  // Layout offsets exclude the temporary slide-in transform.
  let formTop = 0;
  for (let element = form; element; element = element.offsetParent) {
    formTop += element.offsetTop;
  }
  const targetY = formTop - navbarOffset - 18;
  window.scrollTo({
    top: Math.max(targetY, 0),
    behavior: prefersReducedMotion() ? 'auto' : 'smooth'
  });

  window.setTimeout(() => {
    document.getElementById('b-service')?.focus({ preventScroll: true });
  }, prefersReducedMotion() ? 0 : 450);
}

function showSiteToast(message) {
  let toast = document.querySelector('.site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'site-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  clearTimeout(showSiteToast.dismissTimer);
  showSiteToast.dismissTimer = window.setTimeout(() => {
    toast.remove();
  }, 3200);
}

function bindPlaceholderDownloads() {
  document.querySelectorAll('[data-coming-soon]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const label = link.getAttribute('data-coming-soon') || 'This download';
      showSiteToast(label + ' is coming soon. Please contact the clinic for updates.');
    });
  });
}

function getClinicDateParts() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: CLINIC_TIME_ZONE,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const rawParts = formatter.formatToParts(new Date());
  const parts = {};

  rawParts.forEach((part) => {
    if (part.type !== 'literal') {
      parts[part.type] = part.value;
    }
  });

  let hour = Number(parts.hour || '0');
  const dayPeriod = String(parts.dayPeriod || '').toUpperCase();

  if (dayPeriod === 'PM' && hour < 12) {
    hour += 12;
  }

  if (dayPeriod === 'AM' && hour === 12) {
    hour = 0;
  }

  return {
    weekday: parts.weekday || 'Monday',
    hour,
    minute: Number(parts.minute || '0')
  };
}

function renderClinicHours() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const list = document.getElementById('days-list');
  if (!list) {
    return;
  }

  const clinicNow = getClinicDateParts();
  const availability = getClinicAvailabilityState();
  const todayIndex = Math.max(0, days.indexOf(clinicNow.weekday));
  list.innerHTML = '';

  days.forEach((day, index) => {
    const row = document.createElement('div');
    const isToday = index === todayIndex;
    const schedule = getClinicSchedule(day);
    row.className = 'day-row' + (isToday ? ' day-today' : '');
    row.innerHTML = `
      <div class="day-name-wrap">
        <span class="day-name">${day}${isToday ? ' <span class="today-badge">Today</span>' : ''}</span>
      </div>
      <div class="day-hours${isToday ? ' today-hours' : ''}">
        <span>${schedule.label}</span>
      </div>
    `;
    list.appendChild(row);
  });
}

function isWithinClinicHours(minutes, schedule) {
  return minutes >= schedule.openMinutes && minutes < schedule.closeMinutes;
}

function getClinicAvailabilityState() {
  const clinicNow = getClinicDateParts();
  const minutes = clinicNow.hour * 60 + clinicNow.minute;
  const schedule = getClinicSchedule(clinicNow.weekday);
  const isOpen = isWithinClinicHours(minutes, schedule);

  return {
    isOpen,
    label: isOpen ? 'Currently Open' : 'Currently Closed',
    openLabel: schedule.openLabel,
    closeLabel: schedule.closeLabel,
    note: isOpen
      ? `Open now until ${schedule.closeLabel}. Walk-in availability varies by service.`
      : `Closed now. Regular hours begin at ${schedule.openLabel}.`
  };
}

function updateOpenState() {
  const availability = getClinicAvailabilityState();

  document.querySelectorAll('.open-state-label, .hours-open-state').forEach((node) => {
    node.textContent = availability.label;
  });

  document.querySelectorAll('.open-now-badge').forEach((badge) => {
    badge.classList.toggle('is-closed', !availability.isOpen);
  });

  document.querySelectorAll('.open-badge, .footer-open-status, .topbar-walkin').forEach((badge) => {
    badge.classList.toggle('is-closed', !availability.isOpen);
  });

  document
    .querySelectorAll('.open-badge .pulse-dot, .open-now-badge .pulse-dot, .footer-open-status .pulse-dot, .topbar-walkin .pulse-dot')
    .forEach((dot) => {
      dot.classList.toggle('green-pulse', availability.isOpen);
      dot.classList.toggle('status-dot-closed', !availability.isOpen);
    });

  document.querySelectorAll('.topbar-open-text').forEach((node) => {
    node.textContent = availability.label;
  });

  const footerText = document.querySelector('.footer-open-text');
  if (footerText) {
    footerText.textContent = availability.isOpen
      ? `Open Until ${availability.closeLabel}`
      : `Regular Hours Begin at ${availability.openLabel}`;
  }
}

function refreshClinicTimeUI() {
  renderClinicHours();
  updateOpenState();
}

function initOfferCarousel() {
  const root = document.querySelector('[data-offers]');
  if (!root) {
    return;
  }

  const track = root.querySelector('[data-offer-track]');
  const slides = Array.from(root.querySelectorAll('[data-offer-slide]'));
  const dots = Array.from(root.querySelectorAll('[data-offer-dot]'));
  const toggle = root.querySelector('[data-offer-toggle]');

  if (!track || !slides.length) {
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = 0;
  let timer = null;
  let userPaused = reducedMotion.matches;
  let isHovering = false;
  let hasFocus = false;
  let interactionPauseOverridden = false;

  const updateToggle = () => {
    if (!toggle) {
      return;
    }

    toggle.classList.toggle('is-paused', userPaused);
    toggle.setAttribute('aria-label', userPaused ? 'Play offer slideshow' : 'Pause offer slideshow');
  };

  const showOffer = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;

    slides.forEach((slide, index) => {
      if (index === activeIndex) {
        slide.removeAttribute('aria-hidden');
      } else {
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle('is-active', isActive);
      if (isActive) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  const start = (options = {}) => {
    stop();
    if (options.overrideInteractionPause) {
      interactionPauseOverridden = true;
    }

    const interactionPaused = (isHovering || hasFocus) && !interactionPauseOverridden;
    if (slides.length <= 1 || userPaused || interactionPaused || document.hidden) {
      return;
    }

    timer = window.setInterval(() => {
      showOffer(activeIndex + 1);
    }, OFFER_INTERVAL_MS);
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showOffer(Number(dot.dataset.offerDot || 0));
      start();
    });
  });

  toggle?.addEventListener('click', () => {
    userPaused = !userPaused;
    if (userPaused) {
      interactionPauseOverridden = false;
    }
    updateToggle();
    start({ overrideInteractionPause: !userPaused });
  });

  root.addEventListener('mouseenter', () => {
    isHovering = true;
    interactionPauseOverridden = false;
    stop();
  });

  root.addEventListener('mouseleave', () => {
    isHovering = false;
    start();
  });

  root.addEventListener('focusin', () => {
    if (!hasFocus) {
      hasFocus = true;
      interactionPauseOverridden = false;
      stop();
    }
  });

  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget)) {
      hasFocus = false;
      start();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  reducedMotion.addEventListener?.('change', (event) => {
    if (event.matches) {
      userPaused = true;
      updateToggle();
      stop();
    }
  });

  showOffer(0);
  updateToggle();
  start();
}

function initRevealObserver() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) {
    return;
  }

  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, { threshold: 0, rootMargin: '0px 0px -48px 0px' });

  items.forEach((item) => observer.observe(item));
}

window.scrollToSection = scrollToSection;
window.scrollToBookingForm = scrollToBookingForm;
window.showSiteToast = showSiteToast;
window.getClinicAvailabilityState = getClinicAvailabilityState;

window.addEventListener('DOMContentLoaded', () => {
  syncNavbarHeightVariable();
  bindPlaceholderDownloads();
  refreshClinicTimeUI();
  initOfferCarousel();
  initRevealObserver();

  window.setInterval(refreshClinicTimeUI, 60000);
  window.addEventListener('resize', syncNavbarHeightVariable, { passive: true });

  // Fonts and wrapped clinic hours can change the fixed header after page load.
  if ('ResizeObserver' in window) {
    const headerObserver = new ResizeObserver(syncNavbarHeightVariable);
    document.querySelectorAll('.navbar-topbar, .navbar-main').forEach((bar) => {
      headerObserver.observe(bar);
    });
  }

  const yearNode = document.getElementById('current-year');
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
});
