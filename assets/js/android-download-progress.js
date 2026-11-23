(() => {
  'use strict';

  const copy = {
    progress: 'APK download progress',
    downloading: 'Downloading the APK. Keep this page open.',
    complete: 'Download complete. Open the APK from Downloads to install it.',
    cancelled: 'Download canceled. Tap Download for Android to try again.',
    failed: 'Download could not finish. Try again or use the direct download.',
    cancel: 'Cancel',
    save: 'Save APK',
    direct: 'Download directly',
  };
  let active;

  function label(key) {
    return window.AlphastarSiteLanguage?.text('download.' + key, copy[key]) ?? copy[key];
  }

  function render(download) {
    const { panel, link, phase } = download;
    const downloading = phase === 'downloading';
    const complete = phase === 'complete';
    panel.hidden = false;
    link.setAttribute('aria-busy', String(downloading));
    panel.querySelector('[data-apk-meter]').hidden = !downloading && !complete;
    panel.querySelector('[data-apk-bar]').setAttribute('aria-label', label('progress'));
    panel.querySelector('[data-apk-status]').textContent = label(phase);
    const cancel = panel.querySelector('[data-apk-cancel]');
    cancel.hidden = !downloading;
    cancel.textContent = label('cancel');
    cancel.onclick = () => download.controller.abort();

    const save = panel.querySelector('[data-apk-save]');
    save.hidden = !complete;
    save.textContent = label('save');
    if (complete) {
      save.href = download.objectUrl;
      save.download = download.release.filename;
    } else {
      save.removeAttribute('href');
    }
    const direct = panel.querySelector('[data-apk-direct]');
    direct.hidden = downloading || complete;
    direct.textContent = label('direct');
    direct.href = download.directUrl;
  }

  function setProgress(panel, percent) {
    const bar = panel.querySelector('[data-apk-bar]');
    if (bar.value === percent) return;
    bar.value = percent;
    panel.querySelector('[data-apk-percent]').textContent = percent + '%';
  }

  async function fetchApk(download) {
    const { controller, panel, release, source } = download;
    try {
      const response = await fetch(source, { signal: controller.signal, credentials: 'omit' });
      if (response.status !== 200 || !response.body) throw new Error('APK unavailable');
      const reader = response.body.getReader();
      const chunks = [];
      let received = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          received += value.byteLength;
          if (received > release.bytes) throw new Error('APK size exceeded');
          chunks.push(value);
          setProgress(panel, Math.min(99, Math.floor(received / release.bytes * 100)));
        }
      } finally {
        reader.releaseLock();
      }
      if (received !== release.bytes) throw new Error('Incomplete APK');
      download.objectUrl = URL.createObjectURL(new Blob(chunks, { type: 'application/vnd.android.package-archive' }));
      setProgress(panel, 100);
      download.phase = 'complete';
    } catch {
      download.phase = controller.signal.aborted ? 'cancelled' : 'failed';
      controller.abort();
    }
    const cancelHadFocus = panel.querySelector('[data-apk-cancel]') === document.activeElement;
    render(download);
    if (cancelHadFocus) (download.phase === 'complete' ? panel.querySelector('[data-apk-save]') : download.link).focus();
    if (download.phase === 'complete') panel.querySelector('[data-apk-save]').click();
  }

  function start(event, link, directUrl) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (active?.phase === 'downloading') {
      event.preventDefault();
      return true;
    }
    const release = window.ALPHASTAR_WEBSITE_CONFIG?.androidApkRelease;
    const panel = link.closest('#app-download')?.querySelector('[data-apk-progress]');
    if (!panel || !release?.progressUrl || !Number.isSafeInteger(release.bytes) || release.bytes < 1 ||
        !/^Alphastar-[\d.]+-build\d+\.apk$/.test(release.filename) || !window.AbortController ||
        !window.ReadableStream || !URL.createObjectURL) return false;
    let source;
    try {
      if (new URL(release.url, document.baseURI).href !== directUrl) return false;
      source = new URL(release.progressUrl, document.baseURI);
      if (source.protocol !== 'https:' || source.username || source.password) return false;
    } catch {
      return false;
    }

    event.preventDefault();
    if (active?.phase === 'complete' && active.source.href === source.href) {
      active.panel.querySelector('[data-apk-save]').click();
      return true;
    }
    if (active?.objectUrl) URL.revokeObjectURL(active.objectUrl);
    active = { controller: new AbortController(), directUrl, link, panel, release, source, phase: 'downloading' };
    setProgress(panel, 0);
    render(active);
    void fetchApk(active);
    return true;
  }

  window.addEventListener('alphastar:languagechange', () => { if (active) render(active); });
  window.AlphastarAndroidDownload = { start };
})();
