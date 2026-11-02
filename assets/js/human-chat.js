(function () {
  "use strict";
  const base = "https://alphastar-mobile.onrender.com/api/support/chats";
  let session = null, conversation = null, view, log, status, controls, endButton, typingIndicator, hidden = [];
  let timer, heartbeatTimer, epoch = 0, reading = false, busy = false, pending = null, rows = [], before = "";
  let presentationTimer, typingIdle, typingClient = "", typingSequence = 0, typingOn = false, lastTyping = 0;
  let feedback = false, rating = "", comment = "", rated = false, controlMode = "";
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
  function stopTyping() { clearTimeout(typingIdle); reportTyping(false); }
  function changedDraft(value) { clearTimeout(typingIdle); reportTyping(Boolean(value.trim())); typingIdle = setTimeout(stopTyping, 1800); }
  function updatePresentation() {
    if (!view || !conversation) return;
    for (const stamp of log.querySelectorAll("time[data-sent]")) { const label = relative(stamp.dataset.sent); if (stamp.textContent !== label) stamp.textContent = label; }
    const visible = ["waiting", "connected"].includes(conversation.status) && conversation.typing?.staff?.expiresAt > Date.now();
    typingIndicator.hidden = !visible;
    const label = visible ? firstName(conversation.connectedName) + " is typing…" : "";
    if (typingIndicator.lastChild.textContent !== label) typingIndicator.lastChild.textContent = label;
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
    view?.remove(); view = log = controls = status = typingIndicator = null;
    for (const [element, display] of hidden) element.style.display = display;
    hidden = [];
    // Old guest capabilities must not recover a prior visit after refresh.
    try { sessionStorage.removeItem("alphastar-staff-chat-v1"); } catch {}
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
      const name = row.sender === "system" ? "System" : firstName(row.sender === "staff" ? row.name : row.name || conversation.visitorName || session.name);
      if (row.sender !== "system") {
        const profile = node("span", "native-chat-avatar"); profile.setAttribute("aria-hidden", "true");
        if (row.sender === "staff" && (row.avatar === "clinic" || !row.avatar && ["Alphastar Staff", "Support assistant"].includes(row.name || "Support assistant"))) { const logo = node("img"); logo.src = "assets/images/alphastarlogo.png"; logo.alt = ""; profile.append(logo); }
        else profile.textContent = row.sender === "visitor" ? "Me" : row.initials || initials(row.name);
        bubble.append(profile);
      }
      const content = node("div", "native-chat-message-body"), timestamp = node("time", "", relative(row.time));
      timestamp.dataset.sent = row.time; timestamp.dateTime = row.time; timestamp.title = absolute(row.time); timestamp.setAttribute("aria-label", absolute(row.time));
      content.append(node("strong", "", name), node("p", "", row.text), timestamp); bubble.append(content);
      const next = [...log.children].find(element => element.dataset.message && rows.findIndex(item => item.id === element.dataset.message) > rows.indexOf(row));
      log.insertBefore(bubble, next || null);
    }
    log.scrollTop = bottom ? log.scrollHeight : before && log.scrollHeight > height ? top + log.scrollHeight - height : top;
  }
  function paint() {
    if (!view || !conversation) return;
    view.querySelector(".native-chat-loading")?.remove();
    log.hidden = false; renderMessages(); updatePresentation();
    endButton.hidden = conversation.status === "welcome" || rated;
    endButton.disabled = busy;
    const mode = feedback ? "feedback" : ["waiting", "connected"].includes(conversation.status) ? "compose" : conversation.status;
    if (mode === controlMode) {
      for (const element of controls.querySelectorAll("button")) {
        if (element.dataset.send) element.disabled = busy || !controls.querySelector("textarea").value.trim();
        else if (element.dataset.finish) element.disabled = busy || !rating;
        else element.disabled = busy;
      }
      return;
    }
    controlMode = mode; controls.replaceChildren();
    if (feedback) {
      controls.className = "native-chat-feedback";
      controls.append(node("strong", "", "Was this conversation helpful?"));
      const choices = node("div", "native-chat-rating");
      for (const [value, label] of [["up", "👍"], ["down", "👎"]]) {
        const choice = button(label, () => {
          rating = value;
          for (const option of choices.children) option.setAttribute("aria-pressed", String(option === choice));
          controls.querySelector("[data-finish]").disabled = busy;
        });
        choice.setAttribute("aria-label", value === "up" ? "Helpful" : "Not helpful"); choice.setAttribute("aria-pressed", String(rating === value)); choices.append(choice);
      }
      const field = node("textarea"); field.maxLength = 1000; field.rows = 2; field.value = comment;
      field.placeholder = "Add a comment"; field.setAttribute("aria-label", "Feedback comment");
      field.addEventListener("input", () => { comment = field.value; });
      const finish = button("End conversation", () => void action("end", { rating, comment })); finish.dataset.finish = "true"; finish.disabled = !rating || busy;
      controls.append(choices, field, finish, button("Keep chatting", () => { feedback = false; paint(); }, "native-chat-back"));
    } else if (mode === "welcome") {
      controls.className = "native-chat-actions";
      controls.append(button(localized("Yes, connect me to support", "Oo, ikonekta ako sa support"), () => void action("request")));
    } else if (mode === "ended") {
      controls.className = "native-chat-actions";
      controls.append(node("p", "", "Conversation ended"), button("Back", close, "native-chat-back"));
    } else {
      controls.className = "native-chat-composer";
      const form = node("form"), input = node("textarea"), send = node("button", "", "Send");
      input.maxLength = 2000; input.rows = 1; input.placeholder = "Type your message…"; input.setAttribute("aria-label", "Message for clinic staff");
      send.type = "submit"; send.dataset.send = "true"; send.disabled = true;
      input.addEventListener("input", () => { send.disabled = busy || !input.value.trim(); changedDraft(input.value); });
      input.addEventListener("blur", stopTyping);
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
    if (reading || !session || !view || document.hidden || document.querySelector("#fab-menu")?.hidden) return;
    const current = epoch, identity = session; reading = true;
    try { const data = await request("/" + identity.id + (older ? "?before=" + encodeURIComponent(older) : ""), undefined, identity); if (current === epoch) { accept(data, Boolean(older)); status.textContent = ""; } }
    catch (error) { if (current === epoch) status.textContent = error.message; }
    finally { if (current === epoch) reading = false; }
  }
  async function action(kind, body = {}) {
    if (busy || !session || !conversation) return;
    const current = epoch, identity = session; busy = true; status.textContent = ""; paint();
    if (kind === "end") stopTyping();
    try {
      const data = await request("/" + identity.id + "/" + kind, { cycle: conversation.cycle, ...body }, identity);
      if (current !== epoch) return;
      if (kind === "end") { feedback = false; rated = true; }
      accept(data);
    } catch (error) { if (current === epoch) { status.textContent = error.message; void read(); } }
    finally { if (current === epoch) { busy = false; paint(); } }
  }
  async function sendMessage(input) {
    const text = input.value.trim(); if (!text || busy || !session || !["waiting", "connected"].includes(conversation?.status)) return;
    const current = epoch, identity = session, cycle = conversation.cycle;
    const attempt = pending?.text === text && pending.cycle === cycle ? pending : { text, cycle, id: crypto.randomUUID() };
    pending = attempt; busy = true; status.textContent = ""; paint();
    stopTyping();
    try {
      const data = await request("/" + identity.id + "/messages", { text, clientId: attempt.id, cycle }, identity);
      if (current !== epoch) return;
      merge([data.message]); if (input.value.trim() === text) input.value = ""; pending = null; renderMessages();
    } catch (error) { if (current === epoch) { status.textContent = error.message; void read(); } }
    finally { if (current === epoch) { busy = false; paint(); input.focus(); } }
  }
  async function open({ name, email, consent }) {
    name = String(name || "").trim(); email = String(email || "").trim().toLowerCase();
    if (!consent || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error("Enter your name and email and agree to staff chat.");
    close(); const current = epoch;
    const panel = document.getElementById("fab-menu"); if (!panel) throw Error("Chat panel unavailable.");
    view = node("section", "native-staff-chat"); view.setAttribute("aria-label", "Support conversation");
    const header = node("header"); header.append(button("Back", close, "native-chat-back"));
    endButton = button("End conversation", () => { stopTyping(); feedback = true; paint(); }, "native-chat-back"); endButton.hidden = true; header.append(endButton);
    const loading = node("div", "native-chat-loading"); loading.setAttribute("role", "status"); loading.setAttribute("aria-label", "Loading conversation");
    const spinner = node("span", "clinic-chat-intro-spinner"); loading.append(spinner);
    log = node("div", "native-chat-log"); log.setAttribute("role", "log"); log.setAttribute("aria-label", "Staff messages"); log.hidden = true;
    status = node("p", "native-chat-status"); status.setAttribute("role", "status"); controls = node("div", "native-chat-actions");
    typingIndicator = node("div", "native-chat-typing"); typingIndicator.setAttribute("role", "status"); typingIndicator.setAttribute("aria-live", "polite"); typingIndicator.hidden = true;
    const dots = node("span", "native-chat-typing-dots"); dots.setAttribute("aria-hidden", "true"); for (let i = 0; i < 3; i++) dots.append(node("i"));
    typingIndicator.append(dots, node("span", "", ""));
    view.append(header, loading, log, typingIndicator, status, controls);
    for (const id of ["clinic-chat-body", "clinic-chat-form", "clinic-chat-status"]) { const element = document.getElementById(id); if (element) { hidden.push([element, element.style.display]); element.style.display = "none"; } }
    panel.append(view); header.querySelector("button")?.focus({ preventScroll: true });
    feedback = false; rating = comment = controlMode = ""; rated = false;
    try {
      const data = await request("", { name, email, consent: true }, null);
      const identity = { id: data.id, token: data.token, name, email };
      if (current !== epoch) { exit(identity, data.conversation?.cycle); return; }
      if (!/^[a-f0-9]{64}$/.test(identity.id || "") || !/^[a-f0-9]{64}$/.test(identity.token || "")) throw Error("Staff chat needs a clinic server update.");
      session = identity; before = data.conversation.before || ""; accept(data);
      controls.querySelector("button")?.focus({ preventScroll: true });
      timer = setInterval(() => void read(), 2000);
      presentationTimer = setInterval(updatePresentation, 1000);
      heartbeatTimer = setInterval(() => {
        if (session && conversation?.status !== "ended") void request("/" + session.id + "/heartbeat", { cycle: conversation.cycle }).catch(() => {});
      }, 15000);
    } catch (error) {
      if (current === epoch) {
        view.querySelector(".native-chat-loading")?.remove(); status.textContent = error.message;
        controls.append(button("Retry", () => void open({ name, email, consent }).catch(() => {})), button("Back", close, "native-chat-back"));
      }
      throw error;
    }
  }
  window.addEventListener?.("pagehide", close);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopTyping(); else void read(); });
  window.addEventListener?.("pageshow", event => { if (event.persisted) close(); });
  window.AlphastarHumanChat = Object.freeze({ open, close });
})();
