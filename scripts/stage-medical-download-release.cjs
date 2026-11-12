"use strict";
// Stage the verified APK download only; keep unrelated website/chat edits local.
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),assert=require("node:assert/strict"),{execFileSync}=require("node:child_process");
const root=path.resolve(__dirname,".."),git=(args,input)=>execFileSync("git",args,{cwd:root,input,encoding:"utf8",windowsHide:true,maxBuffer:4*1024*1024});
assert.equal(git(["diff","--cached","--name-only"]).trim(),"","Preserve existing staged changes.");
assert.equal(git(["branch","--show-current"]).trim(),"main");assert.equal(git(["remote","get-url","origin"]).trim(),"https://github.com/sambal01/alphastar-web.git");
const release=JSON.parse(fs.readFileSync(path.join(root,"downloads/release.json"),"utf8"));assert.equal(release.version,"1.0.80");assert.equal(release.versionCode,81);
const apk=fs.readFileSync(path.join(root,"downloads",release.filename));assert.equal(apk.length,release.sizeBytes);assert.equal(crypto.createHash("sha256").update(apk).digest("hex"),release.sha256);
const source=JSON.parse(fs.readFileSync(path.resolve(root,"../alphastar-mobile/.expo/apk81-verification.json"),"utf8"));assert.equal(source.signatureVerified,true);assert.equal(source.certificateMatchesPrevious,true);assert.equal(source.sha256,release.sha256);
let html=git(["show","HEAD:index.html"]);const working=fs.readFileSync(path.join(root,"index.html"),"utf8").replace(/\r\n/g,"\n");
for(const expression of [/<a class="app-download-btn android-download-btn"[^>]*>/,/<p class="download-release"[^>]*>[^<]*<\/p>/,/<script src="assets\/js\/site-config\.js\?[^>]*><\/script>/]){
  const before=html.match(expression),after=working.match(expression);assert.ok(before&&after);html=html.replace(before[0],after[0]);
}
assert.ok(html.includes("downloads/"+release.filename));
assert.ok(!html.includes("20261111-staff-copy"),"Unrelated staff-chat cache changes must stay local.");
const blob=git(["hash-object","-w","--stdin"],html).trim();git(["update-index","--cacheinfo","100644,"+blob+",index.html"]);
const files=["assets/js/site-config.js","downloads/release.json","downloads/"+release.filename,"downloads/"+release.filename+".sha256","docs/android-release-1.0.80.md","test/android-download-release.test.cjs","scripts/stage-medical-download-release.cjs"];
git(["add","--",...files]);const staged=git(["diff","--cached","--name-only"]).trim().split(/\r?\n/);assert.ok(staged.every(file=>file==="index.html"||files.includes(file)));git(["diff","--cached","--check"]);
console.log(JSON.stringify({staged,unrelatedWebsiteEditsPreserved:true,verifiedVersion:release.version,verifiedBuild:release.versionCode}));
