"use strict";
// No sign-in, valid guest creation, chat messages or patient-record operations.
const assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const backend = "https://alphastar-mobile.onrender.com", site = "https://alphastarkasiglahan.com";
const root = path.resolve(__dirname, "..");
async function get(url, options = {}) { return fetch(url, { ...options, signal: AbortSignal.timeout(45000) }); }
async function post(route, body = {}) { return get(backend + route, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
(async () => {
  const health = await get(backend + "/api/health"); assert.equal(health.status, 200); assert.equal((await health.json()).ok, true);
  const ready = await get(backend + '/api/ready'); assert.equal(ready.status, 200); const capabilities = await ready.json();
  assert.deepEqual(capabilities.medicalRecordTypes, ['smape','mape']);
  assert.equal(capabilities.medicalRecordAssessmentCorrections, true); assert.equal(capabilities.patientSavedVitalsReadOnly, true);
  assert.equal(capabilities.patientChatOptionalFeedback, true);
  assert.equal((await get(backend + "/api/staff/human-chats/unread")).status, 401);
  assert.equal((await get(backend + "/api/staff/sync/stream")).status, 401);
  const checks = [
    ["/api/support/chats", 400],
    ["/api/support/chats/invalid/request", 400],
    ["/api/support/chats/invalid/heartbeat", 400],
    ["/api/patient-support/chats/open", 401],
    ["/api/staff/human-chats/invalid/connect", 401],
    ["/api/support/chats/invalid/typing", 400],
    ["/api/patient-support/chats/invalid/typing", 400],
    ["/api/staff/human-chats/invalid/typing", 401],
  ];
  for (const [route, expected] of checks) assert.equal((await post(route)).status, expected, route);
  const cors = await get(backend + "/api/support/chats/invalid/request", { method: "OPTIONS", headers: {
    Origin: site, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type,x-alphastar-chat-token" } });
  assert.equal(cors.status, 204); assert.equal(cors.headers.get("access-control-allow-origin"), "*");
  assert.match(cors.headers.get("access-control-allow-headers"), /x-alphastar-chat-token/i);
  console.log("PASS: Live backend health, new support routes, anonymous-access rejection and website CORS. No conversations or patient records created.");
  if (process.argv.includes("--backend-only")) return;
  const hash = text => crypto.createHash("sha256").update(text.replace(/\r\n/g, "\n").trim()).digest("hex");
  const release = JSON.parse(fs.readFileSync(path.join(root, "downloads/release.json"), "utf8"));
  for (const name of ["index.html", "assets/js/site-config.js", "assets/js/human-chat.js", "assets/js/clinic-assistant.js", "assets/js/floating-btn.js", "assets/css/clinic-assistant.css", "assets/js/clinic-assistant-flow.js", "assets/js/faq.js", "assets/js/legal-translations.js", "assets/js/site-language.js", "privacy-policy.html", "terms-and-conditions.html"]) {
    const response = await get(site + "/" + name + "?support_release=" + release.version, { headers: { "Cache-Control": "no-cache" } });
    assert.equal(response.status, 200, name); assert.equal(hash(await response.text()), hash(fs.readFileSync(path.join(root, name), "utf8")), name + " source differs");
  }
  const sidecar = await get(site + "/downloads/" + release.filename + ".sha256");
  assert.equal(sidecar.status, 200); assert.equal((await sidecar.text()).trim(), release.sha256 + "  " + release.filename);
  console.log("PASS: Live website HTML, support-chat assets, download configuration and checksum sidecar match the tested release.");
})().catch(error => { console.error(error); process.exitCode = 1; });
