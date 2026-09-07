import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js';
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where
} from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js';

const DEFAULT_SETTINGS = Object.freeze({
  closingTime: '18:00',
  closedDates: [],
  closedSlots: [],
  maxBookingsPerSlot: 5,
  openingTime: '07:00',
  slotMinutes: 60,
  sundayClosingTime: '18:00',
  timeZone: 'Asia/Manila'
});

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function toMinutes(value, fallback) {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return fallback;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return fallback;
  }

  return hour * 60 + minute;
}

function fromMinutes(value) {
  const hour = Math.floor(value / 60) % 24;
  const minute = value % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function formatTime(value) {
  const minutes = toMinutes(value, 0);
  const hour = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const displayHour = hour % 12 || 12;
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
}

function dateKeyInClinic(value = new Date(), timeZone = DEFAULT_SETTINGS.timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    timeZone,
    weekday: 'short',
    year: 'numeric'
  }).formatToParts(value);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const hour = Number(byType.hour === '24' ? '0' : byType.hour);

  return {
    date: `${byType.year}-${byType.month}-${byType.day}`,
    minutes: hour * 60 + Number(byType.minute || 0),
    weekday: byType.weekday || 'Mon'
  };
}

function todayInputValue() {
  return dateKeyInClinic().date;
}

function dayNameForDate(date) {
  const parsed = new Date(`${date}T00:00:00+08:00`);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: DEFAULT_SETTINGS.timeZone,
    weekday: 'short'
  }).format(parsed);
}

function cleanIdPart(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'clinic';
}

function slotIdFor(date, startTime, endTime, providerId = 'clinic_team') {
  return `${date}_${cleanIdPart(providerId)}_${startTime.replace(':', '')}_${endTime.replace(':', '')}`;
}

function toClinicIso(date, time) {
  return new Date(`${date}T${time}:00+08:00`).toISOString();
}

function normalizeSettings(raw = {}) {
  const maxBookingsPerSlot = Math.max(
    1,
    Math.min(
      50,
      Number(
        raw.maxBookingsPerSlot ??
          raw.appointmentCapacity ??
          raw.slotsPerHour ??
          raw.slots ??
          DEFAULT_SETTINGS.maxBookingsPerSlot
      ) || DEFAULT_SETTINGS.maxBookingsPerSlot
    )
  );
  const slotMinutes = Math.max(
    15,
    Math.min(240, Number(raw.slotMinutes ?? DEFAULT_SETTINGS.slotMinutes) || 60)
  );

  return {
    closingTime: hasText(raw.closingTime)
      ? raw.closingTime
      : hasText(raw.closing)
        ? raw.closing
        : DEFAULT_SETTINGS.closingTime,
    closedDates: Array.isArray(raw.closedDates)
      ? raw.closedDates.map(String)
      : Array.isArray(raw.unavailable)
        ? raw.unavailable.map(String)
        : DEFAULT_SETTINGS.closedDates,
    closedSlots: Array.isArray(raw.closedSlots)
      ? raw.closedSlots.map(String)
      : DEFAULT_SETTINGS.closedSlots,
    maxBookingsPerSlot,
    openingTime: hasText(raw.openingTime)
      ? raw.openingTime
      : hasText(raw.opening)
        ? raw.opening
        : DEFAULT_SETTINGS.openingTime,
    slotMinutes,
    sundayClosingTime: hasText(raw.sundayClosingTime)
      ? raw.sundayClosingTime
      : DEFAULT_SETTINGS.sundayClosingTime,
    timeZone: hasText(raw.timeZone) ? raw.timeZone : DEFAULT_SETTINGS.timeZone
  };
}

function appointmentIdsFromSlot(slotData = {}) {
  if (!Array.isArray(slotData.appointmentIds)) {
    return [];
  }

  return [...new Set(slotData.appointmentIds.map(String).filter(Boolean))];
}

function resolveSlotCount(slotData = {}) {
  return Math.max(
    Number(slotData.bookedCount ?? 0) || 0,
    appointmentIdsFromSlot(slotData).length
  );
}

function decorateSlot(slot, settings, slotData = {}) {
  const maxBookingsPerSlot = Math.max(
    1,
    Math.min(
      50,
      Number(slotData.maxBookingsPerSlot ?? settings.maxBookingsPerSlot) ||
        settings.maxBookingsPerSlot
    )
  );
  const bookedCount = Math.min(resolveSlotCount(slotData), maxBookingsPerSlot);
  const remaining = Math.max(maxBookingsPerSlot - bookedCount, 0);
  const now = dateKeyInClinic(new Date(), settings.timeZone);
  const closed =
    settings.closedDates.includes(slot.date) ||
    settings.closedSlots.includes(slot.id) ||
    slotData.active === false ||
    ['closed', 'unavailable', 'day_off'].includes(String(slotData.status || '').toLowerCase());
  const expired = slot.date === now.date && slot.endMinutes <= now.minutes;
  let status = 'available';
  let statusLabel = `${remaining} slots left`;

  if (closed) {
    status = 'closed';
    statusLabel = 'Closed';
  } else if (expired || slot.date < now.date) {
    status = 'expired';
    statusLabel = 'Expired';
  } else if (remaining <= 0) {
    status = 'full';
    statusLabel = 'FULL';
  } else if (remaining === 1) {
    status = 'few_slots_left';
    statusLabel = '1 slot left';
  }

  return {
    ...slot,
    bookedCount,
    maxBookingsPerSlot,
    remaining,
    selectable: status === 'available' || status === 'few_slots_left',
    status,
    statusLabel
  };
}

function buildSlots(date, settingsInput = DEFAULT_SETTINGS, slotDocs = new Map()) {
  const settings = normalizeSettings(settingsInput);
  const weekday = dayNameForDate(date);
  const openingMinutes = toMinutes(settings.openingTime, 7 * 60);
  const closingMinutes = toMinutes(
    weekday === 'Sun' ? settings.sundayClosingTime : settings.closingTime,
    18 * 60
  );

  if (closingMinutes <= openingMinutes) {
    return [];
  }

  const slots = [];
  for (
    let startMinutes = openingMinutes;
    startMinutes + settings.slotMinutes <= closingMinutes;
    startMinutes += settings.slotMinutes
  ) {
    const endMinutes = startMinutes + settings.slotMinutes;
    const startTime = fromMinutes(startMinutes);
    const endTime = fromMinutes(endMinutes);
    const id = slotIdFor(date, startTime, endTime);
    const baseSlot = {
      date,
      endMinutes,
      endTime,
      id,
      label: `${formatTime(startTime)} - ${formatTime(endTime)}`,
      startMinutes,
      startTime
    };

    slots.push(decorateSlot(baseSlot, settings, slotDocs.get(id) || {}));
  }

  return slots;
}

function getFirestoreDb() {
  const config = window.ALPHASTAR_WEBSITE_CONFIG?.firebase;
  if (!config?.apiKey || !config?.projectId || !config?.appId) {
    throw new Error('Firebase Firestore config is missing from site-config.js.');
  }

  const app = getApps().length ? getApp() : initializeApp(config);
  return getFirestore(app);
}

function subscribeToSlots(date, onSlots, onError) {
  const db = getFirestoreDb();
  let settings = DEFAULT_SETTINGS;
  let slotDocs = new Map();
  let disposed = false;

  const emit = () => {
    if (!disposed) {
      onSlots(buildSlots(date, settings, slotDocs));
    }
  };

  const settingsUnsubscribe = onSnapshot(
    doc(db, 'appointmentSettings', 'main'),
    (snapshot) => {
      settings = normalizeSettings(snapshot.exists() ? snapshot.data() : {});
      emit();
    },
    (error) => {
      onError?.(error);
      emit();
    }
  );

  const slotsUnsubscribe = onSnapshot(
    query(collection(db, 'appointmentSlots'), where('date', '==', date)),
    (snapshot) => {
      slotDocs = new Map(snapshot.docs.map((slotDoc) => [slotDoc.id, slotDoc.data()]));
      emit();
    },
    (error) => {
      onError?.(error);
      emit();
    }
  );

  emit();

  return () => {
    disposed = true;
    settingsUnsubscribe();
    slotsUnsubscribe();
  };
}

function cleanText(value, maxLength, fieldName, required = false) {
  const text = String(value || '').trim().replace(/\s+/g, ' ');
  if (required && !text) {
    throw new Error(`${fieldName} is required.`);
  }
  if (text.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or fewer.`);
  }
  return text;
}

async function createAppointment(input = {}) {
  const db = getFirestoreDb();
  const date = cleanText(input.date, 20, 'Appointment date', true);
  const startTime = cleanText(input.startTime || input.slot?.startTime, 10, 'Start time', true);
  const endTime = cleanText(input.endTime || input.slot?.endTime, 10, 'End time', true);
  const slotId = input.timeSlotId || input.slot?.id || slotIdFor(date, startTime, endTime);
  const requestId = cleanText(input.requestId, 120, 'Request ID', true).replace(/[^a-zA-Z0-9_-]/g, '_');
  const appointmentId = requestId.startsWith('web_') ? requestId : `web_${requestId}`;
  const fullName = cleanText(input.patientName || input.name, 120, 'Full name', true);
  const phone = cleanText(input.phone, 40, 'Phone number', true);
  const email = cleanText(input.email, 160, 'Email address');
  const serviceName = cleanText(input.serviceName || input.service, 160, 'Service', true);
  const notes = cleanText(input.notes || input.message, 2000, 'Notes');
  let savedAppointment = null;
  let wasDuplicate = false;

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please enter a valid email address.');
  }

  await runTransaction(db, async (transaction) => {
    const settingsRef = doc(db, 'appointmentSettings', 'main');
    const slotRef = doc(db, 'appointmentSlots', slotId);
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const settingsSnapshot = await transaction.get(settingsRef);
    const slotSnapshot = await transaction.get(slotRef);
    const appointmentSnapshot = await transaction.get(appointmentRef);

    if (appointmentSnapshot.exists()) {
      savedAppointment = { id: appointmentSnapshot.id, ...appointmentSnapshot.data() };
      wasDuplicate = true;
      return;
    }

    const settings = normalizeSettings(settingsSnapshot.exists() ? settingsSnapshot.data() : {});
    const slotDocs = new Map([[slotId, slotSnapshot.exists() ? slotSnapshot.data() : {}]]);
    const latestSlot = buildSlots(date, settings, slotDocs).find((slot) => slot.id === slotId);

    if (!latestSlot || !latestSlot.selectable) {
      throw new Error(
        latestSlot?.status === 'full'
          ? 'Sorry, this time slot is already full. Please select another available time.'
          : 'Please select another available appointment time.'
      );
    }

    const slotData = slotSnapshot.exists() ? slotSnapshot.data() : {};
    const appointmentIds = appointmentIdsFromSlot(slotData);
    const nextAppointmentIds = [...new Set([...appointmentIds, appointmentId])];
    const bookedCount = Math.max(resolveSlotCount(slotData), appointmentIds.length);

    if (!appointmentIds.includes(appointmentId) && bookedCount >= latestSlot.maxBookingsPerSlot) {
      throw new Error('Sorry, this time slot is already full. Please select another available time.');
    }

    const timestamp = serverTimestamp();
    const appointment = {
      appointmentDate: date,
      appointmentNumber: appointmentId.toUpperCase().slice(0, 18),
      appointmentStatus: 'pending',
      appointmentType: 'clinic_visit',
      bookingSource: 'website',
      booking_source: 'website',
      clientRequestId: requestId,
      contactEmail: email || null,
      contactPhone: phone,
      createdAt: timestamp,
      createdBy: 'public-website',
      endTime,
      guestEmail: email || null,
      guestName: fullName,
      guestPhone: phone,
      notes: notes || null,
      patientEmail: email || null,
      patientId: null,
      patientName: fullName,
      paymentStatus: 'unpaid',
      scheduledAt: toClinicIso(date, startTime),
      serviceName,
      source: 'website',
      startTime,
      status: 'pending',
      timeSlotId: slotId,
      updatedAt: timestamp,
      updatedBy: 'public-website',
      userId: null
    };

    transaction.set(appointmentRef, appointment);
    transaction.set(
      slotRef,
      {
        appointmentIds: nextAppointmentIds,
        bookedCount: Math.min(bookedCount + 1, latestSlot.maxBookingsPerSlot),
        createdAt: slotData.createdAt || timestamp,
        date,
        endTime,
        label: latestSlot.label,
        maxBookingsPerSlot: latestSlot.maxBookingsPerSlot,
        slotMinutes: settings.slotMinutes,
        startTime,
        status: 'available',
        updatedAt: timestamp
      },
      { merge: true }
    );

    savedAppointment = { id: appointmentId, ...appointment };
  });

  return {
    appointment: savedAppointment,
    duplicate: wasDuplicate,
    message: 'Appointment request submitted for clinic confirmation.'
  };
}

window.AlphaStarBooking = {
  buildSlots,
  createAppointment,
  formatTime,
  slotIdFor,
  subscribeToSlots,
  todayInputValue
};

window.dispatchEvent(new CustomEvent('alphastar-booking-ready'));
