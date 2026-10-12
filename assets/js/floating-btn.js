let fabExpanded = false;
let fabHideTimer;
let fabIntroTimer;
let fabPromptHideTimer;
let fabTransitionRevision = 0;
const FAB_TRANSITION_MS = 280;
const FAB_INTRO_MS = 2000;

function setFabIntro(connecting) {
  const intro = document.getElementById('clinic-chat-intro');
  if (!intro) return; // Cached markup can still open without the intro.
  intro.hidden = !connecting;
  document.getElementById('fab-menu')?.classList.toggle('is-connecting', connecting);
  for (const id of ['clinic-chat-body', 'clinic-chat-status', 'clinic-chat-form']) {
    const element = document.getElementById(id);
    if (element) {
      element.hidden = connecting;
      element.inert = connecting;
    }
  }
}

function hideFabPrompt() {
  window.clearTimeout(fabPromptHideTimer);
  document.getElementById('fab-prompt')?.classList.remove('is-visible');
}

function fabText(english, tagalog) {
  return window.alphastarChat?.getLanguage?.() === 'tl' ? tagalog : english;
}

function syncFabLanguage() {
  const language = window.alphastarChat?.getLanguage?.() || 'en';
  const button = document.getElementById('fab-main');
  if (button) {
    button.setAttribute('lang', language);
    button.setAttribute('aria-label', fabExpanded ? fabText('Close Alphastar Assistant', 'Isara ang Alphastar Help Bot') : fabText('Open Alphastar Assistant', 'Buksan ang Alphastar Help Bot'));
  }
  const prompt = document.getElementById('fab-prompt');
  if (prompt) {
    prompt.setAttribute('lang', language);
    if (prompt.textContent) prompt.textContent = fabText('Do you need help?', 'Kailangan mo ba ng tulong?');
  }
}

function showFabPrompt() {
  const fab = document.getElementById('fab-container');
  const prompt = document.getElementById('fab-prompt');

  if (!fab || !prompt || fab.hidden || fabExpanded || document.hidden) {
    return;
  }

  prompt.classList.add('is-visible');
  prompt.textContent = fabText('Do you need help?', 'Kailangan mo ba ng tulong?');
  window.clearTimeout(fabPromptHideTimer);
  fabPromptHideTimer = window.setTimeout(hideFabPrompt, 5000);
}

function syncFabState() {
  const fab = document.getElementById('fab-container');
  const menu = document.getElementById('fab-menu');
  const button = document.getElementById('fab-main');

  if (!fab || !menu || !button) {
    return;
  }

  window.clearTimeout(fabHideTimer);
  window.clearTimeout(fabIntroTimer);
  fabIntroTimer = undefined;
  const revision = ++fabTransitionRevision;
  button.inert = fabExpanded;
  button.tabIndex = fabExpanded ? -1 : 0;

  if (fabExpanded) {
    hideFabPrompt();
    window.alphastarChat?.pauseTimestamps?.();
    setFabIntro(true);
    fab.classList.remove('is-closing');
    fab.style.removeProperty('--chat-closing-bottom');
    fab.style.removeProperty('--chat-closing-height');
    menu.hidden = false;
    menu.inert = false;
    // Paint the closed state first so display:none does not skip the opening.
    window.requestAnimationFrame(() => {
      if (!fabExpanded || revision !== fabTransitionRevision) return;
      window.requestAnimationFrame(() => {
        if (!fabExpanded || revision !== fabTransitionRevision) return;
        fab.classList.add('is-open');
        document.getElementById('clinic-chat-title')?.focus({ preventScroll: true });
        const finishIntro = () => {
          if (!fabExpanded || revision !== fabTransitionRevision) return;
          fabIntroTimer = undefined;
          setFabIntro(false);
          window.alphastarChat?.prepareOpen?.();
        };
        // An opening intro only; this does not connect to live clinic staff.
        if (document.getElementById('clinic-chat-intro')) {
          fabIntroTimer = window.setTimeout(finishIntro, FAB_INTRO_MS);
        } else {
          finishIntro();
        }
      });
    });
  } else {
    window.alphastarChat?.pauseTimestamps?.();
    const wasVisible = fab.classList.contains('is-open');
    const closingBottom = wasVisible ? window.getComputedStyle?.(fab)?.bottom : '';
    if (closingBottom) {
      fab.style.setProperty('--chat-closing-bottom', closingBottom);
      const closingHeight = window.getComputedStyle?.(menu)?.height;
      if (closingHeight) fab.style.setProperty('--chat-closing-height', closingHeight);
      fab.classList.add('is-closing');
    }
    fab.classList.remove('is-open');
    if (menu.contains(document.activeElement)) button.focus({ preventScroll: true });
    menu.inert = true;
    const finishClosing = () => {
      if (!fabExpanded && revision === fabTransitionRevision) {
        menu.hidden = true;
        setFabIntro(false);
        fab.classList.remove('is-closing');
        fab.style.removeProperty('--chat-closing-bottom');
        fab.style.removeProperty('--chat-closing-height');
      }
    };
    if (!wasVisible || window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
      finishClosing();
    } else {
      // Keep it rendered until the fade-out has completed, not display:none early.
      fabHideTimer = window.setTimeout(finishClosing, FAB_TRANSITION_MS);
    }
  }

  menu.setAttribute('aria-hidden', String(!fabExpanded));
  button.setAttribute('aria-expanded', String(fabExpanded));
  syncFabLanguage();
}

function toggleFab() {
  fabExpanded = !fabExpanded;
  syncFabState();
}

function closeFab() {
  if (!fabExpanded) {
    return;
  }

  fabExpanded = false;
  syncFabState();
}

window.toggleFab = toggleFab;
window.closeFab = closeFab;
window.syncFabLanguage = syncFabLanguage;

window.addEventListener('DOMContentLoaded', () => {
  const fab = document.getElementById('fab-container');

  if (!fab) {
    return;
  }

  fab.hidden = false;
  syncFabState();
  window.alphastarChat?.syncViewport();
  window.setTimeout(showFabPrompt, 30000);

  document.addEventListener('visibilitychange', () => {
    window.alphastarChat?.syncTimestamps?.();
    if (document.hidden) {
      hideFabPrompt();
    }
  });

  document.addEventListener('click', (event) => {
    // Quick replies can replace their own button before this event bubbles.
    // The original event path still identifies it as an inside-chat click.
    if (!fabExpanded || fab.contains(event.target) || event.composedPath?.().includes(fab) || event.target.closest?.('#site-language-toggle')) {
      return;
    }

    closeFab();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      hideFabPrompt();
      closeFab();
    }
  });

  // Keep the composer above the mobile keyboard without resizing the website.
  window.visualViewport?.addEventListener('resize', () => window.alphastarChat?.syncViewport());
  window.visualViewport?.addEventListener('scroll', () => window.alphastarChat?.syncViewport());
  window.addEventListener('resize', () => window.alphastarChat?.syncViewport(), { passive: true });
});
