/* CGGS Help & How-to pages: hub topic tiles, search, NEW tags, and the screenshot pop-up on guide pages.
   Loaded on the live page by the small img.vcd-helpjs tag at the end of the page's last block. */
(function(){
if(window.top!==window||/\/edit\/?$/.test(location.pathname)||window.__helpjs)return;window.__helpjs=1;
var D=document,tries=0;
function q(s,r){return [].slice.call((r||D).querySelectorAll(s))}
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function sc(to){var f=scrollY,d=to-f,n=Date.now();if(!d)return;(function a(){var p=Math.min(1,(Date.now()-n)/600);scrollTo(0,f+d*ease(p));if(p<1)setTimeout(a,16)})()}
function anim(el,open,done){var s=el.style;var h0=open?0:el.offsetHeight;s.overflow='hidden';s.transition='none';s.height='';var h1=open?el.offsetHeight:0;s.height=h0+'px';void el.offsetHeight;s.transition='height .45s ease';s.height=h1+'px';setTimeout(function(){s.transition='';s.overflow='';if(open)s.height='';if(done)done()},470)}
var ICONS=[
 [/onboard|start|new staff/i,'<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/>'],
 [/microsoft|365|teams|outlook|onedrive/i,'<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>'],
 [/print|scan/i,'<path d="M7 8V3h10v5"/><rect x="3" y="8" width="18" height="9" rx="2"/><path d="M7 14h10v7H7z"/>'],
 [/\bav\b|audio|video|classroom|board|projector/i,'<circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4z"/>'],
 [/sign|secur|password|mfa|login/i,'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'],
 [/ipad|apple|iphone|phone|mobile/i,'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>'],
 [/software|licen|app/i,'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>'],
 [/\bai\b|copilot/i,'<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>'],
 [/assess|moderat|report|mark/i,'<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>']];
var BOOK='<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7"/>';
function icon(n){for(var i=0;i<ICONS.length;i++)if(ICONS[i][0].test(n))return ICONS[i][1];return BOOK}
function isNew(li){var g=li.querySelector('.gnew');if(!g)return false;var d=new Date(g.textContent.trim());return !isNaN(d)&&(Date.now()-d.getTime())<30*864e5&&(Date.now()-d.getTime())>-864e5}

/* ---------- Hub ---------- */
function hub(){
 var tx=q('.text').filter(function(t){return t.querySelector(':scope > .topicmark')})[0];if(!tx){if(tries++<40)setTimeout(hub,300);return}
 var ul=tx.querySelector(':scope > ul');if(!ul)return;tx.classList.add('hj');
 var topics=[].slice.call(ul.children).map(function(li){var h=li.querySelector(':scope > b, :scope > strong');var name=(h?h.textContent:li.firstChild?li.firstChild.textContent:'').trim();
  var gs=q('ul a[href]',li).map(function(a){var gl=a.closest('li');return{t:a.textContent.trim(),h:a.getAttribute('href'),tg:a.getAttribute('target'),n:isNew(gl)}});return{name:name,g:gs}}).filter(function(t){return t.name});
 var grid=D.createElement('div');grid.className='tgrid';tx.appendChild(grid);
 topics.forEach(function(t){var b=D.createElement('button');b.type='button';b.className='cat';b.setAttribute('aria-expanded','false');
  b.innerHTML='<span class="ci"><svg viewBox="0 0 24 24" aria-hidden="true">'+icon(t.name)+'</svg></span><span class="tn">'+esc(t.name)+'</span><span class="tc">'+(t.g.length?'<b>'+t.g.length+'</b> guide'+(t.g.length>1?'s':'')+' ›':'Coming soon')+'</span>';
  b.onclick=function(){toggle(t,b)};t.btn=b;grid.appendChild(b)});
 var open=null,busy=false;
 function panel(t){var p=D.createElement('div');p.className='topen';p.setAttribute('role','region');
  p.innerHTML='<div class="toh"><span class="lbl">'+esc(t.name)+' · '+t.g.length+' guide'+(t.g.length==1?'':'s')+'</span><button type="button" class="tclose" aria-label="Close">✕</button></div>'+
   (t.g.length?'<ul>'+t.g.map(function(g){return '<li><a href="'+esc(g.h)+'"'+(g.tg?' target="'+esc(g.tg)+'"':'')+'><span>'+esc(g.t)+'</span>'+(g.n?'<span class="newt">NEW</span>':'')+'</a></li>'}).join('')+'</ul>':'<div class="empty">No guides in this topic yet. They’re on the way.</div>');
  p.querySelector('.tclose').onclick=function(){toggle(t,t.btn)};return p}
 function close(cb){if(!open){if(cb)cb();return}var o=open;open=null;o.t.btn.classList.remove('act');o.t.btn.setAttribute('aria-expanded','false');
  if(o.back!=null){sc(o.back)}else{var tp=o.t.btn.getBoundingClientRect().top;if(tp<80)sc(scrollY+tp-90)}
  anim(o.p,false,function(){o.p.remove();if(cb)cb()})}
 function toggle(t,b){if(busy)return;busy=true;var was=open&&open.t===t;close(function(){if(was){busy=false;return}
  var tiles=q('.cat',grid),last=b;tiles.forEach(function(x){if(x.offsetTop===b.offsetTop)last=x});
  var p=panel(t);last.after(p);b.classList.add('act');b.setAttribute('aria-expanded','true');var y0=scrollY;open={t:t,p:p,back:null};
  anim(p,true,function(){busy=false;var r=p.getBoundingClientRect(),br=b.getBoundingClientRect();var need=r.bottom-innerHeight+24;if(need>0){var by=Math.min(need,Math.max(br.top-90,0));if(by>0){open.back=y0;sc(scrollY+by)}}})})}
 /* search */
 var inp=D.querySelector('.hw .sb input'),res=D.querySelector('.hw .res');
 if(inp&&res){var all=[];topics.forEach(function(t){t.g.forEach(function(g){all.push({t:g.t,h:g.h,tg:g.tg,topic:t.name})})});
  inp.oninput=function(){var v=inp.value.trim().toLowerCase();if(v.length<2){res.classList.remove('on');res.innerHTML='';return}
   var w=v.split(/\s+/);var m=all.filter(function(g){var s=(g.t+' '+g.topic).toLowerCase();return w.every(function(x){return s.indexOf(x)>-1})});
   var tm=topics.filter(function(t){return t.name.toLowerCase().indexOf(v)>-1});
   res.innerHTML=m.slice(0,30).map(function(g){return '<a href="'+esc(g.h)+'"'+(g.tg?' target="'+esc(g.tg)+'"':'')+'><span>'+esc(g.t)+'</span><em>'+esc(g.topic)+'</em></a>'}).join('')+
    tm.map(function(t){return '<a href="#topic='+encodeURIComponent(t.name)+'" data-topic="'+esc(t.name)+'"><span>All '+esc(t.name)+' guides</span><em>Topic</em></a>'}).join('')+
    (m.length||tm.length?'':'<div class="none">No guides match “'+esc(inp.value.trim())+'” yet. Try another word, or suggest a guide below.</div>');
   q('a[data-topic]',res).forEach(function(a){a.onclick=function(e){e.preventDefault();var t=topics.filter(function(x){return x.name===a.getAttribute('data-topic')})[0];inp.value='';res.classList.remove('on');if(t&&!(open&&open.t===t)){t.btn.scrollIntoView({block:'center'});toggle(t,t.btn)}}});
   res.classList.add('on')};
  inp.onkeydown=function(e){if(e.key==='Escape'){inp.value='';inp.oninput()}}}
 /* #topic=Name opens a topic (used by guide breadcrumbs) */
 var hm=location.hash.match(/^#topic=(.+)$/);if(hm){var nm=decodeURIComponent(hm[1]);var t=topics.filter(function(x){return x.name===nm})[0];if(t)setTimeout(function(){t.btn.scrollIntoView({block:'center'});toggle(t,t.btn)},300)}
}

/* ---------- Guide pages: expand screenshots ---------- */
function guide(){
 var ph=q('.ae-grid .component-photo-link');if(!ph.length){if(tries++<40)setTimeout(guide,300);return}
 ph.forEach(function(c){var th=c.querySelector('.photo-thumbnail');if(!th)return;var m=(getComputedStyle(th).backgroundImage||'').match(/url\(["']?(.*?)["']?\)/);if(!m)return;
  var src=m[1].replace(/\/(w_1000,c_lfill,f_auto,fl_lossy|f_auto,fl_lossy)\//,'/f_auto/');
  c.classList.add('zoomable');c.setAttribute('role','button');c.setAttribute('tabindex','0');c.setAttribute('aria-label','Expand screenshot');
  var h=D.createElement('span');h.className='zhint';h.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>Expand';c.appendChild(h);
  var a=c.querySelector('a');if(a&&(!a.getAttribute('href')||a.getAttribute('href')==='#'||a.getAttribute('href')===''))a.removeAttribute('href');
  function show(e){if(e){e.preventDefault();e.stopPropagation()}var o=D.createElement('div');o.className='zov';o.innerHTML='<img alt="Screenshot" src="'+esc(src)+'"><button type="button" aria-label="Close">✕</button>';function x(){o.remove();D.removeEventListener('keydown',k);c.focus()}function k(ev){if(ev.key==='Escape')x()}o.onclick=x;D.addEventListener('keydown',k);D.body.appendChild(o);o.querySelector('button').focus()}
  c.addEventListener('click',show,true);c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')show(e)})})
}
function start(){if(D.querySelector('.vcd-help'))hub();else if(D.querySelector('.vcd-guide'))guide()}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',start);else start();
})();
