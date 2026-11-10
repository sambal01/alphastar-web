/* Copies the mobile English notices without rewriting them. HTML and the
 * Tagalog catalog are committed static files; the hosted site needs no build
 * dependency on the mobile repository. --patch emits an apply_patch payload. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const mobile = path.resolve(root, '../alphastar-mobile');
const ts = require(path.join(mobile, 'node_modules/typescript'));
const translated = require('./legal-tagalog.cjs');
const source = fs.readFileSync(path.join(mobile, 'src/lib/legalNotices.ts'), 'utf8').replace(/\r\n/g, '\n');
if (crypto.createHash('sha256').update(source).digest('hex') !== translated.sourceSha256) {
  throw new Error('Mobile legal wording changed. Review the Tagalog translations and their source fingerprint before syncing.');
}
const moduleValue = { exports: {} };
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
  { exports: moduleValue.exports, module: moduleValue }, { timeout: 1000 });
const notices = { privacy: moduleValue.exports.privacyPolicyNotice, terms: moduleValue.exports.termsAndConditionsNotice };
const updatedIsoDate = new Date(`${notices.privacy.updatedAt} 00:00:00 UTC`).toISOString().slice(0, 10);
const files = { privacy: 'privacy-policy.html', terms: 'terms-and-conditions.html' };
const escapeHtml = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const catalog = {};
const ui = {
  home: 'Back to Home', skip: 'Skip to content', contents: 'On this page',
  updated: 'Last updated:', updatedDate: notices.privacy.updatedAt,
  scope: 'The mobile-app notices are reproduced below, with separate sections for this website. Ask the clinic if anything is unclear.',
  legalNavigation: 'Legal information', privacy: 'Privacy Policy', terms: 'Terms and Conditions',
  privacyPageTitle: 'Privacy Policy | Alphastar', termsPageTitle: 'Terms and Conditions | Alphastar',
  privacyDescription: 'Read how Alphastar Mobile and this website handle information, and how to ask about your privacy.',
  termsDescription: 'Read the terms for Alphastar Mobile, SMAPE and MAPE forms, and this website.',
};
for (const key of Object.keys(ui)) catalog[`legal.${key}`] = translated.ui[key];
const website = {
  privacy: [
    {
      id: 'website-chat', title: 'This website and its Help Bot',
      body: 'This public website explains clinic services and the mobile app. Its Help Bot uses built-in, rule-based English/Tagalog replies, not a generative AI service. It does not sign you in, look up your patient account, retrieve SMAPE or MAPE records, or submit bookings. Help Bot messages, support drafts, timestamps, and bot feedback stay in the current page memory and reset on reload. Your Help Bot transcript is not automatically shared with clinic staff. Preparing an email draft or copying a message does not send it.',
      tlTitle: 'Ang website at Help Bot nito',
      tlBody: 'Nagbibigay ng impormasyon tungkol sa clinic at mobile app ang public website. Built-in, rule-based English/Tagalog replies ang gamit ng Help Bot, hindi generative AI service. Hindi ka nito sina-sign in, tinitingnan ang patient account o SMAPE at MAPE records, o nagsu-submit ng booking. Nasa memory ng kasalukuyang page ang Help Bot messages, support drafts, timestamps, at bot feedback at nawawala sa reload. Hindi awtomatikong ibinabahagi sa clinic staff ang Help Bot transcript. Hindi pa naipapadala ang message kapag gumawa ng email draft o nag-copy.',
    },
    {
      id: 'website-staff-chat', title: 'Website Staff Support and guest sessions',
      body: 'Staff Support connects you with authorized clinic staff through Alphastar messaging. Enter your name and email and agree to share them with the clinic and save this conversation before opening staff chat. This creates a separate guest identity, not access to a mobile patient account.',
      bullets: [
        'Staff messages, sender details, timestamps, connection status, and any feedback you submit are saved on the Alphastar Firebase/Render backend. Authorized clinic staff and administrators can review them for support duties.',
        'A private temporary token is held by the current page to authorize access to your guest conversation. It is not a patient login. Do not share this token or use a shared browser for private support details.',
        'You can minimize chat or return to the Help Bot and continue within the same loaded page. Refreshing or leaving the page requests that the guest conversation end. Disconnection or inactivity can also end it; delivery of an exit request is not guaranteed. A name or email alone cannot recover a previous guest conversation.',
        'Ending a guest conversation, closing the page, or clearing browser data does not delete the saved clinic transcript. Website guest sessions do not provide the account-linked recovery available in the mobile app.',
        'Like/Dislike ratings and comments are optional; you can end without either. Submitted staff-chat feedback is visible to authorized clinic staff. Temporary typing indicators show activity, not a sent message or guaranteed response. Do not enter passwords, PINs, verification codes, or unnecessary medical details.',
      ],
      tlTitle: 'Website Staff Support at guest sessions',
      tlBody: 'Sa Alphastar messaging ka ikinokonekta ng Staff Support sa awtorisadong clinic staff. Ilagay ang pangalan at email at pumayag na ibahagi ang mga ito sa clinic at i-save ang usapan bago buksan ang staff chat. Hiwalay na guest identity ito, hindi access sa mobile patient account.',
      tlBullets: [
        'Sine-save sa Firebase/Render backend ng Alphastar ang staff messages, sender details, timestamps, connection status, at anumang feedback na isinumite mo. Puwedeng tingnan ng awtorisadong clinic staff at administrators ang mga ito para sa support duties.',
        'May pribadong pansamantalang token sa kasalukuyang page para pahintulutan ang access sa guest conversation. Hindi ito patient login. Huwag ibahagi ang token o gumamit ng shared browser para sa pribadong support details.',
        'Puwedeng i-minimize ang chat o bumalik sa Help Bot at magpatuloy sa parehong loaded page. Humihiling na tapusin ang guest conversation kapag ni-refresh o iniwan ang page. Puwede ring matapos ito dahil sa disconnection o inactivity; hindi garantisado ang pagdating ng exit request. Hindi sapat ang pangalan o email para mabawi ang nakaraang guest conversation.',
        'Hindi nabubura ang saved clinic transcript sa pagtatapos ng guest conversation, pagsara ng page, o pag-clear ng browser data. Walang account-linked recovery sa website guest sessions gaya ng nasa mobile app.',
        'Opsyonal ang Like/Dislike rating at komento; puwedeng magtapos nang wala ang alinman. Nakikita ng awtorisadong clinic staff ang isinumiteng staff-chat feedback. Activity lang ang ipinapakita ng pansamantalang typing indicator, hindi naipadalang mensahe o garantisadong sagot. Huwag maglagay ng passwords, PINs, verification codes, o hindi kailangang medical details.',
      ],
    },
    {
      id: 'website-storage', title: 'Website language and browser storage',
      body: 'The website saves your English/Tagalog preference in browser local storage so it can remember your choice on later visits. The Help Bot’s language is separate from the website’s language. Your browser may also cache page files. Clearing this website’s browser data can reset the saved preference. It does not delete your mobile-app account, clinic records, or messages you have sent through another service.',
      tlTitle: 'Wika at browser storage ng website',
      tlBody: 'Sine-save ng website ang English/Tagalog choice sa local storage ng browser para maalala ito sa susunod na pagbisita. Hiwalay ang wika ng Help Bot sa wika ng website. Puwede ring i-cache ng browser ang page files. Puwedeng ma-reset ang language choice kapag nag-clear ng browser data ng website. Hindi nito binubura ang mobile-app account, clinic records, o messages na ipinadala sa ibang serbisyo.',
    },
    {
      id: 'website-providers', title: 'Website hosting, maps, and external links',
      body: 'Your browser connects to the website’s hosting service and, when loaded, Google Fonts and the embedded Google Map. These services may process connection details such as your IP address, browser information, and request details. Opening Messenger, email, directions, or an app-download link connects you to the relevant external service. Their privacy practices apply to those interactions. The website does not publish a fixed retention period for provider logs; ask the clinic about a specific concern.',
      tlTitle: 'Website hosting, mapa, at external links',
      tlBody: 'Kumokonekta ang browser sa website hosting at, kapag na-load, sa Google Fonts at naka-embed na Google Map. Maaaring iproseso ng mga serbisyong ito ang IP address, browser information, at request details. Kapag nagbukas ng Messenger, email, directions, o app-download link, kokonekta ka sa kaugnay na external service. May sarili silang privacy practices. Walang nakasaad na iisang retention period para sa provider logs sa website; sa clinic magtanong tungkol sa partikular na concern.',
      links: [{ label: 'Google Privacy Policy', url: 'https://policies.google.com/privacy' }, { label: 'Render Privacy Policy', url: 'https://render.com/privacy' }],
    },
  ],
  terms: [
    {
      id: 'website-use', title: 'Using this website',
      body: 'The website provides public clinic information, an automated guide, Staff Support, contact links, and app-download information. It is not a patient-account portal, booking confirmation, medical consultation, or emergency service. Use the Alphastar Android app for its medical forms, patient profile, and Staff Support features. Download only through the clinic’s official link when available. Ask staff if the download link or a clinic detail needs confirmation. Do not impersonate others, misuse the chat, or attempt unauthorized access.',
      tlTitle: 'Paggamit ng website',
      tlBody: 'May public clinic information, automated guide, Staff Support, contact links, at app-download information ang website. Hindi ito patient-account portal, booking confirmation, medical consultation, o emergency service. Sa Alphastar Android app gamitin ang medical forms, patient profile, at Staff Support features. Sa official link lang ng clinic mag-download kapag available ito. Magtanong sa staff kung kailangang kumpirmahin ang download link o clinic detail. Huwag magpanggap na ibang tao, abusuhin ang chat, o subukang pumasok nang walang awtoridad.',
    },
    {
      id: 'website-guidance', title: 'Website information and language choices',
      body: 'Clinic information can change. Confirm service availability, preparation, fees, and schedules with clinic staff before relying on them. English and Tagalog views explain the same notices; ask staff if wording is unclear. The Help Bot’s replies and feedback buttons do not confirm a request or send your chat to staff. Opening an email draft or Messenger is separate from sending a message. Reading these pages does not record acceptance or provide blanket consent for processing health information.',
      tlTitle: 'Website information at pagpili ng wika',
      tlBody: 'Puwedeng magbago ang clinic information. Kumpirmahin sa staff ang serbisyo, paghahanda, fees, at schedule bago umasa rito. Parehong notice ang ipinapaliwanag sa English at Tagalog; magtanong kung hindi malinaw ang wording. Hindi kumpirmasyon ng request o pagpapadala sa staff ang replies at feedback buttons ng bot. Hiwalay ang pagbukas ng email draft o Messenger sa pagpapadala ng message. Hindi nire-record ang acceptance sa pagbasa ng pages, at hindi ito blanket consent sa paggamit ng health information.',
    },
    {
      id: 'website-support', title: 'Using Staff Support as a guest',
      body: 'Provide accurate contact information and use Staff Support respectfully. Messages you send in staff chat go to the clinic, unlike local Help Bot replies or prepared drafts. Staff Support is available daily from 7:00 AM to 5:00 PM (Philippine time); replies depend on staff availability. You can end without a rating or comment. Ending or leaving does not erase the clinic transcript. Website guest access is temporary and cannot be restored using only your name or email after a refresh or page exit. The mobile app uses a registered patient account for saved staff conversations. Neither chat is an emergency service or a substitute for medical care.',
      tlTitle: 'Paggamit ng Staff Support bilang guest',
      tlBody: 'Magbigay ng tamang contact information at gamitin nang may respeto ang Staff Support. Napupunta sa clinic ang mga mensaheng ipinadala sa staff chat, hindi tulad ng local Help Bot replies o prepared drafts. Available ang Staff Support araw-araw, 7:00 AM–5:00 PM (oras sa Pilipinas); nakadepende sa staff availability ang sagot. Puwedeng magtapos nang walang rating o komento. Hindi nabubura ang clinic transcript sa pagtatapos o pag-alis. Pansamantala ang website guest access at hindi ito maibabalik gamit lang ang pangalan o email matapos mag-refresh o umalis sa page. Registered patient account ang gamit ng mobile app para sa saved staff conversations. Hindi emergency service o kapalit ng medical care ang alinmang chat.',
    },
  ],
};
function bind(key, english, tag = 'span') {
  if (typeof catalog[key] !== 'string' || !catalog[key]) throw new Error(`Missing Tagalog copy: ${key}`);
  return `<${tag} data-i18n="${key}">${escapeHtml(english)}</${tag}>`;
}
const common = key => bind(`legal.${key}`, ui[key]);
const translateNotice = (kind, notice) => {
  catalog[`legal.${kind}.introduction`] = translated[kind].introduction;
  return [...notice.sections.map(section => {
    const tl = translated[kind].sections[section.id];
    if (!tl || (section.bullets?.length || 0) !== (tl.bullets?.length || 0)) throw new Error(`Incomplete translation: ${kind}/${section.id}`);
    return { ...section, tlTitle: tl.title, tlBody: tl.body, tlBullets: tl.bullets };
  }), ...website[kind]].map(section => {
    const key = `legal.${kind}.${section.id}`;
    catalog[`${key}.title`] = section.tlTitle;
    catalog[`${key}.body`] = section.tlBody;
    section.bullets?.forEach((bullet, i) => { catalog[`${key}.bullet${i}`] = section.tlBullets[i]; });
    const links = (section.links || []).map(link => {
      if (!/^(https:\/\/|mailto:)/.test(link.url)) throw new Error('Unsupported legal reference URL');
      const labelKey = `legal.link.${link.label}`;
      catalog[labelKey] = translated.ui.links[link.label];
      return `<a href="${escapeHtml(link.url)}"${link.url.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${bind(labelKey, link.label)}</a>`;
    }).join('\n');
    return {
      id: section.id,
      toc: `<li><a href="#${section.id}">${bind(`${key}.title`, section.title)}</a></li>`,
      html: `<section class="legal-section" id="${section.id}" aria-labelledby="${section.id}-title">
<h2 id="${section.id}-title" tabindex="-1" data-i18n="${key}.title">${escapeHtml(section.title)}</h2>
${bind(`${key}.body`, section.body, 'p')}
${section.bullets?.length ? `<ul>${section.bullets.map((bullet, i) => `<li>${bind(`${key}.bullet${i}`, bullet)}</li>`).join('\n')}</ul>` : ''}
${links ? `<div class="legal-references">${links}</div>` : ''}
</section>`,
    };
  });
};
const generated = new Map();
for (const [kind, notice] of Object.entries(notices)) {
  const sections = translateNotice(kind, notice);
  const languageIcon = '<svg class="language-switch-icon" viewBox="0 0 28 28" fill="none" aria-hidden="true" focusable="false"><rect x="2" y="2" width="15" height="15" rx="4" stroke="currentColor" stroke-width="1.8"/><path d="M5.5 7.5h8M9.5 5.5v2M7.2 7.5c.4 3.7 2.4 5.8 5.5 7.4M11.8 7.5c-.4 3.7-2.4 5.8-5.5 7.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="12" y="12" width="14" height="14" rx="3.5" fill="currentColor"/><path d="m15.5 22.5 3.5-7 3.5 7M16.5 20.5h5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const html = `<!DOCTYPE html>
<!-- Generated by scripts/build-legal-pages.cjs. English app wording comes from src/lib/legalNotices.ts in alphastar-mobile. -->
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title data-i18n="legal.${kind}PageTitle">${escapeHtml(ui[`${kind}PageTitle`])}</title>
  <meta name="description" data-i18n-content="legal.${kind}Description" content="${escapeHtml(ui[`${kind}Description`])}"/>
  <link rel="canonical" href="https://alphastarkasiglahan.com/${files[kind]}"/>
  <link rel="icon" type="image/png" href="assets/images/alphastarlogo.png"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=Poppins:wght@600&amp;display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="assets/css/main.css"/>
  <link rel="stylesheet" href="assets/css/site-language.css?v=20261012-6"/>
  <link rel="stylesheet" href="assets/css/legal.css?v=20261012-2"/>
</head>
<body class="legal-page" data-legal-notice="${kind}">
  <a href="#legal-document" class="legal-skip-link">${common('skip')}</a>
  <header class="legal-toolbar">
    <div class="legal-toolbar-inner">
      <a href="index.html#home" class="legal-home-link"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14 6-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${common('home')}</a>
      <button type="button" class="site-language-toggle language-switch" id="site-language-toggle" aria-label="Switch website to Tagalog" title="Switch website to Tagalog" hidden><span class="language-switch-box">${languageIcon}<span class="site-language-label">Tagalog</span></span></button>
    </div>
  </header>
  <main class="legal-layout">
    <article class="legal-document" id="legal-document" aria-labelledby="legal-title" tabindex="-1">
      <div class="legal-introduction">
        <div class="legal-brand-row"><img class="legal-brand-logo" src="assets/images/alphastarlogo.png" alt="" width="88" height="88"/><h1 class="legal-title" id="legal-title"><span>Alphastar</span> ${common(kind)}</h1></div>
        <p class="legal-lead" data-i18n="legal.${kind}.introduction">${escapeHtml(notice.introduction)}</p>
        <p class="legal-scope">${common('scope')}</p>
        <p class="legal-updated">${common('updated')} <time datetime="${updatedIsoDate}">${common('updatedDate')}</time></p>
        <hr class="legal-rule"/>
      </div>
      <details class="legal-contents"><summary>${common('contents')}</summary><nav aria-label="On this page" data-i18n-aria-label="legal.contents"><ul>${sections.map(section => section.toc).join('\n')}</ul></nav></details>
      <div class="legal-sections">${sections.map(section => section.html).join('\n')}</div>
    </article>
  </main>
  <footer class="legal-footer"><div class="legal-footer-inner"><p>&copy; <span id="current-year">2026</span> Alphastar. <span data-i18n="footer.rights">All rights reserved.</span></p><nav aria-label="Legal information" data-i18n-aria-label="legal.legalNavigation"><a href="privacy-policy.html"${kind === 'privacy' ? ' aria-current="page"' : ''}>${common('privacy')}</a><a href="terms-and-conditions.html"${kind === 'terms' ? ' aria-current="page"' : ''}>${common('terms')}</a></nav></div></footer>
  <script src="assets/js/legal-translations.js?v=${updatedIsoDate.replaceAll('-', '')}-legal"></script>
  <script src="assets/js/site-language.js?v=20261110-80"></script>
  <script src="assets/js/legal-notices.js?v=20261012-1"></script>
</body>
</html>
`;
  generated.set(files[kind], html);
}
generated.set('assets/js/legal-translations.js', `// Generated by scripts/build-legal-pages.cjs. Static text only; no patient information.\nwindow.AlphastarLegalTranslations = Object.freeze(${JSON.stringify(catalog, null, 2)});\n`);
const changed = [...generated].filter(([file, content]) => !fs.existsSync(path.join(root, file)) || fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n') !== content);
if (process.argv.includes('--patch')) {
  const chunks = changed.map(([file, content]) => {
    const absolute = path.join(root, file).replaceAll('\\', '/');
    const target = path.join(root, file);
    const plus = content.trimEnd().split('\n').map(line => '+' + line).join('\n');
    if (!fs.existsSync(target)) return `*** Add File: ${absolute}\n${plus}`;
    const old = fs.readFileSync(target, 'utf8');
    if (!old.includes('Generated by scripts/build-legal-pages.cjs.')) throw new Error(`Refusing to overwrite non-generated file: ${file}`);
    return `*** Update File: ${absolute}\n@@\n${old.trimEnd().split(/\r?\n/).map(line => '-' + line).join('\n')}\n${plus}`;
  });
  console.log(JSON.stringify({ files: changed.map(([file]) => file), updatedAt: notices.privacy.updatedAt, sections: Object.fromEntries(Object.entries(notices).map(([kind, notice]) => [kind, notice.sections.length])), patch: `*** Begin Patch\n${chunks.join('\n')}\n*** End Patch` }));
} else {
  if (changed.length) throw new Error(`Generated legal pages are out of sync: ${changed.map(([file]) => file).join(', ')}`);
  console.log('PASS: English legal pages match the mobile notices exactly; Tagalog translations and static output are current.');
}
