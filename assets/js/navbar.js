function closeMenu({ restoreFocus = false } = {}) {
  const menu = document.getElementById('mobile-menu');
  const button = document.getElementById('hamburger-btn');

  if (menu) {
    menu.inert = true;
    menu.classList.remove('open');
    window.setTimeout(() => {
      if (!menu.classList.contains('open')) {
        menu.hidden = true;
      }
    }, 360);
  }

  if (button) {
    button.classList.remove('active');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open menu');
    if (restoreFocus) {
      button.focus({ preventScroll: true });
    }
  }

  document.body.classList.remove('menu-open');
}

function setActiveNavLink(sectionId) {
  document.querySelectorAll('.nav-link, .mobile-link').forEach((link) => {
    const isActive = link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function getActiveSectionId(sections) {
  const scrollMarker = window.scrollY + getNavbarOffset() + 140;
  let currentId = sections[0]?.id || 'home';

  sections.forEach((section) => {
    if (section.offsetTop <= scrollMarker) {
      currentId = section.id;
    }
  });

  return currentId;
}

window.closeMenu = closeMenu;

window.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const button = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');
  const sections = Array.from(document.querySelectorAll('section[id]'));

  const syncNavbarState = () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 18);
    }

    if (sections.length) {
      setActiveNavLink(getActiveSectionId(sections));
    }
  };

  syncNavbarState();
  window.addEventListener('scroll', syncNavbarState, { passive: true });

  if (button && menu) {
    menu.inert = true;
    button.addEventListener('click', () => {
      const isOpen = !menu.classList.contains('open');
      if (!isOpen) {
        closeMenu();
        return;
      }
      window.closeFab?.();
      menu.hidden = false;
      menu.inert = false;
      menu.classList.add('open');
      button.classList.add('active');
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Close menu');
      document.body.classList.add('menu-open');
    });
  }

  const desktopNavigation = window.matchMedia('(min-width: 1100px)');
  desktopNavigation.addEventListener('change', (event) => {
    if (event.matches) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!menu?.classList.contains('open') || !button) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    } else if (event.key === 'Tab') {
      const controls = [button, ...menu.querySelectorAll('a[href], button:not([disabled])')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      const active = document.activeElement;
      if (!controls.includes(active) || (event.shiftKey && active === first)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = link.getAttribute('href');
      if (!target || target === '#') {
        return;
      }

      event.preventDefault();
      closeMenu();
      scrollToSection(target);
    });
  });

  const initialSection = window.location.hash ? window.location.hash.slice(1) : getActiveSectionId(sections);
  setActiveNavLink(initialSection || 'home');

  document.addEventListener('click', (event) => {
    if (!menu || !button || !menu.classList.contains('open')) {
      return;
    }

    if (!menu.contains(event.target) && !button.contains(event.target)) {
      closeMenu();
    }
  });
});
