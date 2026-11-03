'use strict';
// Synthetic local browser checks only. No sign-in, chat creation or external requests.
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http');
const {execFileSync}=require('node:child_process');
const {chromium}=require('../.tmp/chat-browser-tools/node_modules/playwright-core');
const root=path.resolve(__dirname,'..'),output=path.join(root,'test-results/mobile-chrome');
const baseline=new Map(['index.html','assets/js/navbar.js','assets/css/mobile-chrome.css'].map(file=>[file,execFileSync('git',['show','HEAD:'+file],{cwd:root})]));
let browser,server;
const wait=page=>page.waitForTimeout(420);
async function snapshot(page){return page.evaluate(()=>{
  const css=(selector,properties)=>{const node=document.querySelector(selector),style=getComputedStyle(node),box=node.getBoundingClientRect();return {width:box.width,height:box.height,styles:Object.fromEntries(properties.map(key=>[key,style[key]]))};};
  return {footer:css('.site-footer',['backgroundColor','color','paddingTop']),grid:css('.footer-grid',['gridTemplateColumns','gap','paddingBottom']),link:css('.footer-col a',['fontSize','lineHeight','color','padding']),logo:css('.footer-logo',['width']),navbar:css('.navbar-inner',['minHeight','gap']),desktopLinks:css('.navbar-links',['display','gap','fontSize'])};
});}
(async()=>{
  await fs.mkdir(output,{recursive:true});
  server=http.createServer(async(req,res)=>{try{
    const url=new URL(req.url,'http://localhost'),old=url.pathname.startsWith('/baseline/');
    const file=decodeURIComponent(url.pathname.slice(old?10:1))||'index.html',absolute=path.resolve(root,file);
    if(!absolute.startsWith(root+path.sep)||!(file==='index.html'||file.startsWith('assets/')))throw Error('Outside test scope');
    const bytes=old&&baseline.has(file)?baseline.get(file):await fs.readFile(absolute);
    res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
  }catch{res.writeHead(404);res.end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Asia/Manila'});
  await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const width of [768,1024,1440]){
    await page.setViewportSize({width,height:900});await page.goto(origin+'/baseline/',{waitUntil:'networkidle'});const old=await snapshot(page);
    let oldMenu;
    if(width<1100){await page.locator('#hamburger-btn').click();await wait(page);oldMenu=await page.locator('#mobile-menu').boundingBox();}
    await page.goto(origin,{waitUntil:'networkidle'});assert.deepEqual(await snapshot(page),old,'Tablet/desktop layout unchanged at '+width);
    if(oldMenu){await page.locator('#hamburger-btn').click();await wait(page);assert.deepEqual(await page.locator('#mobile-menu').boundingBox(),oldMenu,'Tablet menu unchanged');await page.keyboard.press('Escape');await wait(page);}
    assert.equal(await page.locator('.mobile-menu-header').isVisible(),false);
  }
  for(const [width,height]of [[280,740],[320,740],[390,844],[640,900],[767,900],[740,390]]){
    await page.setViewportSize({width,height});await page.goto(origin+'/baseline/',{waitUntil:'networkidle'});const oldColors=await page.evaluate(()=>[getComputedStyle(document.querySelector('.site-footer')).backgroundColor,getComputedStyle(document.querySelector('.footer-brand p')).color,getComputedStyle(document.querySelector('.footer-col a')).color]);
    await page.goto(origin,{waitUntil:'networkidle'});
    assert.deepEqual(await page.evaluate(()=>[getComputedStyle(document.querySelector('.site-footer')).backgroundColor,getComputedStyle(document.querySelector('.footer-brand p')).color,getComputedStyle(document.querySelector('.footer-col a')).color]),oldColors,'Original footer colors preserved');
    for(const language of ['en','tl']){
      await page.evaluate(language=>window.AlphastarSiteLanguage.setLanguage(language),language);
      const geometry=await page.evaluate(()=>{
        const grid=document.querySelector('.footer-grid'),[brand,links,services,contact]=[...grid.children].map(node=>node.getBoundingClientRect());
        const bodies=[grid.children[2].querySelector('ul'),grid.querySelector('.footer-contact-list')].map(node=>node.getBoundingClientRect());
        return {twoColumns:Math.abs(services.top-contact.top)<1&&contact.left>services.left,equalWidths:Math.abs(services.width-contact.width)<1,bodiesAligned:Math.abs(bodies[0].top-bodies[1].top)<1,brandFirst:brand.bottom<=links.top,linksAbove:links.bottom<=services.top,brandFull:Math.abs(brand.width-grid.clientWidth+48)<1,linksFull:Math.abs(links.width-brand.width)<1,noOverflow:document.documentElement.scrollWidth<=innerWidth&&[...grid.querySelectorAll('*')].every(node=>node.scrollWidth<=node.clientWidth+1||node.tagName==='SVG'),readable:parseFloat(getComputedStyle(document.querySelector('.footer-col a')).fontSize)>=14&&parseFloat(getComputedStyle(document.querySelector('.footer-contact-item small')).fontSize)>=14};
      });
      assert.deepEqual(geometry,{twoColumns:true,equalWidths:true,bodiesAligned:true,brandFirst:true,linksAbove:true,brandFull:true,linksFull:true,noOverflow:true,readable:true},width+' '+language+' footer');
      if(width===390||width===320)await page.locator('.site-footer').screenshot({path:path.join(output,'footer-'+width+'-'+language+'.png'),style:'#navbar, #navbar *, #fab-container, #fab-container * { visibility: hidden !important; }'});
    }
    await page.evaluate(()=>window.AlphastarSiteLanguage.setLanguage('en'));
    if(width===390||width===320)await page.locator('.site-footer').screenshot({path:path.join(output,'footer-'+width+'.png'),style:'#navbar, #fab-container { visibility: hidden !important; }'});
    await page.locator('#hamburger-btn').click();
    await page.waitForFunction(()=>document.querySelector('#mobile-menu').classList.contains('open'));
    assert.ok(await page.locator('#mobile-menu').evaluate(node=>parseFloat(getComputedStyle(node).transitionDuration))>.2,'Drawer uses a smooth transform transition');await wait(page);
    assert.deepEqual(await page.evaluate(()=>{
      const menu=document.querySelector('#mobile-menu'),box=menu.getBoundingClientRect();
      return {bodyParent:menu.parentElement===document.body,rightAligned:Math.abs(box.right-innerWidth)<1,fullHeight:Math.abs(box.height-innerHeight)<1&&Math.abs(box.top)<1,width:box.width<=Math.min(innerWidth*.82,360)+1,dialog:menu.getAttribute('aria-modal')==='true',pageInert:document.querySelector('main').inert&&document.querySelector('#navbar').inert,focus:document.activeElement===document.querySelector('#mobile-menu-close'),transition:getComputedStyle(menu).transitionProperty==='transform'};
    }),{bodyParent:true,rightAligned:true,fullHeight:true,width:true,dialog:true,pageInert:true,focus:true,transition:true});
    const position=await page.evaluate(()=>scrollY);await page.mouse.move(5,200);await page.mouse.wheel(0,600);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>scrollY),position,'Backdrop blocks page scroll');
    const last=page.locator('#mobile-menu .mobile-link').last();await last.focus();await page.keyboard.press('Tab');assert.equal(await page.locator('#mobile-menu-close').evaluate(node=>node===document.activeElement),true);
    await page.keyboard.press('Shift+Tab');assert.equal(await last.evaluate(node=>node===document.activeElement),true);
    if(width===390)await page.screenshot({path:path.join(output,'drawer-390.png')});
    await page.keyboard.press('Escape');await wait(page);
    assert.equal(await page.locator('#mobile-menu').isVisible(),false);assert.equal(await page.locator('#hamburger-btn').evaluate(node=>node===document.activeElement),true);assert.equal(await page.locator('main').evaluate(node=>node.inert),false);
    await page.locator('#hamburger-btn').click();await wait(page);await page.locator('#mobile-menu-backdrop').click({position:{x:5,y:150}});await wait(page);assert.equal(await page.locator('#mobile-menu').isVisible(),false);
    await page.locator('#hamburger-btn').click();await wait(page);await page.locator('#mobile-menu-close').click();await wait(page);assert.equal(await page.locator('#mobile-menu').isVisible(),false);
  }
  await page.setViewportSize({width:390,height:844});await page.goto(origin,{waitUntil:'networkidle'});await page.locator('#hamburger-btn').click();await wait(page);
  await page.locator('#mobile-menu a[href="#contact"]').click();await wait(page);assert.equal(await page.locator('#mobile-menu').isVisible(),false);assert.ok(await page.evaluate(()=>scrollY)>0);
  await page.locator('#hamburger-btn').click();await wait(page);assert.equal(Math.round((await page.locator('#mobile-menu').boundingBox()).y),0,'Drawer stays at viewport top when header topbar is hidden');
  await page.setViewportSize({width:1024,height:900});await wait(page);assert.equal(await page.locator('#mobile-menu').isVisible(),false);assert.equal(await page.locator('#mobile-menu').evaluate(node=>node.parentElement.id==='navbar'),true);assert.equal(await page.locator('main').evaluate(node=>node.inert),false);
  await page.setViewportSize({width:390,height:844});await page.locator('#hamburger-btn').click();await wait(page);
  await page.evaluate(()=>{closeMenu();document.querySelector('#hamburger-btn').click();});await wait(page);
  assert.equal(await page.locator('#mobile-menu').isVisible(),true,'Reopening cancels the old close timer');assert.equal(await page.locator('main').evaluate(node=>node.inert),true);
  await page.keyboard.press('Escape');await wait(page);
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#hamburger-btn').click();assert.ok(await page.locator('#mobile-menu').evaluate(node=>parseFloat(getComputedStyle(node).transitionDuration))<=.001);await page.keyboard.press('Escape');await page.waitForTimeout(20);assert.equal(await page.locator('#mobile-menu').isVisible(),false);
  assert.deepEqual(errors,[]);console.log('PASS: Mobile services/contact columns have equal widths and aligned headings, Quick Links above; unchanged colors and desktop/tablet geometry, smooth right-side drawer, backdrop, scroll/focus containment, all close paths, anchor navigation, resize and reduced motion. English/Tagalog at six phone sizes; no external requests.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));});
