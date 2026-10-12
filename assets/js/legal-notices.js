/* Legal reading UI only: no acceptance, account lookup, or form submission. */
(() => {
  'use strict';
  const contents = document.querySelector('.legal-contents');
  const wide = window.matchMedia('(min-width: 1000px)');
  const syncContents = () => { if (contents) contents.open = wide.matches; };
  syncContents();
  wide.addEventListener('change', syncContents);
  const year = document.getElementById('current-year');
  if (year) year.textContent = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Manila', year: 'numeric' }).format(new Date());
})();
