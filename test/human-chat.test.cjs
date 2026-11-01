const test = require('node:test'), assert = require('node:assert/strict'), vm = require('node:vm'), fs = require('node:fs'), path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'../assets/js/human-chat.js'),'utf8');
function fixture({failure = false} = {}) {
  const requests = [], logins = [], scripts = []; let closed = 0;
  const api = {hideWidget(){},showWidget(){},maximize(){},login(data,done){logins.push(data);done();},start(){api.onLoad();}};
  const window = {Tawk_API:api,closeFab(){closed++;}};
  const context = vm.createContext({window,document:{createElement:()=>({remove(){}}),head:{appendChild(script){scripts.push(script);queueMicrotask(()=>api.onBeforeLoad());}}},AbortController,setTimeout,clearTimeout,
    fetch:async (url,options)=>{requests.push({url,options});return {ok:!failure,json:async()=>({userId:'website_guest_'+String(requests.length).repeat(48),hash:'a'.repeat(64),name:'Synthetic Visitor',email:'synthetic@example.test'})};}});
  vm.runInContext(source,context);
  return {open:window.AlphastarHumanChat.open,requests,logins,scripts,closed:()=>closed};
}
test('Tawk remains unloaded until a visitor explicitly consents to staff chat',async()=>{
  const f=fixture();assert.equal(f.requests.length,0);assert.equal(f.scripts.length,0);
  await assert.rejects(()=>f.open({name:'Synthetic',email:'synthetic@example.test',consent:false})); assert.equal(f.requests.length,0);
});
test('staff chat signs a new guest identity without sending the bot transcript or a patient identifier',async()=>{
  const f=fixture();await f.open({name:'Synthetic',email:'synthetic@example.test',consent:true,transcript:'Private bot conversation',userId:'patient-id'});
  assert.equal(f.requests.length,1);assert.deepEqual(JSON.parse(f.requests[0].options.body),{name:'Synthetic',email:'synthetic@example.test',consent:true});
  assert.match(f.scripts[0].src,/^https:\/\/embed\.tawk\.to\//);assert.match(f.logins[0].userId,/^website_guest_/);assert.equal(f.closed(),1);
  assert.doesNotMatch(JSON.stringify(f.requests),/Private bot|patient-id/);
});
test('a different website identity cannot reuse an earlier visitor login, even with the same email',async()=>{
  const f=fixture();await f.open({name:'Synthetic One',email:'synthetic@example.test',consent:true});await f.open({name:'Synthetic Two',email:'synthetic@example.test',consent:true});
  assert.notEqual(f.logins[0].userId,f.logins[1].userId);assert.equal(f.scripts.length,1);
});
test('a backend/configuration failure does not open anonymous or unverified staff chat',async()=>{
  const f=fixture({failure:true});await assert.rejects(()=>f.open({name:'Synthetic',email:'synthetic@example.test',consent:true}));assert.equal(f.logins.length,0);assert.equal(f.scripts.length,0);
});
