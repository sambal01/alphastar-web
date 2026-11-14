"use strict";
// Stage only the verified 1.0.81 download and its matching public chat assets.
// Keep unrelated files, reset scripts, credentials and private build evidence out.
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),assert=require("node:assert/strict"),{execFileSync}=require("node:child_process");
const root=path.resolve(__dirname,".."),git=(args,input)=>execFileSync("git",args,{cwd:root,input,encoding:"utf8",windowsHide:true,maxBuffer:4*1024*1024});
assert.equal(git(["diff","--cached","--name-only"]).trim(),"","Preserve the user's existing index.");
assert.equal(git(["branch","--show-current"]).trim(),"main");assert.equal(git(["remote","get-url","origin"]).trim(),"https://github.com/sambal01/alphastar-web.git");
const release=JSON.parse(fs.readFileSync(path.join(root,"downloads/release.json"),"utf8"));assert.equal(release.version,"1.0.81");assert.equal(release.versionCode,82);
const verified=JSON.parse(fs.readFileSync(path.resolve(root,"../alphastar-mobile/.expo/apk82-verification.json"),"utf8"));
assert.equal(verified.version,release.version);assert.equal(verified.build,release.versionCode);assert.equal(verified.signatureVerified,true);assert.equal(verified.certificateMatchesPrevious,true);
const apk=fs.readFileSync(path.join(root,"downloads",release.filename));assert.equal(apk.length,release.sizeBytes);assert.equal(crypto.createHash("sha256").update(apk).digest("hex"),release.sha256);assert.equal(release.sha256,verified.sha256);
let html=git(["show","HEAD:index.html"]);const working=fs.readFileSync(path.join(root,"index.html"),"utf8");
for(const expression of [/<a class="app-download-btn android-download-btn"[^>]*>/,/<p class="download-release"[^>]*>[^<]*<\/p>/,/<link rel="stylesheet" href="assets\/css\/clinic-assistant\.css\?[^>]*>/,/<script src="assets\/js\/(?:site-config|human-chat|clinic-assistant|clinic-assistant-flow)\.js\?[^>]*><\/script>/g]){
 const before=html.match(expression),after=working.match(expression);assert.ok(before&&after&&before.length===after.length,"Required HTML release markers");before.forEach((value,index)=>{html=html.replace(value,after[index]);});
}
assert.ok(html.includes("downloads/"+release.filename));
const blob=git(["hash-object","-w","--stdin"],html).trim();git(["update-index","--cacheinfo","100644,"+blob+",index.html"]);
const files=["assets/js/site-config.js","assets/css/clinic-assistant.css","assets/js/human-chat.js","assets/js/clinic-assistant.js","assets/js/clinic-assistant-flow.js","downloads/release.json","downloads/"+release.filename,"downloads/"+release.filename+".sha256","docs/android-release-1.0.81.md","test/android-download-release.test.cjs","test/inline-feedback-layout.cjs","scripts/stage-pdf-download-release.cjs"];
git(["add","--",...files]);const staged=git(["diff","--cached","--name-only"]).trim().split(/\r?\n/);assert.ok(staged.every(file=>file==="index.html"||files.includes(file)));git(["diff","--cached","--check"]);
console.log(JSON.stringify({staged,version:release.version,build:release.versionCode,unrelatedLocalFilesPreserved:true},null,2));
