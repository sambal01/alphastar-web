let fabExpanded = false;
let fabHideTimer;
let fabPromptHideTimer;

function hideFabPrompt() {
  window.clearTimeout(fabPromptHideTimer);
  document.getElementById('fab-prompt')?.classList.remove('is-visible');
}

function showFabPrompt() {
  const fab = document.getElementById('fab-container');
  const prompt = document.getElementById('fab-prompt');

  if (!fab || !prompt || fab.hidden || fabExpanded || document.hidden) {
    return;
  }

  prompt.classList.add('is-visible');
  prompt.textContent = 'Do you want to contact?';
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

  if (fabExpanded) {
    hideFabPrompt();
    menu.hidden = false;
    window.requestAnimationFrame(() => {
      fab.classList.add('is-open');
    });
  } else {
    fab.classList.remove('is-open');
    fabHideTimer = window.setTimeout(() => {
      if (!fabExpanded) {
        menu.hidden = true;
      }
    }, 360);
  }

  menu.setAttribute('aria-hidden', String(!fabExpanded));
  button.setAttribute('aria-expanded', String(fabExpanded));
  button.setAttribute(
    'aria-label',
    fabExpanded ? 'Close quick actions' : 'Open quick actions'
  );
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

window.addEventListener('DOMContentLoaded', () => {
  const fab = document.getElementById('fab-container');

  if (!fab) {
    return;
  }

  fab.hidden = false;
  syncFabState();
  window.setTimeout(showFabPrompt, 30000);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hideFabPrompt();
    }
  });

  document.addEventListener('click', (event) => {
    if (!fabExpanded || fab.contains(event.target)) {
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
});
