// Layout regression check. Run: node tests/mobile-layout.mjs
// Uses a temporary Chrome profile and never submits an appointment.
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'test-results');
await mkdir(output, { recursive: true });
const profile = await mkdtemp(join(tmpdir(), 'alphastar-mobile-'));
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'], {windowsHide:true,stdio:['ignore','ignore','pipe']});
let ws;
try {
 const address=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Browser timeout')),15000);chrome.stderr.on('data',b=>{const m=String(b).match(/DevTools listening on (ws:\/\/\S+)/);if(m){clearTimeout(timer);resolve(m[1]);}});chrome.on('error',reject);});
 ws=new WebSocket(address);
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 let seq=0;const waiting=new Map();
 ws.onmessage=e=>{const m=JSON.parse(e.data),p=waiting.get(m.id);if(p){waiting.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}};
 const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++seq;waiting.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params,sessionId}));});
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});
 const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
 const page=(method,params)=>send(method,params,sessionId);
 const url=pathToFileURL(join(root,'index.html')).href;
 await page('Page.enable');




 const delay=ms=>new Promise(r=>setTimeout(r,ms));
 const evaluate=async expression=>{const r=await page('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const click=async selector=>{const point=await evaluate("(()=>{const r=document.querySelector("+JSON.stringify(selector)+").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");await page('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await page('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await page('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});};

 const inspect = (fn, ...args) => evaluate('(' + fn.toString() + ')(...' + JSON.stringify(args) + ')');
 const check = (condition, message) => { if (!condition) throw new Error(message); };
 const key = async (name, code, modifiers = 0) => {
  await page('Input.dispatchKeyEvent', {type:'keyDown', key:name, code:name, windowsVirtualKeyCode:code, modifiers});
  await page('Input.dispatchKeyEvent', {type:'keyUp', key:name, code:name, windowsVirtualKeyCode:code, modifiers});
 };
 const go = async selector => {
  await inspect(selector => window.scrollTo({top: document.querySelector(selector).getBoundingClientRect().top + scrollY - getNavbarOffset() - 12, behavior:'instant'}), selector);
  await delay(100);
 };
 const screenshot = async name => {
  const shot = await page('Page.captureScreenshot', {format:'png'});
  await writeFile(join(output, name + '.png'), Buffer.from(shot.data, 'base64'));
 };
 await page('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 for (const [width,height] of [[320,568],[360,640],[390,844],[414,896],[640,900],[768,1024],[844,390],[899,700],[900,700],[1024,768],[1338,900]]) {
  await page('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:width<1100});
  await page('Emulation.setTouchEmulationEnabled', {enabled:width<1100});
  const loaded = new Promise((resolve,reject) => {
   const timer = setTimeout(() => reject(new Error('Page load timeout')), 20000);
   const listener = event => {
    const message = JSON.parse(event.data);
    if (message.sessionId === sessionId && message.method === 'Page.loadEventFired') {
     clearTimeout(timer); ws.removeEventListener('message', listener); resolve();
    }
   };
   ws.addEventListener('message', listener);
  });
  await page('Page.navigate', {url}); await loaded; await evaluate('document.fonts.ready'); await delay(200);
  const layout = await inspect(() => {
   const box = e => e.getBoundingClientRect();
   const bars = [...document.querySelectorAll('.navbar-topbar,.navbar-main')];
   const textProblems = [...document.querySelectorAll('h1,h2,h3,.hero-cta-row button,.chrome-btn-main,.chrome-btn-sub,.day-name,.day-hours,.info-card-item strong')].filter(e => {
    if (!e.getClientRects().length || e.closest('[aria-hidden="true"]')) return false;
    const range = document.createRange(); range.selectNodeContents(e);
    const r = range.getBoundingClientRect(), p = box(e);
    return r.width > 0 && (r.left < p.left - 1 || r.right > p.right + 1);
   }).map(e => e.textContent.trim());
   return {overflow:document.documentElement.scrollWidth > innerWidth, headerError:Math.abs(box(document.querySelector('#home')).top - bars.reduce((n,e)=>n+e.offsetHeight,0)),textProblems,
    smallInputs:[...document.querySelectorAll('.form-group input,.form-group select,.form-group textarea')].some(e=>parseFloat(getComputedStyle(e).fontSize)<16),
    serviceCount:document.querySelectorAll('.service-card').length,faqCount:document.querySelectorAll('.faq-item').length};
  });
  check(!layout.overflow && layout.headerError<=1, width+': overflow/header '+JSON.stringify(layout));
  check(!layout.textProblems.length, width+': clipped text '+JSON.stringify(layout.textProblems));
  check(layout.serviceCount===12 && layout.faqCount===10, width+': missing content');
  if (width<1100) check(!layout.smallInputs, width+': small form text');
  if ([320,390,768,1338].includes(width)) await screenshot('mobile-verified-'+width+'-home');

  if (width<1100) {
   await click('#hamburger-btn'); await delay(400);
   check(await inspect(() => {
    const menu=document.querySelector('#mobile-menu'), r=menu.getBoundingClientRect();
    return !menu.inert && r.bottom<=innerHeight+1 && document.body.classList.contains('menu-open') &&
     getComputedStyle(document.querySelector('#fab-container')).visibility==='hidden';
   }), width+': mobile menu bounds/FAB');
   await inspect(() => document.querySelector('#mobile-menu button').focus());
   await key('Tab',9);
   check(await evaluate("document.activeElement.id==='hamburger-btn'"), width+': focus escaped menu');
   await key('Tab',9,8);
   check(await evaluate("document.activeElement.matches('#mobile-menu button')"), width+': reverse focus escaped menu');
   await key('Escape',27); await delay(400);
   check(await inspect(() => document.querySelector('#mobile-menu').hidden && document.querySelector('#mobile-menu').inert &&
    document.activeElement.id==='hamburger-btn' && !document.body.classList.contains('menu-open')), width+': Escape failed');
   await click('#hamburger-btn'); await delay(400);
   await inspect(() => document.querySelector('#mobile-menu').scrollTop=0);
   await click('.mobile-link[href="#services"]'); await delay(450);
   check(await inspect(() => !document.body.classList.contains('menu-open') && Math.abs(document.querySelector('#services').getBoundingClientRect().top-getNavbarOffset())<2 &&
    document.querySelector('.mobile-link[href="#services"]').getAttribute('aria-current')==='page'), width+': navigation failed');
  }

  await go('#faq-accordion');
  check(await inspect(() => {
   const a=document.querySelector('#faq-accordion'),r=a.getBoundingClientRect(),items=a.querySelectorAll('.faq-item');
   return items[4].getBoundingClientRect().bottom<=r.bottom+1 && items[5].getBoundingClientRect().top>=r.bottom-1;
  }), width+': FAQ must show five closed rows');
  const faq = await inspect(async () => {
   const y=scrollY, failures=[];
   for (const button of document.querySelectorAll('.faq-question')) {
    button.click(); await new Promise(r=>setTimeout(r,420));
    const answer=document.getElementById(button.getAttribute('aria-controls'));
    if (button.getAttribute('aria-expanded')!=='true' || answer.clientHeight<answer.scrollHeight-1) failures.push(button.id);
   }
   document.querySelector('.faq-question[aria-expanded="true"]').click();
   await new Promise(r=>setTimeout(r,420));
   return {failures,pageMoved:Math.abs(scrollY-y)>1};
  });
  check(!faq.failures.length && !faq.pageMoved, width+': FAQ '+JSON.stringify(faq));
  await inspect(() => {const a=document.querySelector('#faq-accordion');a.scrollTop=a.scrollHeight;});
  const scrollPoint=await inspect(() => {const r=document.querySelector('#faq-accordion').getBoundingClientRect();return {x:r.x+r.width/2,y:Math.min(r.y+100,innerHeight-40),page:scrollY};});
  await page('Input.dispatchMouseEvent',{type:'mouseWheel',x:scrollPoint.x,y:scrollPoint.y,deltaX:0,deltaY:500});
  await delay(150);
  check(await evaluate('Math.abs(scrollY-'+scrollPoint.page+')<1'),width+': FAQ scroll leaked into page');
  if (width<900) {
   await go('.faq-side-card');
   check(await inspect(() => document.querySelector('.faq-side-panel').getBoundingClientRect().height>0),width+': missing FAQ help');
   if(width===390) await screenshot('mobile-verified-390-faq-help');
  }

  await go('#booking-form');
  const form = await inspect(() => {
   const form=document.querySelector('#booking-form'),y=scrollY;
   document.querySelector('#b-name').value='Mobile layout check';
   form.scrollTop=form.scrollHeight;
   return {scrollable:form.scrollHeight>form.clientHeight,scroll:form.scrollTop,y};
  });
  check(form.scrollable && form.scroll>0,width+': form not scrollable');
  check(await evaluate('scrollY==='+form.y),width+': form scroll moved page');
  await inspect(() => document.querySelector('#b-message').focus({preventScroll:true}));
  await delay(100);
  const focusedForm = await inspect(() => ({active:document.activeElement.id,width:innerWidth,matches:document.body.matches('body:has(#booking-form:focus-within)'),visibility:getComputedStyle(document.querySelector('#fab-container')).visibility}));
  if(width<1100) check(focusedForm.visibility==='hidden',width+': FAB obstructs focused form '+JSON.stringify(focusedForm));
  await inspect(() => document.activeElement.blur());
  check(await evaluate("document.querySelector('#b-name').value==='Mobile layout check'"),width+': form value lost');

  await go('.contact-info-side');
  check(await inspect(() => {
   const info=document.querySelector('.contact-info-side'),map=info.querySelector('.map-placeholder');
   return Math.abs(map.getBoundingClientRect().top-info.getBoundingClientRect().top)<8 && info.scrollHeight>info.clientHeight &&
    info.querySelectorAll('.contact-info-cards .info-card-item').length===4;
  }), width+': map/contact layout');
  await inspect(() => {const info=document.querySelector('.contact-info-side');info.scrollTop=info.scrollHeight;});
  if (width===390) await screenshot('mobile-verified-390-contact-details');
  await inspect(() => window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})); await delay(100);
  if(width<1100) check(await inspect(() => {
   const fab=document.querySelector('#fab-main').getBoundingClientRect();
   return [...document.querySelectorAll('.footer-legal-link')].every(e=>{
    const r=e.getBoundingClientRect();
    return r.bottom<fab.top && r.height>=44;
   });
  }),width+': footer links obstructed or too small');
  if([320,390].includes(width)) await screenshot('mobile-verified-'+width+'-footer');

  await click('#fab-main'); await delay(400);
  check(await inspect(() => {
   const buttons=[...document.querySelectorAll('.fab-menu-btn')],r=document.querySelector('#fab-main').getBoundingClientRect();
   return r.width===54 && buttons.every(e=>{const b=e.getBoundingClientRect();return b.x>=0&&b.y>=0&&b.right<=innerWidth&&b.bottom<=innerHeight;}) &&
    document.querySelector('.fab-instagram-icon').closest('a').href.includes('instagram.com/alphastarclinic');
  }),width+': FAB layout/link');
  await key('Escape',27); await delay(400);

  if(width<1100) {
   await click('#hamburger-btn'); await delay(400);
   await page('Emulation.setDeviceMetricsOverride',{width:1338,height:900,deviceScaleFactor:1,mobile:false}); await delay(400);
   check(await evaluate("!document.body.classList.contains('menu-open') && document.querySelector('#mobile-menu').inert"), width+': desktop resize locked scrolling');
  }
  console.log('PASS '+width+'x'+height+': layout, navigation, FAQ, form/map scrolling, footer, FAB');
 }
 await send('Browser.close');
} finally {
 ws?.close(); chrome.kill();
 // Only remove the temporary Chrome profile created by this test.
 if (dirname(resolve(profile)) === resolve(tmpdir()) && profile.includes('alphastar-mobile-')) {
  await rm(profile, {recursive:true,force:true,maxRetries:5,retryDelay:200});
 }
}
