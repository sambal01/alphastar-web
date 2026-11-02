const fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('../.tmp/chat-browser-tools/node_modules/playwright-core');
const root=path.resolve(__dirname,'..');let server,browser;
(async()=>{
  server=http.createServer(async(req,res)=>{try{const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html';const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',({'.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404);res.end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const context=await browser.newContext({viewport:{width:393,height:900},reducedMotion:'reduce'}),chats=new Map(),requests=[],unexpected=[];
  await context.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin===origin)return route.continue();
    if(url.origin==='https://alphastar-mobile.onrender.com'&&url.pathname.startsWith('/api/support/chats')){
      requests.push({path:url.pathname,headers:request.headers(),method:request.method()});
      const respond=data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
      if(url.pathname==='/api/support/chats'&&request.method()==='POST'){
        const body=request.postDataJSON();assert.equal(body.consent,true);assert.deepEqual(Object.keys(body).sort(),['consent','email','name']);
        const id=crypto.randomBytes(32).toString('hex'),token=crypto.randomBytes(32).toString('hex'),conversation={id,provider:'alphastar',messages:[],before:''};
        chats.set(id,{token,conversation});return respond({id,token,expiresAt:Date.now()+86400000,conversation});
      }
      const id=url.pathname.split('/')[4],chat=chats.get(id);assert.ok(chat);assert.equal(request.headers()['x-alphastar-chat-token'],chat.token);
      if(request.method()==='POST'){const body=request.postDataJSON(),message={id:crypto.createHash('sha256').update(body.clientId).digest('hex'),sender:'visitor',text:body.text,time:'2026-11-02T02:00:00Z'};if(!chat.conversation.messages.some(row=>row.id===message.id))chat.conversation.messages.push(message);return respond({message});}
      return respond({conversation:chat.conversation});
    }
    if(/tawk/.test(url.hostname))unexpected.push(url.hostname);
    return route.abort();
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin,{waitUntil:'networkidle'});
  await page.locator('#fab-main').click();await page.waitForFunction(()=>!document.querySelector('#fab-menu').classList.contains('is-connecting'));
  await page.locator('#clinic-chat-input').fill('something completely unfamiliar');await page.locator('#clinic-chat-input').press('Enter');await page.waitForFunction(()=>document.querySelector('#clinic-chat-messages').getAttribute('aria-busy')==='false');
  await page.locator('#clinic-chat-topics').getByRole('button',{name:'Chat with staff',exact:true}).click();
  await page.locator('[name="name"]').fill('Synthetic Visitor');await page.locator('[name="email"]').fill('synthetic@example.test');await page.locator('.clinic-chat-support input[type="checkbox"]').check();
  await page.locator('.clinic-chat-support').getByRole('button',{name:'Open staff chat',exact:true}).click();
  await page.locator('.native-staff-chat').waitFor();assert.equal(page.url(),origin+'/');assert.equal(await page.locator('.native-chat-composer button').isDisabled(),true);
  await page.locator('.native-chat-composer textarea').fill('<script>Synthetic question</script>');await page.locator('.native-chat-composer button').click();
  await page.getByText('<script>Synthetic question</script>',{exact:true}).waitFor();assert.equal(await page.locator('.native-chat-log script').count(),0);
  const chat=[...chats.values()][0];chat.conversation.messages.push({id:'b'.repeat(64),sender:'staff',text:'Synthetic staff answer',time:'2026-11-02T02:01:00Z'});
  await page.getByText('Synthetic staff answer',{exact:true}).waitFor({timeout:7000});
  await page.locator('.native-chat-composer textarea').fill('Draft remains during updates');
  await page.waitForTimeout(3200);assert.equal(await page.locator('.native-chat-composer textarea').inputValue(),'Draft remains during updates');
  await fs.mkdir(path.join(root,'test-results/native-chat'),{recursive:true});
  for(const [width,height]of [[320,740],[393,900],[768,900],[1366,768]]){
    await page.setViewportSize({width,height});
    assert.equal(await page.evaluate(()=>{const panel=document.querySelector('#fab-menu'),chat=panel.querySelector('.native-staff-chat'),form=chat.querySelector('form');return panel.scrollWidth<=panel.clientWidth+1&&chat.scrollWidth<=chat.clientWidth+1&&form.scrollWidth<=form.clientWidth+1;}),true);
    await page.screenshot({path:path.join(root,'test-results/native-chat',width+'.png')});
  }
  await page.locator('.native-chat-back').click();assert.equal(await page.locator('.native-staff-chat').count(),0);
  await page.locator('.clinic-chat-support').getByRole('button',{name:'Open staff chat',exact:true}).click();await page.getByText('Synthetic staff answer',{exact:true}).waitFor();
  assert.equal(chats.size,1,'Reopening uses the existing private capability, not a new chat or email lookup');
  assert.deepEqual(unexpected,[]);assert.deepEqual(errors,[]);
  assert.ok(requests.every(request=>!request.path.includes(chat.token)));
  console.log('PASS: Native in-panel staff chat, saved visitor/staff messages, safe rendering, session resume, preserved drafts, no Tawk requests, four responsive widths.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));});
