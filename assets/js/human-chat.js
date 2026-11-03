(function () {
  "use strict";
  const base = "https://alphastar-mobile.onrender.com/api/support/chats";
  let session = null, conversation = null, view, log, status, controls, endButton, typingIndicator, hidden = [];
  let timer, heartbeatTimer, epoch = 0, reading = false, busy = false, pending = null, rows = [], before = "";
  let presentationTimer, typingClient = "", typingSequence = 0, typingOn = false, lastTyping = 0;
  let feedback = false, rating = "", rated = false, controlMode = "", leavePrompt = false, draft = "";
  let opening = false, requestLoading = false;
  let operationError = "", mutation = 0;
  const transitionDelay = () => new Promise(resolve => setTimeout(resolve, 1000));
  const systemLabel = "Alphastar Support (System Message)";
  const localized = (english, tagalog) => window.alphastarChat?.getLanguage() === "tl" ? tagalog : english;
  const merge = next => { rows = [...new Map([...rows, ...next].map(row => [row.id, row])).values()].sort((a, b) => a.time.localeCompare(b.time) || a.id.localeCompare(b.id)); };
  const firstName = value => ["Alphastar Staff", "Support assistant"].includes(value) ? value : String(value || "Support assistant").trim().split(/\s+/u)[0];
  const initials = value => String(value || "?").trim().split(/\s+/u).filter(Boolean).map((part, index, all) => index === 0 || index === all.length - 1 ? Array.from(part)[0] : "").join("").toLocaleUpperCase().slice(0, 4);
  const absolute = value => Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString("en-PH", { timeZone: "Asia/Manila", year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";
  const relative = value => { const minutes = Math.floor(Math.max(0, Date.now() - Date.parse(value)) / 60000); if (!Number.isFinite(minutes)) return ""; const [count, unit] = minutes >= 1440 ? [Math.floor(minutes / 1440), "day"] : minutes >= 60 ? [Math.floor(minutes / 60), "hour"] : [minutes, "minute"]; return count ? `${count} ${unit}${count === 1 ? "" : "s"} ago` : "Just now"; };
  function reportTyping(isTyping) {
    if (!session || !["waiting", "connected"].includes(conversation?.status)) return;
    if (isTyping && typingOn && Date.now() - lastTyping < 2000 || !isTyping && !typingOn) return;
    typingOn = isTyping; lastTyping = Date.now(); typingClient ||= crypto.randomUUID();
    void request("/" + session.id + "/typing", { cycle: conversation.cycle, isTyping, clientId: typingClient, sequence: ++typingSequence }).catch(() => {});
  }
  function stopTyping() { reportTyping(false); }
  function refreshTyping() {
    const panel = document.querySelector("#fab-menu"), input = controls?.querySelector("form textarea");
    reportTyping(Boolean(view && !view.hidden && !document.hidden && panel && !panel.hidden && !panel.inert && !busy && !feedback && !leavePrompt && input?.value.trim()));
  }
  function changedDraft(value) { draft = value; reportTyping(Boolean(!document.hidden && !busy && value.trim())); }
  function updatePresentation() {
    if (!view || view.hidden || !conversation) return;
    for (const stamp of log.querySelectorAll("time[data-sent]")) { const label = relative(stamp.dataset.sent); if (stamp.textContent !== label) stamp.textContent = label; }
    const visible = !feedback && !leavePrompt && (requestLoading || ["waiting", "connected"].includes(conversation.status) && conversation.typing?.staff?.expiresAt > Date.now());
    const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 80;
    typingIndicator.hidden = !visible;
    const label = visible ? (requestLoading ? "Alphastar Support" : firstName(conversation.connectedName)) + " is typing…" : "";
    const caption = typingIndicator.querySelector("[data-typing-label]");
    if (caption.textContent !== label) caption.textContent = label;
    const picture = typingIndicator.querySelector(".native-chat-avatar"), key = requestLoading ? "system" : `${conversation.connectedAvatar}:${conversation.connectedInitials}`;
    if (picture.dataset.key !== key) {
      picture.replaceChildren();
      if (requestLoading) picture.textContent = "S";
      else if (conversation.connectedAvatar !== "initials") { const logo = node("img"); logo.src = "assets/images/alphastarlogo.png"; logo.alt = ""; picture.append(logo); }
      else picture.textContent = conversation.connectedInitials || initials(conversation.connectedName);
      picture.dataset.key = key;
    }
    if (visible && atBottom && !log.hidden) log.scrollTop = log.scrollHeight;
  }
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function button(text, action, className = "clinic-chat-topic") {
    const element = node("button", className, text); element.type = "button";
    element.addEventListener("click", action); return element;
  }
  async function request(path, body, credentials = session) {
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(base + path, { method: body === undefined ? "GET" : "POST",
        headers: { "Content-Type": "application/json", ...(credentials ? { "X-Alphastar-Chat-Token": credentials.token } : {}) },
        credentials: "omit", signal: controller.signal, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "Unable to connect. Please retry.");
      return data;
    } finally { clearTimeout(timeout); }
  }
  function exit(identity, cycle) {
    if (!identity || !cycle) return;
    const url = base + "/" + identity.id + "/exit", body = JSON.stringify({ token: identity.token, cycle });
    try { if (navigator.sendBeacon?.(url, new Blob([body], { type: "text/plain;charset=UTF-8" }))) return; } catch {}
    void fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body, keepalive: true, credentials: "omit" }).catch(() => {});
  }
  function close() {
    stopTyping();
    exit(session, conversation?.cycle);
    epoch++; clearInterval(timer); clearInterval(heartbeatTimer); clearInterval(presentationTimer); timer = heartbeatTimer = presentationTimer = null;
    typingClient = ""; typingSequence = 0; typingOn = false; lastTyping = 0;
    session = conversation = null; rows = []; before = ""; pending = null; busy = reading = false;
    opening = requestLoading = false;
    operationError = "";
    view?.remove(); view = log = controls = status = typingIndicator = null;
    for (const [element, display] of hidden) element.style.display = display;
    hidden = [];
    // Old guest capabilities must not recover a prior visit after refresh.
    try { sessionStorage.removeItem("alphastar-staff-chat-v1"); } catch {}
  }
  function back() {
    if (busy) return;
    stopTyping();
    if (["waiting", "connected"].includes(conversation?.status)) { feedback = false; leavePrompt = true; paint(); controls.querySelector("button")?.focus(); return; }
    returnToBot();
  }
  function openFeedback() {
    if (busy) return;
    stopTyping(); leavePrompt = false; feedback = true; rating = ""; paint(); controls.querySelector("button")?.focus();
  }
  function continueConversation() {
    leavePrompt = feedback = false; paint(); refreshTyping(); controls.querySelector("textarea")?.focus();
  }
  function returnToBot(finished = false) {
    stopTyping();
    if (!view) return;
    view.hidden = true; view.inert = true; view.dataset.backHidden = "true";
    for (const [element, display] of hidden) element.style.display = display;
    hidden = [];
    const submit = document.querySelector('.clinic-chat-support button[type="submit"]');
    if (submit) submit.textContent = conversation?.status === "ended" ? localized("Open staff chat", "Buksan ang staff chat") : localized("Continue conversation", "Ituloy ang usapan");
    if (finished) window.alphastarChat?.showMainMenu();
  }
  function minimize() { stopTyping(); }
  function hasSession() { return Boolean(view && (opening || session && conversation?.status !== "ended")); }
  function resume() {
    if (!hasSession()) return false;
    for (const id of ["clinic-chat-body", "clinic-chat-form", "clinic-chat-status"]) { const element = document.getElementById(id); if (element && !hidden.some(([saved]) => saved === element)) { hidden.push([element, element.style.display]); element.style.display = "none"; } }
    delete view.dataset.backHidden; view.hidden = false; view.inert = false; paint(); void read();
    refreshTyping();
    controls.querySelector("textarea, button")?.focus({ preventScroll: true }); return true;
  }
  function renderMessages() {
    const bottom = log.scrollHeight - log.scrollTop - log.clientHeight < 80, top = log.scrollTop, height = log.scrollHeight;
    const existing = new Map([...log.children].filter(element => element.dataset.message).map(element => [element.dataset.message, element]));
    log.querySelector("[data-earlier]")?.remove();
    if (before) {
      const earlier = button("Earlier messages", () => void read(before)); earlier.dataset.earlier = "true"; log.prepend(earlier);
    }
    for (const row of rows) {
      if (existing.has(row.id)) continue;
      const bubble = node("div", "native-chat-message" + (row.sender === "visitor" ? " is-mine" : ""));
      bubble.dataset.message = row.id;
      const name = row.sender === "system" ? systemLabel : firstName(row.sender === "staff" ? row.name : row.name || conversation.visitorName || session.name);
      {
        const profile = node("span", "native-chat-avatar"); profile.setAttribute("aria-hidden", "true");
        if (row.sender === "system") profile.textContent = "S";
        else if (row.sender === "staff" && (row.avatar === "clinic" || !row.avatar && ["Alphastar Staff", "Support assistant"].includes(row.name || "Support assistant"))) { const logo = node("img"); logo.src = "assets/images/alphastarlogo.png"; logo.alt = ""; profile.append(logo); }
        else profile.textContent = row.sender === "visitor" ? "Me" : row.initials || initials(row.name);
        bubble.append(profile);
      }
      const content = node("div", "native-chat-message-body"), timestamp = node("time", "", relative(row.time));
      timestamp.dataset.sent = row.time; timestamp.dateTime = row.time; timestamp.title = absolute(row.time); timestamp.setAttribute("aria-label", absolute(row.time));
      const surface = node("div", "native-chat-message-bubble"); surface.append(node("p", "", row.text), timestamp);
      content.append(node("strong", "", name), surface); bubble.append(content);
      const next = [...log.children].find(element => element.dataset.message && rows.findIndex(item => item.id === element.dataset.message) > rows.indexOf(row));
      log.insertBefore(bubble, next || typingIndicator);
    }
    log.scrollTop = bottom ? log.scrollHeight : before && log.scrollHeight > height ? top + log.scrollHeight - height : top;
  }
  function paint() {
    if (!view || view.hidden || !conversation || opening) return;
    view.querySelector(".native-chat-loading")?.remove();
    log.hidden = feedback; renderMessages(); updatePresentation();
    endButton.hidden = conversation.status === "welcome" || rated || feedback || leavePrompt;
    endButton.disabled = busy;
    const mode = leavePrompt ? "leave" : feedback ? "feedback" : ["waiting", "connected"].includes(conversation.status) ? "compose" : conversation.status;
    if (mode === controlMode) {
      for (const element of controls.querySelectorAll("button")) {
        if (element.dataset.send) element.disabled = busy || !controls.querySelector("textarea").value.trim();
        else element.disabled = busy;
      }
      return;
    }
    controlMode = mode; controls.replaceChildren();
    if (leavePrompt) {
      controls.className = "native-chat-actions";
      controls.append(node("strong", "", localized("Continue this conversation?", "Itutuloy ang usapan?")));
      const actions = node("div", "native-chat-feedback-actions");
      actions.append(button(localized("Continue conversation", "Ituloy ang usapan"), continueConversation, "native-chat-back"), button(localized("End conversation", "Tapusin ang usapan"), openFeedback));
      controls.append(actions);
    } else if (feedback) {
      controls.className = "native-chat-feedback";
      const prompt = node("div", "native-chat-message"), avatar = node("span", "native-chat-avatar", "S"), content = node("div", "native-chat-message-body");
      avatar.setAttribute("aria-hidden", "true");
      const surface = node("div", "native-chat-message-bubble"); surface.append(node("p", "", localized("Was our staff helpful?", "Nakatulong ba ang aming staff?")));
      content.append(node("strong", "", "Alphastar Help Bot"), surface); prompt.append(avatar, content); controls.append(prompt);
      const choices = node("div", "native-chat-rating");
      for (const [value, label] of [["up", "👍"], ["down", "👎"]]) {
        const choice = button("", () => {
          rating = value;
          for (const option of choices.children) option.setAttribute("aria-pressed", String(option === choice));
          void action("end", { rating: value, comment: "" });
        });
        const caption = value === "up" ? localized("Like", "Nakatulong") : localized("Dislike", "Hindi nakatulong"), icon = node("span", "native-chat-rating-icon", label); icon.setAttribute("aria-hidden", "true");
        choice.append(icon, node("span", "", caption));
        choice.setAttribute("aria-label", caption); choice.setAttribute("aria-pressed", String(rating === value)); choice.disabled = busy; choices.append(choice);
      }
      controls.append(choices);
    } else if (mode === "welcome") {
      controls.className = "native-chat-actions";
      controls.append(button(localized("Yes, connect me to support", "Oo, ikonekta ako sa support"), () => void action("request")));
    } else if (mode === "ended") {
      controls.className = "native-chat-actions";
      controls.append(node("p", "", "Conversation ended"), button("Back", back, "native-chat-back"));
    } else {
      controls.className = "native-chat-composer";
      const form = node("form"), input = node("textarea"), send = node("button", "", "Send");
      input.maxLength = 2000; input.rows = 1; input.placeholder = "Type your message…"; input.setAttribute("aria-label", "Message for clinic staff");
      input.value = draft;
      send.type = "submit"; send.dataset.send = "true"; send.disabled = busy || !draft.trim();
      input.addEventListener("input", () => { send.disabled = busy || !input.value.trim(); changedDraft(input.value); });
      input.addEventListener("keydown", event => { if (event.key === "Enter" && !event.shiftKey && !event.isComposing) { event.preventDefault(); form.requestSubmit(); } });
      form.addEventListener("submit", event => { event.preventDefault(); void sendMessage(input); });
      form.append(input, send); controls.append(form);
    }
  }
  function accept(data, older = false) {
    conversation = data.conversation; merge(conversation.messages || []);
    if (older) before = conversation.before || "";
    paint();
  }
  async function read(older = "") {
    if (reading || requestLoading || !session || !view || view.hidden || document.hidden || document.querySelector("#fab-menu")?.hidden || document.querySelector("#fab-menu")?.inert) return;
    const current = epoch, identity = session, version = mutation; reading = true;
    try { const data = await request("/" + identity.id + (older ? "?before=" + encodeURIComponent(older) : ""), undefined, identity); if (current === epoch && version === mutation && !busy && !requestLoading) { accept(data, Boolean(older)); status.textContent = operationError; } }
    catch (error) { if (current === epoch) status.textContent = operationError || error.message; }
    finally { if (current === epoch) reading = false; }
  }
  async function action(kind, body = {}) {
    if (busy || !session || !conversation) return;
    if (kind === "end" && !["up", "down"].includes(body.rating)) return;
    const current = epoch, identity = session; mutation++; busy = true; requestLoading = kind === "request"; operationError = ""; status.textContent = ""; paint();
    if (kind === "end") stopTyping();
    try {
      const [data] = await Promise.all([request("/" + identity.id + "/" + kind, { cycle: conversation.cycle, ...body }, identity), kind === "request" ? transitionDelay() : Promise.resolve()]);
      if (current !== epoch) return;
      if (kind === "end") {
        if (data.conversation?.status !== "ended") throw Error("Unable to end this conversation. Please retry.");
        feedback = leavePrompt = false; rated = true; draft = "";
      }
      accept(data);
      if (kind === "end") returnToBot(true);
    } catch (error) { if (current === epoch) { operationError = error.message; status.textContent = operationError; void read(); } }
    finally { if (current === epoch) { busy = false; requestLoading = false; paint(); } }
  }
  async function sendMessage(input) {
    const text = input.value.trim(); if (!text || busy || !session || !["waiting", "connected"].includes(conversation?.status)) return;
    const current = epoch, identity = session, cycle = conversation.cycle;
    const attempt = pending?.text === text && pending.cycle === cycle ? pending : { text, cycle, id: crypto.randomUUID() };
    pending = attempt; busy = true; operationError = ""; status.textContent = ""; paint();
    stopTyping();
    try {
      const data = await request("/" + identity.id + "/messages", { text, clientId: attempt.id, cycle }, identity);
      if (current !== epoch) return;
      merge([data.message]); if (input.value.trim() === text) { input.value = ""; draft = ""; } pending = null; renderMessages();
    } catch (error) { if (current === epoch) { status.textContent = error.message; void read(); } }
    finally { if (current === epoch) { busy = false; paint(); input.focus(); } }
  }
  async function open({ name, email, consent }) {
    if (resume()) return;
    name = String(name || "").trim(); email = String(email || "").trim().toLowerCase();
    if (!consent || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error("Enter your name and email and agree to staff chat.");
    close(); const current = epoch; opening = true;
    const panel = document.getElementById("fab-menu"); if (!panel) throw Error("Chat panel unavailable.");
    view = node("section", "native-staff-chat"); view.setAttribute("aria-label", "Support conversation");
    const header = node("header"); header.append(button("Back", back, "native-chat-back"));
    endButton = button("End conversation", openFeedback, "native-chat-back"); endButton.hidden = true; header.append(endButton);
    const loading = node("div", "native-chat-loading"); loading.setAttribute("role", "status"); loading.setAttribute("aria-label", "Loading conversation");
    const spinner = node("span", "clinic-chat-intro-spinner"); loading.append(spinner);
    log = node("div", "native-chat-log"); log.setAttribute("role", "log"); log.setAttribute("aria-label", "Staff messages"); log.hidden = true;
    status = node("p", "native-chat-status"); status.setAttribute("role", "status"); controls = node("div", "native-chat-actions");
    typingIndicator = node("div", "native-chat-typing"); typingIndicator.setAttribute("role", "status"); typingIndicator.setAttribute("aria-live", "polite"); typingIndicator.hidden = true;
    const dots = node("span", "native-chat-typing-dots"); dots.setAttribute("aria-hidden", "true"); for (let i = 0; i < 3; i++) dots.append(node("i"));
    const typingProfile = node("span", "native-chat-avatar"), typingContent = node("div", "native-chat-typing-content"), typingCaption = node("span", "", ""); typingCaption.dataset.typingLabel = "true";
    typingProfile.setAttribute("aria-hidden", "true"); typingContent.append(dots, typingCaption); typingIndicator.append(typingProfile, typingContent);
    log.append(typingIndicator);
    view.append(header, loading, log, status, controls);
    for (const id of ["clinic-chat-body", "clinic-chat-form", "clinic-chat-status"]) { const element = document.getElementById(id); if (element) { hidden.push([element, element.style.display]); element.style.display = "none"; } }
    panel.append(view); header.querySelector("button")?.focus({ preventScroll: true });
    feedback = leavePrompt = false; rating = draft = controlMode = ""; rated = false;
    try {
      const [data] = await Promise.all([request("", { name, email, consent: true }, null), transitionDelay()]);
      const identity = { id: data.id, token: data.token, name, email };
      if (current !== epoch) { exit(identity, data.conversation?.cycle); return; }
      if (!/^[a-f0-9]{64}$/.test(identity.id || "") || !/^[a-f0-9]{64}$/.test(identity.token || "")) throw Error("Staff chat needs a clinic server update.");
      opening = false; session = identity; before = data.conversation.before || ""; accept(data);
      controls.querySelector("button")?.focus({ preventScroll: true });
      timer = setInterval(() => void read(), 2000);
      presentationTimer = setInterval(() => { refreshTyping(); updatePresentation(); }, 1000);
      heartbeatTimer = setInterval(() => {
        if (session && conversation?.status !== "ended") void request("/" + session.id + "/heartbeat", { cycle: conversation.cycle }).catch(() => {});
      }, 15000);
    } catch (error) {
      if (current === epoch) {
        opening = false;
        view.querySelector(".native-chat-loading")?.remove(); status.textContent = error.message;
        controls.append(button("Retry", () => void open({ name, email, consent }).catch(() => {})), button("Back", back, "native-chat-back"));
      }
      throw error;
    }
  }
  window.addEventListener?.("pagehide", close);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopTyping(); else { refreshTyping(); void read(); } });
  window.addEventListener?.("pageshow", event => { if (event.persisted) close(); });
  window.AlphastarHumanChat = Object.freeze({ open, close, back, minimize, resume, hasSession });
})();
