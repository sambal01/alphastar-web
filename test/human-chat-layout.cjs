const fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('../.tmp/chat-browser-tools/node_modules/playwright-core');
const root=path.resolve(__dirname,'..');let server,browser;
(async()=>{
  server=http.createServer(async(req,res)=>{try{const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html';const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404);res.end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const context=await browser.newContext({viewport:{width:393,height:900},reducedMotion:'reduce'});await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto(origin,{waitUntil:'networkidle'});
  await page.locator('#fab-main').click();await page.waitForFunction(()=>!document.querySelector('#fab-menu').classList.contains('is-connecting'));
  await page.locator('#clinic-chat-input').fill('something completely unfamiliar');await page.locator('#clinic-chat-input').press('Enter');await page.waitForFunction(()=>document.querySelector('#clinic-chat-messages').getAttribute('aria-busy')==='false');
  await page.locator('#clinic-chat-topics').getByRole('button',{name:'Chat with staff',exact:true}).click();
  await page.evaluate(()=>{window.__chatOpens=[];window.AlphastarHumanChat={open:async details=>window.__chatOpens.push(details)};});
  for(const [width,height] of [[320,740],[393,900],[768,900],[1366,768]]){
    await page.setViewportSize({width,height});
    assert.equal(await page.evaluate(()=>{const panel=document.querySelector('#fab-menu'),form=panel.querySelector('.clinic-chat-support');return panel.scrollWidth<=panel.clientWidth&&[...form.querySelectorAll('input')].every(node=>node.type==='checkbox'||node.getBoundingClientRect().width<=form.getBoundingClientRect().width+1);}),true);
  }
  await page.locator('[name="name"]').fill('Synthetic Visitor');await page.locator('[name="email"]').fill('synthetic@example.test');await page.locator('.clinic-chat-support input[type="checkbox"]').check();
  await page.locator('.clinic-chat-support').getByRole('button',{name:'Open staff chat',exact:true}).click();
  assert.deepEqual(await page.evaluate(()=>window.__chatOpens),[{name:'Synthetic Visitor',email:'synthetic@example.test',consent:true}]);assert.deepEqual(errors,[]);
  console.log('PASS: First unknown answer offers human staff, explicit name/email consent, safe opening and four form widths. No external requests or messages.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));});
