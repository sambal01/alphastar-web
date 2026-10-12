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
    button.setAttribute('aria-label', window.AlphastarSiteLanguage?.text('menu.open', 'Open menu') || 'Open menu');
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
  const topbar = navbar?.querySelector('.navbar-topbar');
  const button = document.getElementById('hamburger-btn');
  const menu = document.getElementById('mobile-menu');
  const sections = Array.from(document.querySelectorAll('section[id]'));
  let topbarHidden = null;

  if (navbar && topbar) {
    navbar.classList.add('has-scroll-topbar');
  }

  const syncNavbarState = () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 18);
    }

    if (navbar && topbar) {
      // Separate hide/show thresholds prevent flickering near the top of Home.
      const shouldHideTopbar = window.scrollY > (topbarHidden ? 12 : 48);
      if (shouldHideTopbar !== topbarHidden) {
        if (shouldHideTopbar && topbar.contains(document.activeElement)) {
          navbar.querySelector('.navbar-logo')?.focus({ preventScroll: true });
        }
        topbarHidden = shouldHideTopbar;
        navbar.classList.toggle('topbar-hidden', topbarHidden);
        topbar.inert = topbarHidden;
        if (topbarHidden) {
          topbar.setAttribute('aria-hidden', 'true');
        } else {
          topbar.removeAttribute('aria-hidden');
        }
        syncNavbarHeightVariable();
      }
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
      button.setAttribute('aria-label', window.AlphastarSiteLanguage?.text('menu.close', 'Close menu') || 'Close menu');
      document.body.classList.add('menu-open');
    });
  }

  const desktopNavigation = window.matchMedia('(min-width: 1100px)');
  const syncMenuLabel = () => {
    const isOpen = menu?.classList.contains('open');
    button?.setAttribute('aria-label', window.AlphastarSiteLanguage?.text(isOpen ? 'menu.close' : 'menu.open', isOpen ? 'Close menu' : 'Open menu') || (isOpen ? 'Close menu' : 'Open menu'));
  };
  syncMenuLabel();
  window.addEventListener('alphastar:languagechange', syncMenuLabel);
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
      const controls = [document.getElementById('site-language-toggle'), button, ...menu.querySelectorAll('a[href], button:not([disabled])')].filter(Boolean);
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

    if (!menu.contains(event.target) && !button.contains(event.target) && !event.target.closest?.('#site-language-toggle')) {
      closeMenu();
    }
  });
});
