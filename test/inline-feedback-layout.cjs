// Isolated synthetic conversation only; never contact the live chat backend.
const fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('../.tmp/chat-browser-tools/node_modules/playwright-core');
const root=path.resolve(__dirname,'..');let server,browser;
(async()=>{
 const css=await fs.readFile(path.join(root,'assets/css/clinic-assistant.css'),'utf8'),script=await fs.readFile(path.join(root,'assets/js/human-chat.js'),'utf8');
 const html=`<!doctype html><html><meta charset="utf-8"><style>${css}body{margin:0;font:14px Arial;background:#dff7ef;padding:16px;box-sizing:border-box}#fab-menu{height:620px;max-height:calc(100vh - 32px);width:100%;max-width:420px;margin:auto;display:flex;flex-direction:column;background:white}.native-staff-chat{height:100%}</style><div id="fab-menu"><div id="bot">Main menu</div></div><script>window.alphastarChat={getLanguage:()=> 'en',showMainMenu:()=>window.finished=true};Date.now=()=>Date.parse('2026-11-14T02:00:00Z');</script><script>${script}</script></html>`;
 server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end(html);});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 for(const width of [320,390,820]){
  const page=await browser.newPage({viewport:{width,height:760}}),errors=[],ends=[];
  page.on('pageerror',error=>errors.push(error.message));
  const conversation={id:'a'.repeat(64),provider:'alphastar',status:'connected',cycle:1,visitorName:'Synthetic Patient',messages:[{id:'question',sender:'visitor',name:'Synthetic Patient',text:'Synthetic original question',time:'2026-11-14T01:59:00Z'},{id:'reply',sender:'staff',name:'Sample Staff',text:'Synthetic original reply',time:'2026-11-14T02:00:00Z'}]};
  await page.route('https://alphastar-mobile.onrender.com/api/support/chats**',async route=>{
   const req=route.request(),url=new URL(req.url());let body;
   if(url.pathname.endsWith('/end')){body=req.postDataJSON();ends.push(body);conversation.status='ended';}
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({id:conversation.id,token:'b'.repeat(64),conversation})});
  });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.evaluate(()=>window.AlphastarHumanChat.open({name:'Synthetic Patient',email:'synthetic@example.invalid',consent:true}));
  await page.getByRole('button',{name:'End conversation',exact:true}).click();
  assert.equal(await page.locator('.native-chat-log').isVisible(),true);
  assert.equal(await page.locator('.native-chat-log > .native-chat-feedback').count(),1);
  assert.equal(await page.getByText('Synthetic original reply',{exact:true}).count(),1);
  assert.equal(await page.getByText('Synthetic original question',{exact:true}).count(),1);
  assert.equal(await page.locator('.native-chat-feedback').getByText('Alphastar Support (System Message)',{exact:true}).count(),1);
  await page.getByRole('textbox',{name:'Feedback comment',exact:true}).fill('Synthetic optional feedback');
  const layout=await page.locator('.native-chat-feedback-actions').evaluate(el=>[...el.children].map(x=>({width:x.getBoundingClientRect().width,top:x.getBoundingClientRect().top})));
  assert.ok(Math.abs(layout[0].width-layout[1].width)<1);assert.equal(layout[0].top,layout[1].top);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await fs.mkdir(path.join(root,'test-results/inline-feedback'),{recursive:true});
  await page.screenshot({path:path.join(root,`test-results/inline-feedback/${width}.png`)});
  await page.getByRole('button',{name:'Continue conversation',exact:true}).click();assert.equal(await page.locator('.native-chat-composer textarea').isVisible(),true);assert.equal(ends.length,0);
  await page.getByRole('button',{name:'End conversation',exact:true}).click();await page.getByRole('button',{name:'Submit feedback',exact:true}).click();
  await page.waitForFunction(()=>window.finished===true);assert.equal(ends.length,1);assert.equal(ends[0].comment,'Synthetic optional feedback');assert.equal(ends[0].rating,null);assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('PASS: Inline feedback retains the transcript, equal buttons, optional comment, Continue and confirmed End at 320, 390 and 820 px.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));});
