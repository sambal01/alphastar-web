const fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('../.tmp/chat-browser-tools/node_modules/playwright-core');
const root=path.resolve(__dirname,'..');let server,browser;
(async()=>{

  const chats=new Map(),requests=[],unexpected=[];
  let releaseCreate,holdCreate=true,number=0;
  const add=(chat,sender,text,name)=>chat.conversation.messages.push({id:crypto.randomBytes(32).toString('hex'),sender,text,name:name|| (sender==='system'?'System':'Synthetic Visitor'),time:new Date(Date.parse('2026-11-02T02:00:00Z')+number++*1000).toISOString()});
  async function handleChat(url,body,headers,respond,method){
    requests.push({path:url.pathname,headers,method});
    if(url.pathname==='/api/support/chats'&&method==='POST'){
      assert.equal(body.consent,true);assert.deepEqual(Object.keys(body).sort(),['consent','email','name']);
      if(holdCreate)await new Promise(resolve=>{releaseCreate=resolve;});
      const id=crypto.randomBytes(32).toString('hex'),token=crypto.randomBytes(32).toString('hex'),chat={token,conversation:{id,provider:'alphastar',status:'welcome',cycle:1,visitorName:body.name,messages:[],before:''}};
      add(chat,'system','Hello! 👋 Welcome to AlphaStar Clinic Support. Would you like to connect with a support assistant?');
      chats.set(id,chat);return respond({id,token,conversation:chat.conversation});
    }
    const parts=url.pathname.split('/'),id=parts[4],chat=chats.get(id),action=parts[5];assert.ok(chat);
    assert.equal(action==='exit'?body.token:headers['x-alphastar-chat-token'],chat.token);
    if(action==='request'){
      assert.equal(body.cycle,1);chat.conversation.status='waiting';
      add(chat,'visitor','Yes, connect me to support');add(chat,'system','Thank you! 😊 We’ve received your request. During busy periods, replies may take 24 hours or longer.');
    }else if(action==='messages'){
      assert.equal(body.cycle,1);assert.ok(['waiting','connected'].includes(chat.conversation.status));
      const id=crypto.createHash('sha256').update(body.clientId).digest('hex'),message={id,sender:'visitor',text:body.text,name:'Synthetic Visitor',time:new Date(Date.parse('2026-11-02T02:01:00Z')+number++*1000).toISOString()};
      if(!chat.conversation.messages.some(row=>row.id===id))chat.conversation.messages.push(message);
      return respond({message});
    }else if(action==='end'){
      assert.equal(body.rating,'up');assert.equal(body.comment,'Synthetic helpful support');chat.feedback=body;chat.conversation.status='ended';add(chat,'system','This conversation has ended.');
    }else if(action==='exit'){chat.conversation.status='ended';}
    return respond(action==='heartbeat'||action==='exit'?{ok:true}:{conversation:chat.conversation});
  }
  server=http.createServer(async(req,res)=>{try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname.startsWith('/api/support/chats')){
      let raw='';for await(const chunk of req)raw+=chunk;
      return await handleChat(url,raw?JSON.parse(raw):undefined,req.headers,data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));},req.method);
    }
    const relative=decodeURIComponent(url.pathname).slice(1)||'index.html',file=path.resolve(root,relative);
    if(!file.startsWith(root+path.sep))throw Error();
    res.setHeader('Content-Type',({'.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8'})[path.extname(file)]||'application/octet-stream');
    let content=await fs.readFile(file);
    // Route only this test's API traffic to its local synthetic HTTP server.
    // Using real HTTP also exercises pagehide/beacon delivery during reload.
    if(relative==='assets/js/human-chat.js')content=content.toString().replace('https://alphastar-mobile.onrender.com/api/support/chats','http://'+req.headers.host+'/api/support/chats');
    res.end(content);
  }catch(error){res.writeHead(500);res.end('Synthetic server failure');console.error(error);}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const context=await browser.newContext({viewport:{width:393,height:900},reducedMotion:'reduce'});
  await context.route('https://**/*',async route=>{
    const url=new URL(route.request().url());if(url.origin===origin)return route.continue();
    if(/tawk/.test(url.hostname))unexpected.push(url.hostname);
    return route.abort();
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin,{waitUntil:'networkidle'});
  await page.locator('#fab-main').click();await page.waitForFunction(()=>!document.querySelector('#fab-menu').classList.contains('is-connecting'));
  assert.equal(await page.evaluate(()=>document.body.classList.contains('chat-page-locked')),true);
  assert.equal(await page.evaluate(()=>document.elementFromPoint(10,10).classList.contains('chat-page-shield')),true);
  const scroll=await page.evaluate(()=>scrollY);await page.mouse.move(10,10);await page.mouse.wheel(0,600);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>scrollY),scroll);
  await page.locator('#clinic-chat-input').fill('something completely unfamiliar');await page.locator('#clinic-chat-input').press('Enter');await page.waitForFunction(()=>document.querySelector('#clinic-chat-messages').getAttribute('aria-busy')==='false');
  await page.locator('#clinic-chat-topics').getByRole('button',{name:'Chat with staff',exact:true}).click();
  await page.locator('[name="name"]').fill('Synthetic Visitor');await page.locator('[name="email"]').fill('synthetic@example.test');await page.locator('.clinic-chat-support input[type="checkbox"]').check();
  await page.locator('.clinic-chat-support').getByRole('button',{name:'Open staff chat',exact:true}).click();
  await page.locator('.native-chat-loading').waitFor();
  assert.equal(await page.locator('.native-chat-log').isVisible(),false);assert.equal(await page.locator('.clinic-chat-support').isVisible(),false);
  await page.waitForFunction(()=>!!document.querySelector('.native-chat-loading'));while(!releaseCreate)await new Promise(resolve=>setTimeout(resolve,10));
  holdCreate=false;releaseCreate();
  await page.getByRole('button',{name:'Yes, connect me to support',exact:true}).click();
  await page.locator('.native-chat-composer textarea').waitFor();
  assert.equal(await page.locator('.native-staff-chat > header').textContent(),'BackEnd conversation');
  assert.equal(page.url(),origin+'/');assert.equal(await page.locator('.native-chat-composer button').isDisabled(),true);
  await page.locator('.native-chat-composer textarea').fill('<script>Synthetic question</script>');await page.locator('.native-chat-composer button').click();
  await page.getByText('<script>Synthetic question</script>',{exact:true}).waitFor();assert.equal(await page.locator('.native-chat-log script').count(),0);
  const firstId=[...chats.keys()][0],chat=chats.get(firstId);
  await page.locator('.native-chat-composer textarea').fill('Draft remains while staff connect');
  chat.conversation.status='connected';add(chat,'staff','Synthetic staff answer','Synthetic <Staff>');
  await page.getByText('Synthetic staff answer',{exact:true}).waitFor({timeout:7000});
  assert.equal(await page.locator('.native-chat-composer textarea').inputValue(),'Draft remains while staff connect');
  assert.equal(await page.locator('.native-chat-log strong').getByText('Synthetic <Staff>',{exact:true}).count(),1);
  assert.equal(await page.locator('.native-chat-log strong img').count(),0);
  await fs.mkdir(path.join(root,'test-results/native-chat'),{recursive:true});
  for(const [width,height]of [[320,740],[393,900],[768,900],[1366,768]]){
    await page.setViewportSize({width,height});
    assert.equal(await page.evaluate(()=>{const panel=document.querySelector('#fab-menu'),chat=panel.querySelector('.native-staff-chat'),form=chat.querySelector('form');return panel.scrollWidth<=panel.clientWidth+1&&chat.scrollWidth<=chat.clientWidth+1&&form.scrollWidth<=form.clientWidth+1;}),true);
    await page.screenshot({path:path.join(root,'test-results/native-chat',width+'.png')});
  }
  await page.getByRole('button',{name:'End conversation',exact:true}).click();
  const finish=page.locator('.native-chat-feedback').getByRole('button',{name:'End conversation',exact:true});assert.equal(await finish.isDisabled(),true);
  await page.getByRole('button',{name:'Helpful',exact:true}).click();await page.getByRole('textbox',{name:'Feedback comment',exact:true}).fill('Synthetic helpful support');
  for(const width of [320,393,1366]){await page.setViewportSize({width,height:width===1366?768:740});assert.equal(await page.evaluate(()=>{const box=document.querySelector('#fab-menu');return box.scrollWidth<=box.clientWidth+1;}),true);await page.screenshot({path:path.join(root,'test-results/native-chat','feedback-'+width+'.png')});}
  await finish.click();await page.getByText('Conversation ended',{exact:true}).waitFor();
  assert.equal(chat.conversation.status,'ended');assert.equal(await page.locator('.native-chat-composer textarea').count(),0);
  await page.locator('.native-staff-chat > header').getByRole('button',{name:'Back',exact:true}).click();
  await page.locator('.clinic-chat-support').getByRole('button',{name:'Open staff chat',exact:true}).click();
  await page.getByRole('button',{name:'Yes, connect me to support',exact:true}).waitFor();
  assert.equal(chats.size,2);assert.equal(await page.getByText('Synthetic staff answer',{exact:true}).count(),0);
  await page.getByRole('button',{name:'Yes, connect me to support',exact:true}).click();await page.locator('.native-chat-composer').waitFor();
  const second=[...chats.values()][1];
  await page.locator('#clinic-chat-close').click();await page.waitForTimeout(150);
  assert.equal(second.conversation.status,'ended');assert.equal(await page.evaluate(()=>document.body.classList.contains('chat-page-locked')),false);
  await page.locator('#fab-main').click();await page.waitForFunction(()=>!document.querySelector('#fab-menu').classList.contains('is-connecting'));
  await page.locator('.clinic-chat-support').getByRole('button',{name:'Open staff chat',exact:true}).click();
  await page.getByRole('button',{name:'Yes, connect me to support',exact:true}).click();await page.locator('.native-chat-composer').waitFor();
  const third=[...chats.values()][2];
  await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(150);assert.equal(third.conversation.status,'ended');
  assert.equal(await page.locator('.native-staff-chat').count(),0);assert.equal(await page.evaluate(()=>sessionStorage.getItem('alphastar-staff-chat-v1')),null);
  assert.deepEqual(unexpected,[]);assert.deepEqual(errors,[]);assert.ok(requests.every(request=>![...chats.values()].some(chat=>request.path.includes(chat.token))));
  console.log('PASS: Welcome, explicit support request, safe named messages, stable draft on connection, feedback/end, fresh guest sessions, exit/reload ending, loading-only state, landing-page lock, no Tawk requests and four responsive widths.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));});
