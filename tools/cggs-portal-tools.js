(function(){
if(location.hostname!='portals.veracross.au'){alert('Open a CGGS portal page on portals.veracross.au first, then click CGGS Portal Tools.');return}
var old=document.getElementById('vpt');if(old){old.remove();return}
var YEARS=['parent','faculty','student'];
var NAME={parent:'Parent',faculty:'Staff',student:'Student',content_portal:'Future Parents',alumni:'Alumni',admissions:'Admissions'};
var PICK=['system_access_name','reload_keypaths','type_description','endpoints','component_type_fk','layout_region_index','layout_region_sort_key','width'];
var YP='(reception|pre-kindergarten|kindergarten|year-\\d+|boarding-house)';
/* Pages that also have a copy in the Future Parents portal (content_portal) */
var FUT='(school-policies|policy-area-governance|policy-area-student-duty-of-care|policy-area-teaching-learning|policy-area-elc|policy-area-oshc|cygnus-[a-z-]+|middle-years-programme|year-10-handbook|senior-phase-of-learning|senior-school-handbook|junior-school-handbook|oshc|student-recognition-awards|reception|pre-kindergarten|kindergarten|year-\\d+|boarding-house)';
var REPO='CGGS-ACT/veracross-portal-styles';
var CDN='https://cdn.jsdelivr.net/gh/'+REPO+'@';
var PAGES=["faculty/boarding-house","faculty/home","faculty/human-resources","faculty/junior-school-elc","faculty/kindergarten","faculty/pastoral-care","faculty/policies-hub","faculty/policy-area-boarding","faculty/policy-area-elc","faculty/policy-area-enrolments-advancement","faculty/policy-area-finance","faculty/policy-area-governance","faculty/policy-area-ict","faculty/policy-area-oshc","faculty/policy-area-people","faculty/policy-area-privacy-data-records","faculty/policy-area-student-duty-of-care","faculty/policy-area-teaching-learning","faculty/policy-area-whs","faculty/pre-kindergarten","faculty/professional-learning","faculty/reception","faculty/senior-school-teaching-learning","faculty/tours-excursions","faculty/year-1","faculty/year-10","faculty/year-11","faculty/year-12","faculty/year-2","faculty/year-3","faculty/year-7","faculty/year-8","faculty/year-9","parent/boarding-house","parent/cygnus-academic-enrichment","parent/cygnus-clubs-activities","parent/cygnus-debating-public-speaking","parent/cygnus-music-academy","parent/cygnus-outdoor-education","parent/cygnus-performing-arts","parent/cygnus-service-learning","parent/cygnus-sport","parent/cygnus-the-house","parent/elc-junior-school","parent/home","parent/junior-school-handbook","parent/kindergarten","parent/middle-years-programme","parent/policy-area-governance","parent/policy-area-student-duty-of-care","parent/policy-area-teaching-learning","parent/pre-kindergarten","parent/reception","parent/school-policies","parent/senior-phase-of-learning","parent/senior-school-handbook","parent/senior-school-information","parent/year-1","parent/year-10","parent/year-10-handbook","parent/year-11","parent/year-12","parent/year-2","parent/year-3","parent/year-7","parent/year-8","parent/year-9","student/boarding-house","student/student-home","student/kindergarten","student/pre-kindergarten","student/reception","student/year-1","student/year-10","student/year-11","student/year-12","student/year-2","student/year-3","student/year-7","student/year-8","student/year-9","student/school-policies","admissions/home","alumni/home","content_portal/home","content_portal/elc-junior-school-information","content_portal/senior-school-information","content_portal/cygnus","content_portal/school-policies","content_portal/policy-area-governance","content_portal/policy-area-student-duty-of-care","content_portal/policy-area-teaching-learning","content_portal/policy-area-elc","content_portal/policy-area-oshc","content_portal/cygnus-academic-enrichment","content_portal/cygnus-clubs-activities","content_portal/cygnus-debating-public-speaking","content_portal/cygnus-music-academy","content_portal/cygnus-outdoor-education","content_portal/cygnus-performing-arts","content_portal/cygnus-service-learning","content_portal/cygnus-sport","content_portal/cygnus-the-house","content_portal/year-7","content_portal/middle-years-programme","content_portal/year-10-handbook","content_portal/senior-phase-of-learning","content_portal/senior-school-handbook","content_portal/junior-school-handbook","parent/oshc","parent/student-recognition-awards","content_portal/oshc","content_portal/student-recognition-awards","content_portal/reception","content_portal/pre-kindergarten","content_portal/kindergarten","content_portal/year-1","content_portal/year-2","content_portal/year-3","content_portal/year-8","content_portal/year-9","content_portal/year-10","content_portal/year-11","content_portal/year-12","content_portal/boarding-house"];
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function isYear(p){return new RegExp('^'+YP+'$').test(p)}
function isFut(p){return new RegExp('^'+FUT+'$').test(p)}
/* Which portals hold a copy of this page */
function group(page){var g=[];if(isYear(page))g=YEARS.slice();else if(isFut(page))g=['parent'];if(isFut(page))g.push('content_portal');return g}
function toParent(t,S){
 if(S=='parent')return t;
 if(S=='content_portal'){
  t=t.replace(/href=(.?)https:\/\/www\.cggs\.act\.edu\.au\/student-life\/term-dates#vccal\1 target=.?_blank.?([^>]*)>Term dates/g,'href=$1/cggs_act/parent/calendar/school$1$2>School calendar');
  t=t.replace(new RegExp('(https://portals\\.veracross\\.au)?/cggs_act/content_portal/pages/'+FUT+'(?=["\'#?])','g'),'$1/cggs_act/parent/pages/$2');
  t=t.replace(/href=(.?)(https:\/\/portals\.veracross\.au)?\/cggs_act\/content_portal\/?(?=["'])/g,'href=$1/cggs_act/parent');
  return t}
 t=t.replace(new RegExp('(https://portals\\.veracross\\.au)?/cggs_act/'+S+'/calendar','g'),'/cggs_act/parent/calendar');
 t=t.replace(new RegExp('href=(.?)(https://portals\\.veracross\\.au)?/cggs_act/'+S+'/?(?=["\'])','g'),'href=$1/cggs_act/parent');
 t=t.replace(new RegExp('(https://portals\\.veracross\\.au)?/cggs_act/'+S+'/pages/'+YP+'(?=["\'#?])','g'),'$1/cggs_act/parent/pages/$2');
 if(S=='faculty')t=t.replace(/(https:\/\/portals\.veracross\.au)?\/cggs_act\/faculty\/pages\/junior-school-elc/g,'$1/cggs_act/parent/pages/junior-school-handbook');
 return t}
function fromParent(t,P){
 t=t.replace(/<a\b[^>]*>/g,function(m){return /href=["'](https:\/\/portals\.veracross\.au|\/cggs_act)/.test(m)?m.replace(/ target=.?_blank.?(?=[ >])/,''):m});
 if(P=='parent')return t;
 if(P=='content_portal'){
  /* Future parents can't open the parent calendar: use the website term dates instead (#vccal marks it so syncing back restores the calendar) */
  t=t.replace(/href=(.?)(https:\/\/portals\.veracross\.au)?\/cggs_act\/parent\/calendar\/school\1([^>]*)>School calendar/g,'href=$1https://www.cggs.act.edu.au/student-life/term-dates#vccal$1 target=$1_blank$1$3>Term dates');
  t=t.replace(new RegExp('(https://portals\\.veracross\\.au)?/cggs_act/parent/pages/'+FUT+'(?=["\'#?])','g'),'$1/cggs_act/content_portal/pages/$2');
  t=t.replace(/href=(.?)(https:\/\/portals\.veracross\.au)?\/cggs_act\/parent\/?(?=["'])/g,'href=$1/cggs_act/content_portal');
  return t}
 t=t.replace(/(https:\/\/portals\.veracross\.au)?\/cggs_act\/parent\/calendar/g,'/cggs_act/'+P+'/calendar');
 t=t.replace(/href=(.?)(https:\/\/portals\.veracross\.au)?\/cggs_act\/parent\/?(?=["'])/g,'href=$1/cggs_act/'+P);
 t=t.replace(new RegExp('(https://portals\\.veracross\\.au)?/cggs_act/parent/pages/'+YP+'(?=["\'#?])','g'),'$1/cggs_act/'+P+'/pages/$2');
 if(P=='faculty')t=t.replace(/(https:\/\/portals\.veracross\.au)?\/cggs_act\/parent\/pages\/junior-school-handbook/g,'$1/cggs_act/faculty/pages/junior-school-elc');
 return t}
function tx(t,S,P){var keep=[];t=t.replace(/<img class=.?vcd-syncjs[^>]*>/g,function(m){keep.push(m);return '@@SYNC'+(keep.length-1)+'@@'});t=fromParent(toParent(t,S),P);return t.replace(/@@SYNC(\d+)@@/g,function(m,i){return keep[+i]})}
function comps(w){return w.portal_screen_admin.get().components.slice().sort(function(a,b){return a.layout_region_sort_key-b.layout_region_sort_key})}
async function build(S,page,dry){
 var src=await open(S,page);var pc=comps(src.w);src.f.remove();
 var out={};var T=group(page).filter(function(p){return p!=S});
 for(var k=0;k<T.length;k++){var P=T[k];
  var d=await open(P,page);var w=d.w;var old=comps(w);var scr=w.portal_screen_admin.get().screen||{};
  var fk=scr.portal_screen_pk||scr.pk||scr.id||(old[0]&&old[0].portal_screen_fk);
  if(!fk){d.f.remove();throw new Error('No screen id for '+NAME[P])}
  var nc=pc.map(function(c,i){var o={};PICK.forEach(function(p){o[p]=c[p]});o.portal_screen_component_pk=w._.newGUID();o.portal_screen_fk=fk;o.layout_region_sort_key=i;
   var cfg=JSON.parse(JSON.stringify(c.configuration));if(cfg.content&&typeof cfg.content.text=='string')cfg.content.text=tx(cfg.content.text,S,P);o.cfg=cfg;return o});
  out[P]={old:old.length,neu:nc.length};
  if(!dry){
   try{localStorage.setItem('__syncbk_'+P+'_'+page,JSON.stringify(old.map(function(c){return {width:c.width,name:c.system_access_name,configuration:c.configuration}})))}catch(e){}
   var C=w.Portals.config;
   var payload=nc.map(function(o){var c=o.cfg;delete o.cfg;o.configuration=w.flatten(c);return o});
   await w.$.ajax({type:'POST',url:w.Routes.screen_save_path({client:C.client,portal_name:C.portal_name,screen_name:C.screen_name}),data:{screen_json:JSON.stringify({layout:'single',components:payload})}});
   d.f.src='/cggs_act/'+P+'/pages/'+page+'/publish';await sleep(3500)}
  d.f.remove()}
 return out}
async function open(P,page){var f=document.createElement('iframe');f.style.cssText='position:absolute;width:10px;height:10px;left:-9999px;top:0';f.src='/cggs_act/'+P+'/pages/'+page+'/edit';document.body.appendChild(f);for(var i=0;i<120;i++){await sleep(500);try{var w=f.contentWindow;if(w.document.readyState=='complete'&&w.portal_screen_admin&&w.portal_screen_admin.get()&&w.portal_screen_admin.get().components)return{f:f,w:w}}catch(e){}}f.remove();throw new Error('Could not open the '+(NAME[P]||P)+' edit screen. Do you have edit rights there?')}
function $(s){return document.querySelector(s)}
function log(m,c){var d=document.createElement('div');d.textContent=m;if(c)d.style.color=c=='bad'?'#b23b3b':'#2e8b57';$('#vpt-log').appendChild(d);$('#vpt-log').scrollTop=1e9}
var PICK2=['portal_screen_component_pk','system_access_name','reload_keypaths','type_description','endpoints','component_type_fk','portal_screen_fk','layout_region_index','layout_region_sort_key','width'];
var sriCache={};
async function sri(ver,file){var k=ver+'/'+file;if(sriCache[k])return sriCache[k];var r=await fetch(CDN+ver+'/css/'+file);if(!r.ok)throw new Error(file+' is not in '+ver+' ('+r.status+')');var h=await crypto.subtle.digest('SHA-384',await r.arrayBuffer());var b='',a=new Uint8Array(h);for(var i=0;i<a.length;i++)b+=String.fromCharCode(a[i]);return sriCache[k]='sha384-'+btoa(b)}
/* Matches style links pinned to a release (with integrity) or to a commit (without) */
function linkRe(){return /<link class="vcd-css"[^>]*?href="https:\/\/cdn\.jsdelivr\.net\/gh\/[^@"]+@[^\/"]+\/css\/([^"]+)"[^>]*>/g}
function linkTag(ver,file,hash){return '<link class="vcd-css" rel="stylesheet" href="'+CDN+ver+'/css/'+file+'" integrity="'+hash+'" crossorigin="anonymous">'}
async function current(P,page){var r=await fetch('/cggs_act/'+P+'/pages/'+page,{credentials:'same-origin'});var t=await r.text();var m=t.match(/veracross-portal-styles@([^\/"&]+)\/css\//);return m?m[1]:'(not on GitHub styles)'}
async function update(P,page,ver,dry){var d=await open(P,page);try{var w=d.w;var cs=w.portal_screen_admin.get().components.slice().sort(function(a,b){return a.layout_region_sort_key-b.layout_region_sort_key});var hit=0,files=[];var out=[];for(var i=0;i<cs.length;i++){var c=cs[i];var o=w._.pick(c,PICK2);var cfg=JSON.parse(JSON.stringify(c.configuration));if(cfg.content&&typeof cfg.content.text=='string'&&/vcd-css/.test(cfg.content.text)){var t=cfg.content.text,m,re=linkRe();while((m=re.exec(t)))files.push(m[1]);for(var j=0;j<files.length;j++)await sri(ver,files[j]);t=t.replace(linkRe(),function(all,f){hit++;return linkTag(ver,f,sriCache[ver+'/'+f])});cfg.content.text=t}o.configuration=w.flatten(cfg);out.push(o)}if(!hit)throw new Error('no GitHub style links on this page');if(dry)return files.length+' files OK';try{localStorage.setItem('__stylesbk_'+P+'_'+page,JSON.stringify(cs.map(function(c){return{width:c.width,name:c.system_access_name,configuration:c.configuration}})))}catch(e){}var C=w.Portals.config;await w.$.ajax({type:'POST',url:w.Routes.screen_save_path({client:C.client,portal_name:C.portal_name,screen_name:C.screen_name}),data:{screen_json:JSON.stringify({layout:'single',components:out})}});d.f.src='/cggs_act/'+P+'/pages/'+page+'/publish';await sleep(3500);return hit+' links updated'}finally{d.f.remove()}}
async function releases(){var r=await fetch('https://api.github.com/repos/'+REPO+'/releases?per_page=30');if(!r.ok)throw new Error('GitHub releases not reachable ('+r.status+')');return (await r.json()).filter(function(x){return !x.draft}).map(function(x){return{tag:x.tag_name,name:x.name||x.tag_name,date:(x.published_at||'').slice(0,10),pre:x.prerelease}})}

var here=location.pathname.match(/^\/cggs_act\/(parent|faculty|student|content_portal|alumni|admissions)\/pages\/([^\/?#]+)\/?$/);
var others=here?group(here[2]).filter(function(p){return p!=here[1]}):[];
var canSync=here&&group(here[2]).indexOf(here[1])>=0&&others.length>0;
var otherNames=others.map(function(p){return NAME[p]});
var box=document.createElement('div');box.id='vpt';
box.innerHTML='<style>#vpt{position:fixed;top:16px;right:16px;z-index:99999;width:380px;max-height:86vh;overflow:auto;background:#fff;border-radius:13px;border-top:5px solid #0d5257;box-shadow:0 12px 40px rgba(0,0,0,.25);font:14px/1.45 Roboto,Arial,sans-serif;color:#414042;padding:18px 20px}#vpt h3{margin:0 0 4px;font:700 20px Georgia,serif;color:#0d5257}#vpt h4{margin:16px 0 6px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#7a7a7a}#vpt button{all:unset;cursor:pointer;background:#0d5257;color:#fff;border-radius:4px;padding:8px 14px;font:500 13px Roboto,Arial,sans-serif;margin:4px 6px 0 0}#vpt button.alt{background:#e6e3e0;color:#0d5257}#vpt button[disabled]{opacity:.5;cursor:wait}#vpt select{width:100%;padding:7px;border:1px solid #d6d3cf;border-radius:4px;font:inherit}#vpt .x{position:absolute;top:10px;right:14px;font-size:22px;cursor:pointer;color:#7a7a7a}#vpt-log{margin-top:12px;font-size:12.5px;max-height:220px;overflow:auto;border-top:1px solid #eceae7;padding-top:8px}</style>'+
'<span class="x" title="Close">&times;</span><h3>CGGS Portal Tools</h3><div style="font-size:12.5px;color:#7a7a7a">'+(here?(NAME[here[1]]||here[1])+' portal &middot; '+here[2]:'Not on a designed page')+'</div>'+
'<h4>Sync this page</h4>'+(canSync?'<div style="font-size:13px">Copies this '+NAME[here[1]]+' version to the '+otherNames.join(' and ')+' portal'+(others.length>1?'s':'')+' (only this page).</div><button id="vpt-sync">Sync to '+otherNames.join(' &amp; ')+'</button>':'<div style="font-size:13px">Open a Year page, Boarding House, or a page shared with Future Parents (policies, Cygnus, handbooks, OSHC, awards) to sync it.</div>')+
'<h4>Portal styles (GitHub)</h4><select id="vpt-ver"><option>Loading releases...</option></select><label style="display:block;margin-top:6px;font-size:13px"><input type="checkbox" id="vpt-dry" checked> Test only (no saving)</label><button id="vpt-go">Update all '+PAGES.length+' pages</button><button class="alt" id="vpt-ver-now">Which version is each page on?</button><div id="vpt-log"></div>';
document.body.appendChild(box);
box.querySelector('.x').onclick=function(){box.remove()};
if(canSync)$('#vpt-sync').onclick=async function(){var t=here[2];if(!confirm('Copy this '+NAME[here[1]]+' version of "'+t+'" to the '+otherNames.join(' and ')+' portal'+(others.length>1?'s':'')+'?\n\nOnly this page is updated. Save and publish your changes here first.'))return;this.disabled=true;log('Syncing '+t+'...');try{await build(here[1],t,false);log(t+' synced to '+otherNames.join(' & ')+'.','ok')}catch(e){log('Sync failed: '+(e.message||('error '+e.status)),'bad')}this.disabled=false};
releases().then(function(rel){$('#vpt-ver').innerHTML=rel.map(function(r){return '<option value="'+r.tag+'">'+r.tag+' ('+r.date+')'+(r.pre?' pre-release':'')+'</option>'}).join('')}).catch(function(e){$('#vpt-ver').innerHTML='';log(e.message,'bad')});
async function pool(n,fn){var q=PAGES.map(function(k,i){return i});async function w(){while(q.length){await fn(q.shift())}}var ws=[];for(var i=0;i<n;i++)ws.push(w());await Promise.all(ws)}
$('#vpt-ver-now').onclick=async function(){this.disabled=true;var tally={};await pool(4,async function(i){var p=PAGES[i].split('/');var v=await current(p[0],p[1]).catch(function(){return '?'});(tally[v]=tally[v]||[]).push(PAGES[i])});Object.keys(tally).forEach(function(v){log(v+': '+tally[v].length+' pages'+(tally[v].length<6?' ('+tally[v].join(', ')+')':''))});this.disabled=false};
$('#vpt-go').onclick=async function(){var ver=$('#vpt-ver').value,dry=$('#vpt-dry').checked;if(!ver)return;if(!dry&&!confirm('Move all '+PAGES.length+' portal pages to styles '+ver+'?\n\nEach page is backed up in this browser first. To undo, run this again with the previous release.'))return;this.disabled=true;log((dry?'Testing ':'Updating to ')+ver+'... keep this tab open.');var ok=0,bad=0;await pool(2,async function(i){var p=PAGES[i].split('/');try{await update(p[0],p[1],ver,dry);ok++;if((ok+bad)%10==0)log((ok+bad)+' of '+PAGES.length+' done')}catch(e){bad++;log(PAGES[i]+': '+(e.message||('error '+e.status)),'bad')}});log('Finished: '+ok+' OK, '+bad+' with problems.',bad?'bad':'ok');this.disabled=false};
})();
