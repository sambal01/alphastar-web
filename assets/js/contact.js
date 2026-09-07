const SELECTED_SERVICE_KEY = 'alphastar_selected_service';

let activeSlotUnsubscribe = null;
let availableSlots = [];
let selectedSlot = null;
let bookingInitialized = false;
let bookingSubmitInProgress = false;

function createRequestId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionValue(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function setSessionValue(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
  }
}

function removeSessionValue(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
  }
}

function getBookingFields() {
  return {
    date: document.getElementById('b-date'),
    email: document.getElementById('b-email'),
    message: document.getElementById('b-message'),
    name: document.getElementById('b-name'),
    phone: document.getElementById('b-phone'),
    service: document.getElementById('b-service'),
    timeSlot: document.getElementById('b-time-slot')
  };
}

function getBookingService() {
  return window.AlphaStarBooking || null;
}

function getTodayValue() {
  if (typeof getBookingService()?.todayInputValue === 'function') {
    return getBookingService().todayInputValue();
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateDisplay(value) {
  if (!value) {
    return '';
  }

  return new Date(`${value}T00:00:00+08:00`).toLocaleDateString('en-PH', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
    year: 'numeric'
  });
}

function normalizePhoneValue(value) {
  return value
    .replace(/[^\d+\s()-]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showFieldError(id, message) {
  const errorNode = document.getElementById(id);
  const field = document.getElementById(id.replace('err-', 'b-'));

  if (errorNode) {
    errorNode.textContent = message;
    errorNode.style.display = 'block';
  }

  if (field) {
    field.classList.add('is-invalid');
  }
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach((node) => {
    node.textContent = '';
    node.style.display = 'none';
  });

  document.querySelectorAll('#booking-form input, #booking-form select, #booking-form textarea').forEach((field) => {
    field.classList.remove('is-invalid');
  });
}

function setFormFeedback(message = '', type = '') {
  const feedback = document.getElementById('form-feedback');
  if (!feedback) {
    return;
  }

  feedback.textContent = message;
  feedback.className = 'form-feedback';

  if (message) {
    feedback.classList.add(type === 'success' ? 'is-success' : 'is-error');
  }
}

function setSlotStatus(message, isError = false) {
  const status = document.getElementById('booking-slot-status');
  if (!status) {
    return;
  }

  status.textContent = message;
  status.classList.toggle('is-error', Boolean(isError));
}

function syncSelectedService(serviceTitle) {
  const normalizedTitle = serviceTitle || '';

  if (normalizedTitle) {
    setSessionValue(SELECTED_SERVICE_KEY, normalizedTitle);
  } else {
    removeSessionValue(SELECTED_SERVICE_KEY);
  }

  if (typeof window.highlightServiceSelection === 'function') {
    window.highlightServiceSelection(normalizedTitle);
  }
}

function updateBookingReview() {
  const review = document.getElementById('booking-review');
  const fields = getBookingFields();
  if (!review) {
    return;
  }

  const service = fields.service?.value || '';
  const date = fields.date?.value || '';

  if (!service || !date || !selectedSlot) {
    review.hidden = true;
    review.innerHTML = '';
    return;
  }

  review.hidden = false;
  review.innerHTML = [
    '<strong>Review Appointment</strong>',
    `<span>${escapeHtml(service)} on ${escapeHtml(formatDateDisplay(date))}</span>`,
    `<span>${escapeHtml(selectedSlot.label)} · ${escapeHtml(selectedSlot.statusLabel)}</span>`
  ].join('');
}

function selectSlot(slot) {
  if (!slot?.selectable) {
    return;
  }

  const fields = getBookingFields();
  selectedSlot = slot;

  if (fields.timeSlot) {
    fields.timeSlot.value = slot.label;
    fields.timeSlot.dataset.slotId = slot.id;
    fields.timeSlot.dataset.startTime = slot.startTime;
    fields.timeSlot.dataset.endTime = slot.endTime;
  }

  clearErrors();
  renderSlots(availableSlots);
  updateBookingReview();
}

function renderSlots(slots = []) {
  const container = document.getElementById('booking-slots');
  const fields = getBookingFields();
  if (!container) {
    return;
  }

  availableSlots = slots;
  container.innerHTML = '';

  if (!slots.length) {
    setSlotStatus('No appointment slots are available for this date.', true);
    selectedSlot = null;
    if (fields.timeSlot) {
      fields.timeSlot.value = '';
    }
    updateBookingReview();
    return;
  }

  const selectedStillValid = selectedSlot
    ? slots.find((slot) => slot.id === selectedSlot.id && slot.selectable)
    : null;

  if (selectedStillValid) {
    selectedSlot = selectedStillValid;
    if (fields.timeSlot) {
      fields.timeSlot.value = selectedStillValid.label;
      fields.timeSlot.dataset.slotId = selectedStillValid.id;
      fields.timeSlot.dataset.startTime = selectedStillValid.startTime;
      fields.timeSlot.dataset.endTime = selectedStillValid.endTime;
    }
  } else {
    selectedSlot = null;
    if (fields.timeSlot) {
      fields.timeSlot.value = '';
      delete fields.timeSlot.dataset.slotId;
      delete fields.timeSlot.dataset.startTime;
      delete fields.timeSlot.dataset.endTime;
    }
  }

  slots.forEach((slot) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'booking-slot-option';
    button.dataset.status = slot.status;
    button.disabled = !slot.selectable;
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', selectedSlot?.id === slot.id ? 'true' : 'false');

    if (selectedSlot?.id === slot.id) {
      button.classList.add('is-selected');
    }

    button.innerHTML = [
      `<span class="booking-slot-time">${escapeHtml(slot.label)}</span>`,
      `<span class="booking-slot-count">${escapeHtml(slot.statusLabel)}</span>`
    ].join('');

    if (slot.selectable) {
      button.addEventListener('click', () => selectSlot(slot));
    }

    container.appendChild(button);
  });

  const openSlots = slots.filter((slot) => slot.selectable).length;
  setSlotStatus(
    openSlots
      ? `${openSlots} available slot${openSlots === 1 ? '' : 's'} for ${formatDateDisplay(fields.date?.value || '')}.`
      : 'All slots for this date are full, expired, or closed.',
    openSlots === 0
  );
  updateBookingReview();
}

function subscribeToSelectedDate() {
  const fields = getBookingFields();
  const date = fields.date?.value;
  const booking = getBookingService();

  if (activeSlotUnsubscribe) {
    activeSlotUnsubscribe();
    activeSlotUnsubscribe = null;
  }

  selectedSlot = null;
  availableSlots = [];
  renderSlots([]);

  if (!date) {
    setSlotStatus('Select a date to load available slots.');
    return;
  }

  if (!booking?.subscribeToSlots) {
    setSlotStatus('Connecting to appointment availability...', false);
    return;
  }

  setSlotStatus('Loading available slots...');
  try {
    activeSlotUnsubscribe = booking.subscribeToSlots(
      date,
      (slots) => renderSlots(slots),
      (error) => {
        setSlotStatus(error?.message || 'Unable to load live appointment slots.', true);
      }
    );
  } catch (error) {
    setSlotStatus(
      error instanceof Error ? error.message : 'Unable to connect to appointment availability.',
      true
    );
  }
}

function validateForm() {
  const fields = getBookingFields();
  const errors = [];
  const today = getTodayValue();

  clearErrors();
  setFormFeedback();

  if (!fields.service?.value.trim()) {
    showFieldError('err-service', 'Please select a service.');
    errors.push(fields.service);
  }

  if (!fields.date?.value) {
    showFieldError('err-date', 'Preferred date is required.');
    errors.push(fields.date);
  } else if (fields.date.value < today) {
    showFieldError('err-date', 'Please choose today or a future date.');
    errors.push(fields.date);
  }

  if (!selectedSlot?.selectable) {
    showFieldError('err-time-slot', 'Please select an available appointment slot.');
    errors.push(fields.timeSlot);
  }

  if (!fields.name?.value.trim()) {
    showFieldError('err-name', 'Full name is required.');
    errors.push(fields.name);
  }

  const phoneValue = normalizePhoneValue(fields.phone?.value || '');
  if (!phoneValue) {
    showFieldError('err-phone', 'Phone number is required.');
    errors.push(fields.phone);
  } else if (!/^[+\d\s()-]{7,30}$/.test(phoneValue)) {
    showFieldError('err-phone', 'Please enter a valid phone number.');
    errors.push(fields.phone);
  } else if (fields.phone) {
    fields.phone.value = phoneValue;
  }

  if (fields.email?.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim())) {
    showFieldError('err-email', 'Please enter a valid email address.');
    errors.push(fields.email);
  }

  if (errors.length) {
    errors[0]?.focus();
    setFormFeedback('Please review the highlighted fields and try again.', 'error');
    return false;
  }

  return true;
}

function prefillBookingService(serviceTitle, options = {}) {
  const serviceField = document.getElementById('b-service');
  if (!serviceField) {
    return;
  }

  const matchingOption = Array.from(serviceField.options).find((option) => option.value === serviceTitle);
  serviceField.value = matchingOption ? serviceTitle : 'Other';
  syncSelectedService(serviceField.value === 'Other' ? '' : serviceField.value);
  updateBookingReview();

  if (options.message) {
    setFormFeedback(options.message, 'success');
  }

  if (options.focusForm) {
    scrollToSection('#contact');
    window.setTimeout(() => {
      serviceField.focus();
    }, 350);
  }
}

function resetForm() {
  const form = document.getElementById('booking-form');
  const fields = getBookingFields();
  if (!form) {
    return;
  }

  form.reset();
  selectedSlot = null;
  clearErrors();
  syncSelectedService('');

  if (fields.date) {
    fields.date.min = getTodayValue();
    fields.date.value = getTodayValue();
  }

  if (fields.timeSlot) {
    fields.timeSlot.value = '';
  }

  subscribeToSelectedDate();
  updateBookingReview();
}

function initializeBookingForm() {
  if (bookingInitialized) {
    subscribeToSelectedDate();
    return;
  }

  const form = document.getElementById('booking-form');
  const submitButton = document.getElementById('submit-btn');
  const fields = getBookingFields();
  const presetService = new URLSearchParams(window.location.search).get('service') || getSessionValue(SELECTED_SERVICE_KEY) || '';

  if (!form || !submitButton) {
    return;
  }

  bookingInitialized = true;
  submitButton.dataset.defaultLabel = submitButton.innerHTML;

  if (fields.date) {
    fields.date.min = getTodayValue();
    fields.date.value = fields.date.value || getTodayValue();
  }

  if (presetService) {
    prefillBookingService(presetService, { focusForm: false });
  }

  fields.service?.addEventListener('change', () => {
    syncSelectedService(fields.service?.value || '');
    updateBookingReview();
  });

  fields.date?.addEventListener('change', () => {
    subscribeToSelectedDate();
    updateBookingReview();
  });

  fields.phone?.addEventListener('blur', () => {
    fields.phone.value = normalizePhoneValue(fields.phone.value);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (bookingSubmitInProgress || !validateForm()) {
      return;
    }

    const booking = getBookingService();
    if (!booking?.createAppointment) {
      setFormFeedback('Appointment booking is still connecting to Firebase. Please try again in a moment.', 'error');
      return;
    }

    bookingSubmitInProgress = true;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span>Saving appointment...</span>';
    submitButton.setAttribute('aria-busy', 'true');

    try {
      const result = await booking.createAppointment({
        date: fields.date?.value || '',
        email: fields.email?.value.trim() || '',
        endTime: selectedSlot.endTime,
        message: fields.message?.value.trim() || '',
        patientName: fields.name?.value.trim() || '',
        phone: normalizePhoneValue(fields.phone?.value || ''),
        requestId: createRequestId(),
        serviceName: fields.service?.value || '',
        startTime: selectedSlot.startTime,
        timeSlotId: selectedSlot.id
      });
      const reference = result?.appointment?.appointmentNumber || result?.appointment?.id || '';
      const successMessage = reference
        ? `${result.message} Reference number: ${reference}.`
        : result.message;

      resetForm();
      setFormFeedback(successMessage, 'success');
    } catch (error) {
      setFormFeedback(
        error instanceof Error ? error.message : 'Unable to submit your appointment.',
        'error'
      );
    } finally {
      bookingSubmitInProgress = false;
      submitButton.disabled = false;
      submitButton.innerHTML = submitButton.dataset.defaultLabel || 'Confirm Booking';
      submitButton.removeAttribute('aria-busy');
    }
  });

  subscribeToSelectedDate();
}

window.prefillBookingService = prefillBookingService;
window.resetForm = resetForm;

window.addEventListener('alphastar-booking-ready', initializeBookingForm);
window.addEventListener('DOMContentLoaded', initializeBookingForm);
