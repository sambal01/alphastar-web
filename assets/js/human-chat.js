(function(){
  "use strict";
  const base="https://alphastar-mobile.onrender.com/api/support/chats",storageKey="alphastar-staff-chat-v1";
  let session=null,timer,epoch=0,busy=false,reading=false,pending=null,rows=[],before="",view,log,status,input,send,hidden=[];
  const valid=value=>/^[a-f0-9]{64}$/.test(value||"");
  const localized=(english,tagalog)=>window.alphastarChat?.getLanguage()==="tl"?tagalog:english;
  const merge=next=>{rows=[...new Map([...rows,...next].map(row=>[row.id,row])).values()].sort((a,b)=>a.time.localeCompare(b.time)||a.id.localeCompare(b.id));};
  async function request(path,body,credentials=session){
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
    try{
      const response=await fetch(base+path,{method:body===undefined?"GET":"POST",headers:{"Content-Type":"application/json",...(credentials?{"X-Alphastar-Chat-Token":credentials.token}:{})},credentials:"omit",signal:controller.signal,...(body===undefined?{}:{body:JSON.stringify(body)})});
      const data=await response.json();if(!response.ok)throw Object.assign(Error(response.status===401?"This chat session expired. Go back and open a new staff chat.":"Unable to connect. Please retry."),{status:response.status});return data;
    }finally{clearTimeout(timeout);}
  }
  function close(){
    epoch++;clearInterval(timer);timer=null;view?.remove();view=null;busy=false;reading=false;
    for(const [node,display]of hidden)node.style.display=display;hidden=[];
  }
  function paint(){
    if(!log)return;const bottom=log.scrollHeight-log.scrollTop-log.clientHeight<80,top=log.scrollTop;
    log.replaceChildren();
    if(before){const button=document.createElement("button");button.type="button";button.className="clinic-chat-topic";button.textContent=localized("Earlier messages","Mga naunang mensahe");button.addEventListener("click",()=>void read(before));log.appendChild(button);}
    if(!rows.length){const empty=document.createElement("p");empty.className="native-chat-empty";empty.textContent=localized("Send a message to clinic staff.","Magpadala ng mensahe sa clinic staff.");log.appendChild(empty);}
    for(const row of rows){
      const bubble=document.createElement("div");bubble.className="native-chat-message"+(row.sender==="visitor"?" is-mine":"");
      const name=document.createElement("strong");name.textContent=row.sender==="staff"?localized("Clinic staff","Clinic staff"):localized("You","Ikaw");
      const text=document.createElement("p");text.textContent=row.text;
      const time=document.createElement("time");time.textContent=new Date(row.time).toLocaleString("en-PH",{timeZone:"Asia/Manila",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});
      bubble.append(name,text,time);log.appendChild(bubble);
    }
    log.scrollTop=bottom?log.scrollHeight:top;
  }
  async function read(older=""){
    if(reading||!view||document.hidden||document.querySelector("#fab-menu")?.hidden)return;
    const current=epoch,identity=session;reading=true;
    try{const data=await request("/"+identity.id+(older?"?before="+encodeURIComponent(older):""),undefined,identity);if(current!==epoch)return;merge(data.conversation.messages||[]);if(older)before=data.conversation.before||"";status.textContent="";paint();}
    catch(error){if(current===epoch)status.textContent=error.message;}
    finally{if(current===epoch)reading=false;}
  }
  async function sendMessage(event){
    event.preventDefault();const text=input.value.trim();if(!text||busy||!session)return;
    const current=epoch,identity=session;
    const attempt=pending?.text===text&&pending?.chat===identity.id?pending:{text,chat:identity.id,id:crypto.randomUUID()};
    pending=attempt;busy=true;send.disabled=true;input.disabled=true;status.textContent="";
    try{const data=await request("/"+identity.id+"/messages",{text,clientId:attempt.id},identity);if(current!==epoch)return;merge([data.message]);input.value="";pending=null;paint();}
    catch{if(current===epoch)status.textContent=localized("Message not confirmed. Tap Send to retry.","Hindi pa nakumpirma. Pindutin ang Send para subukan muli.");}
    finally{if(current===epoch){busy=false;input.disabled=false;send.disabled=!input.value.trim();input.focus();}}
  }
  async function open({name,email,consent}){
    name=String(name||"").trim();email=String(email||"").trim().toLowerCase();
    if(!consent||!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error("Enter your name and email and agree to staff chat.");
    close();const current=epoch;
    let candidate=session;
    try{const saved=JSON.parse(sessionStorage.getItem(storageKey)||"null");candidate=valid(saved?.id)&&valid(saved?.token)&&saved.expiresAt>Date.now()&&saved.name===name&&saved.email===email?saved:null;}catch{if(candidate?.name!==name||candidate?.email!==email||candidate?.expiresAt<=Date.now())candidate=null;}
    let data;
    if(candidate){
      try{data=await request("/"+candidate.id,undefined,candidate);}catch(error){if(![401,404].includes(error.status))throw error;candidate=null;}
    }
    if(!candidate){data=await request("",{name,email,consent:true},null);candidate={id:data.id,token:data.token,expiresAt:data.expiresAt,name,email};if(!valid(candidate.id)||!valid(candidate.token))throw Error("Staff chat needs a clinic server update.");}
    if(current!==epoch)return;
    session=candidate;try{sessionStorage.setItem(storageKey,JSON.stringify(session));}catch{}
    const panel=document.getElementById("fab-menu");if(!panel)throw Error("Chat panel unavailable.");
    rows=data.conversation.messages||[];before=data.conversation.before||"";pending=null;
    view=document.createElement("section");view.className="native-staff-chat";view.setAttribute("aria-label","Clinic staff conversation");
    const header=document.createElement("header"),title=document.createElement("strong"),back=document.createElement("button");
    title.textContent=localized("Clinic staff","Clinic staff");back.type="button";back.className="native-chat-back";back.textContent=localized("Back","Bumalik");back.addEventListener("click",close);header.append(title,back);
    log=document.createElement("div");log.className="native-chat-log";log.setAttribute("role","log");log.setAttribute("aria-label","Staff messages");
    status=document.createElement("p");status.className="native-chat-status";status.setAttribute("role","status");
    const form=document.createElement("form");form.className="native-chat-composer";
    input=document.createElement("textarea");input.maxLength=2000;input.rows=1;input.placeholder=localized("Type your message…","I-type ang mensahe…");input.setAttribute("aria-label","Message for clinic staff");
    send=document.createElement("button");send.type="submit";send.textContent=localized("Send","Ipadala");send.disabled=true;
    input.addEventListener("input",()=>{send.disabled=busy||!input.value.trim();});
    input.addEventListener("keydown",event=>{if(event.key==="Enter"&&!event.shiftKey&&!event.isComposing){event.preventDefault();form.requestSubmit();}});
    form.append(input,send);form.addEventListener("submit",event=>void sendMessage(event));view.append(header,log,status,form);
    for(const id of ["clinic-chat-body","clinic-chat-form","clinic-chat-status"]){const node=document.getElementById(id);if(node){hidden.push([node,node.style.display]);node.style.display="none";}}
    panel.appendChild(view);paint();input.focus();timer=setInterval(()=>void read(),3000);
  }
  window.AlphastarHumanChat=Object.freeze({open,close});
})();
