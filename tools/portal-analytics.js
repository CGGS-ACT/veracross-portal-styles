/* CGGS portal visit tracking (13 Nov 2026). Sends who visits each page, how long it is actively visible, what they
   click and which A-Z or accordion cards they open, to the Ask Emily bot (POST /api/portal/track), which keeps them for
   13 months for the portal dashboard. Visitors are logged by name on every portal (Sam, Director ICT, 13 Nov 2026).
   Loaded once per page by an img.vcd-pajs tag in the page's design block, e.g.
     <img class="vcd-pajs" src="x" alt="" style="display:none" onerror="if(!window.__cggsPA){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/CGGS-ACT/veracross-portal-styles@VERSION/tools/portal-analytics.js';document.head.appendChild(s)}">
   No secrets here: this repo is public. Events go as text/plain JSON with navigator.sendBeacon (no CORS preflight).
   In the browser console, window.__cggsPA.info() shows the session, page view and where the name came from. */
(function(){
var ENDPOINT='https://ask-emily-cggs-fyg9cubjd2dnc2bz.australiaeast-01.azurewebsites.net/api/portal/track';
if(window.__cggsPA&&window.__cggsPA.v)return;
window.__cggsPA={v:1};
var inFrame=true;try{inFrame=window.self!==window.top}catch(e){}
if(inFrame||/\/(edit|publish)\/?$/.test(location.pathname)||location.hostname!=='portals.veracross.au')return;
var C=(window.Portals&&window.Portals.config)||{};
if(C.client!=='cggs_act'||!C.portal_name)return;
var ROLE={parent:'Parent',faculty:'Staff',student:'Student',content_portal:'Future parent',alumni:'Alumni',admissions:'Applicant'};
var BAD=/^(profile|my profile|my account|account|sign ?in|sign ?out|log ?in|log ?out|home|menu|veracross|portal)$/i;
function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return null}}
function rid(){var a=new Uint8Array(8);(window.crypto||window.msCrypto).getRandomValues(a);return Array.prototype.map.call(a,function(b){return('0'+b.toString(16)).slice(-2)}).join('')}
function squash(t){return String(t==null?'':t).replace(/\s+/g,' ').trim()}
function cut(t,n){t=squash(t);return t.length>n?t.slice(0,n):t}
var sid=ss('cggsPA.sid');if(!sid){sid=rid();ss('cggsPA.sid',sid)}
var pv=rid();
var uid=C.user_id!=null?String(C.user_id):'';
var page=String(C.screen_name||location.pathname.split('/').filter(Boolean).pop()||'home');
function vw(){var w=window.innerWidth||document.documentElement.clientWidth||0;return w<600?'phone':w<1024?'tablet':'desktop'}
var who={name:'',role:ROLE[C.portal_name]||C.portal_name,src:'none'};
var state=window.__cggsPA={v:1,sid:sid,pv:pv,who:who,info:function(){return{sid:sid,pv:pv,portal:C.portal_name,page:page,user_id:uid,name:who.name,role:who.role,name_from:who.src}}};

/* ---------- name lookup: Portals.config, then the page header, then the profile page; cached per session ---------- */
function okName(t){t=squash(t);return t.length>=2&&t.length<=80&&/[A-Za-z]/.test(t)&&!BAD.test(t)&&!/[<>{}@]/.test(t)?t:''}
function fromConfig(){
 var keys=['user_full_name','full_name','display_name','person_name','user_name','preferred_name','name'];
 for(var i=0;i<keys.length;i++){var v=C[keys[i]];if(typeof v==='string'&&okName(v))return okName(v)}
 var f=C.first_name||C.user_first_name||C.nick_name,l=C.last_name||C.user_last_name;
 if(f&&l)return okName(f+' '+l);
 var u=C.user||C.person||C.current_user;
 if(u&&typeof u==='object'){var n=u.full_name||u.display_name||u.name||((u.first_name||'')+' '+(u.last_name||''));if(okName(n))return okName(n)}
 return ''}
var SEL=['[data-user-name]','[data-person-name]','.user-name','.username','.user_name','.person-name','.vx-user-name','.portal-user-name','#user-name','.user-menu .name','.account-menu .name','[class*="user-name"]','[class*="UserName"]','[class*="userName"]'];
function fromDoc(d){
 for(var i=0;i<SEL.length;i++){var els=d.querySelectorAll(SEL[i]);for(var j=0;j<els.length;j++){var el=els[j];var n=okName(el.getAttribute('data-user-name')||el.getAttribute('data-person-name')||el.getAttribute('title')||el.textContent);if(n)return n}}
 return ''}
function fromProfile(){
 return fetch('/'+C.client+'/'+C.portal_name+'/profile',{credentials:'same-origin',headers:{Accept:'text/html'}}).then(function(r){
  if(!r.ok||/sign_in|login/i.test(r.url||''))return '';
  return r.text().then(function(t){var d=new DOMParser().parseFromString(t,'text/html');
   var n=fromDoc(d);if(n)return n;
   var hs=d.querySelectorAll('main h1, .content h1, h1, .profile-name, .person-name, main h2');
   for(var i=0;i<hs.length;i++){n=okName(hs[i].textContent);if(n)return n}
   return ''})}).catch(function(){return ''})}
function lookup(){
 var key='cggsPA.who.'+C.portal_name+'.'+uid,c=ss(key);
 if(c){try{c=JSON.parse(c);if(c&&c.name){who.name=c.name;who.role=c.role||who.role;who.src=c.src+' (cached)';return Promise.resolve()}}catch(e){}}
 function keep(n,src){who.name=n;who.src=src;ss(key,JSON.stringify({name:n,role:who.role,src:src}))}
 var n=fromConfig();if(n){keep(n,'Portals.config');return Promise.resolve()}
 n=fromDoc(document);if(n){keep(n,'page header');return Promise.resolve()}
 return fromProfile().then(function(n){if(n)keep(n,'profile page');else who.src='none (user_id only)'})}

/* ---------- sending: events wait (at most 3 s) for the name, then go straight out ---------- */
var ready=false,queue=[];
function send(e,extra){
 var o={client:C.client,e:e,portal:C.portal_name,page:page,uid:uid,name:who.name,role:who.role,sid:sid,pv:pv,ts:Date.now(),vw:vw()};
 for(var k in extra)if(Object.prototype.hasOwnProperty.call(extra,k))o[k]=extra[k];
 if(!ready){queue.push(o);return}
 beacon(o)}
function beacon(o){
 o.name=who.name;o.role=who.role;
 var body=JSON.stringify(o);
 try{if(navigator.sendBeacon&&navigator.sendBeacon(ENDPOINT,new Blob([body],{type:'text/plain'})))return}catch(e){}
 try{fetch(ENDPOINT,{method:'POST',body:body,mode:'no-cors',keepalive:true,headers:{'Content-Type':'text/plain'}})}catch(e){}}
function go(){if(ready)return;ready=true;var q=queue;queue=[];q.forEach(beacon)}
Promise.race([lookup(),new Promise(function(r){setTimeout(r,3000)})]).then(go,go);

/* ---------- view ---------- */
function refPath(){var r=document.referrer;if(!r)return '';try{var u=new URL(r);return u.host===location.host?u.pathname:u.host}catch(e){return ''}}
send('view',{title:cut(document.title,150),path:location.pathname,ref:refPath()});

/* ---------- time: seconds actively visible, on hide, on leave, and every 30 s ---------- */
var acc=0,since=document.visibilityState==='visible'?Date.now():0;
function flushTime(){
 if(since){acc+=Date.now()-since;since=document.visibilityState==='visible'?Date.now():0}
 var s=Math.floor(acc/1000);if(s<1)return;acc-=s*1000;send('time',{s:s})}
document.addEventListener('visibilitychange',function(){
 if(document.visibilityState==='hidden'){flushTime();since=0;if(!ready)go()}
 else if(!since)since=Date.now()});
window.addEventListener('pagehide',function(){flushTime();since=0;go()});
setInterval(function(){if(document.visibilityState==='visible')flushTime()},30000);

/* ---------- clicks and card openings ---------- */
function cardOf(el){
 for(var n=el;n&&n!==document.body;n=n.parentElement){
  var s=n.matches&&n.matches('.text')?n.querySelector(':scope > strong'):n.querySelector&&n.querySelector(':scope > .text > strong');
  if(s)return cut(s.textContent,120)}
 return ''}
document.addEventListener('click',function(ev){
 var el=ev.target&&ev.target.closest&&ev.target.closest('a,button,[onclick]');if(!el)return;
 var text=cut(el.innerText||el.textContent||el.getAttribute('aria-label')||el.getAttribute('title')||'',80);
 var href='',ext=false,raw=el.getAttribute('href');
 if(raw&&!/^javascript:/i.test(raw)){
  try{var u=new URL(raw,location.href);
   if(/^(tel|mailto):$/.test(u.protocol))href=u.protocol+u.pathname;
   else{href=u.href;ext=/^https?:$/.test(u.protocol)&&u.host!==location.host}}catch(e){href=raw}}
 send('click',{text:text,href:cut(href,400),card:cardOf(el),ext:ext})},true);
function openCard(el){
 var s=el.querySelector('.text > strong')||el.querySelector('strong, h2, h3, h4');
 return cut(s?s.textContent:cardOf(el),120)}
if(window.MutationObserver)new MutationObserver(function(ms){ms.forEach(function(m){
 var el=m.target;if(!el.classList)return;var was=m.oldValue||'';
 ['az-open','bh-open'].forEach(function(c){if(el.classList.contains(c)&&(' '+was+' ').indexOf(' '+c+' ')<0)send('open',{card:openCard(el)})})})})
 .observe(document.body,{subtree:true,attributes:true,attributeFilter:['class'],attributeOldValue:true});
})();
