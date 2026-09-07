window.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('why-us');
  const banner = section?.querySelector('.why-cta-banner');
  const hours = document.getElementById('hours');

  if (section && banner && hours) {
    // Reserve the overhanging half of the banner, including wrapped text.
    const syncBannerOverlap = () => {
      hours.style.setProperty('--why-cta-overlap', `${banner.getBoundingClientRect().height / 2}px`);
    };

    syncBannerOverlap();
    section.classList.add('has-boundary-cta');

    if ('ResizeObserver' in window) {
      new ResizeObserver(syncBannerOverlap).observe(banner);
    } else {
      window.addEventListener('resize', syncBannerOverlap);
      document.fonts?.ready.then(syncBannerOverlap);
    }
  }

  const slides = banner?.querySelectorAll('.why-cta-slide');
  const track = banner?.querySelector('.why-cta-track');
  if (!slides || slides.length < 2 || !track) return;

  let activeIndex = 0;
  let timer = null;
  let isHovering = false;
  let hasFocus = false;

  const showSlide = (index) => {
    activeIndex = index % slides.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
  };

  const stop = () => {
    window.clearInterval(timer);
    timer = null;
  };

  const start = () => {
    stop();
    if (isHovering || hasFocus || document.hidden) return;
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5000);
  };

  banner.addEventListener('mouseenter', () => {
    isHovering = true;
    stop();
  });
  banner.addEventListener('mouseleave', () => {
    isHovering = false;
    start();
  });
  banner.addEventListener('focusin', () => {
    if (!hasFocus) {
      hasFocus = true;
      stop();
    }
  });
  banner.addEventListener('focusout', (event) => {
    if (!banner.contains(event.relatedTarget)) {
      hasFocus = false;
      start();
    }
  });
  document.addEventListener('visibilitychange', start);

  showSlide(0);
  start();
});
