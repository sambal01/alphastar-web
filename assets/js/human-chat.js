(function () {
  'use strict';
  const identityUrl = 'https://alphastar-mobile.onrender.com/api/support/guest-identity';
  const embedUrl = 'https://embed.tawk.to/69c333b43508461c3360e229/1jkh83uep';
  let loading, rendered = false, busy = false, currentIdentity, widgetScript;
  function loadWidget() {
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      window.Tawk_API = window.Tawk_API || {};
      const api = window.Tawk_API;
      api.autoStart = false;
      api.onBeforeLoad = () => resolve(api);
      api.onLoad = () => { rendered = true; };
      const script = document.createElement('script');
      widgetScript = script;
      script.src = embedUrl; script.async = true; script.crossOrigin = 'anonymous';
      script.onerror = () => { loading = null; script.remove(); reject(Error('Unable to connect to staff chat. Please try again.')); };
      document.head.appendChild(script);
    });
    return loading;
  }
  async function open({ name, email, consent }) {
    if (busy) throw Error('Staff chat is already opening.');
    if (!consent || !String(name || '').trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())) throw Error('Enter your name and email and agree to share them for staff chat.');
    busy = true;
    let timeout, abort = new AbortController();
    const operation = async () => {
      const key = JSON.stringify([name.trim(), email.trim().toLowerCase()]);
      let identity = currentIdentity?.key === key ? currentIdentity.data : null;
      if (!identity) {
        const response = await fetch(identityUrl, { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'omit', signal:abort.signal, body:JSON.stringify({name, email, consent:true}) });
        const data = await response.json();
        if (!response.ok || !/^website_guest_[a-f0-9]{48}$/.test(data.userId || '') || !/^[a-f0-9]{64}$/.test(data.hash || '')) throw Error('Staff chat is unavailable. Please try again or use the clinic contact links.');
        identity = { userId:data.userId, hash:data.hash, name:data.name, email:data.email };
      }
      const api = await loadWidget();
      if (abort.signal.aborted) return;
      api.hideWidget?.();
      await new Promise((resolve, reject) => {
        api.login(identity, error => {
          if (abort.signal.aborted) return reject(Error('The staff chat connection timed out. Please retry.'));
          if (error) return reject(Error('Unable to verify your staff chat session. Please retry.'));
          currentIdentity = {key, data:identity};
          const show = () => {
            if (abort.signal.aborted) return;
            api.showWidget(); api.maximize(); window.closeFab?.(); resolve();
          };
          if (rendered) show();
          else { api.onLoad = () => { rendered = true; show(); }; api.start({showWidget:false}); }
        });
      });
    };
    try {
      await Promise.race([operation(), new Promise((_, reject) => { timeout = setTimeout(() => { abort.abort(); window.Tawk_API?.hideWidget?.(); reject(Error('The staff chat connection timed out. Please retry.')); }, 20000); })]);
    } catch (cause) {
      if (!rendered) { loading = null; widgetScript?.remove(); }
      throw cause;
    } finally { clearTimeout(timeout); busy = false; }
  }
  window.AlphastarHumanChat = Object.freeze({ open });
})();
