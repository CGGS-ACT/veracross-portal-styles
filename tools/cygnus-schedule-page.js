(function(){
if(window.top!==window||/\/edit\/?$/.test(location.pathname)||window.__tt)return;window.__tt=1;
var A=['Sport','Music','Dance','Clubs','Academic','Debating','Drama'],tries=0;
function q(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x)e.textContent=x;return e}
function run(){
var days=q('.text').filter(function(t){return t.querySelector(':scope > .ttday')});
var grid=q('.text').filter(function(t){return t.querySelector(':scope > .ttgrid')})[0];
if(!days.length&&!grid){if(tries++<40)setTimeout(run,300);return}
document.body.classList.add('tt-js');var rows=[],F={school:[],day:[],what:[]};
days.forEach(function(t){
var ci=-1;
q('tr',t).forEach(function(tr,ri){var c=tr.cells;if(!c.length)return;
if(ri===0){for(var k=0;k<c.length;k++)if(c[k].textContent.trim()==='Campus')ci=k;return}
var last=c[c.length-1],a=last.textContent.trim();
if(A.indexOf(a)!==-1){tr.setAttribute('data-area',a);last.innerHTML='';last.appendChild(el('span','tt-pill',a));
if(ci!==-1)tr.setAttribute('data-campus',c[ci].textContent.trim());rows.push(tr)}
else if(c[0].querySelector('b,strong'))tr.classList.add('tt-slot')});
var h=t.querySelector(':scope > strong');if(!h)return;var name=h.textContent.trim();t.__day=name;
t.id='tt-'+name.toLowerCase().replace(/[^a-z]+/g,'-');
var hd=el('div','tt-dayhd'),b=el('button','tt-head',name),n=el('span','tt-n'),top=el('a','tt-top','Back to top');
b.type='button';b.appendChild(n);top.href='#tttop';hd.appendChild(b);hd.appendChild(top);h.replaceWith(hd);t.__n=n;
b.onclick=function(){t.classList.toggle('tt-open');sync()}});
if(grid)q('li',grid).forEach(function(li){var i=li.querySelector(':scope > i:last-child'),a=i?i.textContent.trim():'';if(A.indexOf(a)!==-1){li.setAttribute('data-area',a);rows.push(li)}});
var used=A.filter(function(a){return rows.some(function(e){return e.getAttribute('data-area')===a})});
var hasCampus=rows.some(function(e){return e.hasAttribute('data-campus')});
var tools=el('div','tt-tools'),card=el('div','tt-card'),groups=[];tools.appendChild(card);
function group(label,key,opts,multi){var g=el('div','tt-bar tt-'+key);g.setAttribute('aria-label',label);
['All'].concat(opts).forEach(function(o){var b=el('button','',o==='Day to be confirmed'?'Day TBC':key==='school'&&o!=='All'?o+' School':o);b.type='button';b.setAttribute('data-a',o);b.__v=o;
b.onclick=function(){if(!multi){F[key]=(F[key]===o&&o!=='All')?'All':o}else if(o==='All'){F[key]=[]}else{var i=F[key].indexOf(o);if(i===-1)F[key].push(o);else F[key].splice(i,1)}
if(key==='day')days.forEach(function(t){t.classList.toggle('tt-open',F.day.indexOf(t.__day)!==-1)});apply()};g.appendChild(b)});
g.__key=key;g.__multi=multi;groups.push(g);card.appendChild(g)}
if(hasCampus)group('School','school',['Junior','Senior'],true);
if(days.length>1)group('Day','day',days.map(function(t){return t.__day}),true);
group('What','what',used,true);
var ex=null;if(days.length){var xrow=el('div','tt-xrow');ex=el('button','tt-all','Expand all');ex.type='button';
ex.onclick=function(){var vis=days.filter(function(t){return !t.classList.contains('tt-hide')});var open=vis.some(function(t){return !t.classList.contains('tt-open')});vis.forEach(function(t){t.classList.toggle('tt-open',open)});sync()};xrow.appendChild(ex);tools.appendChild(xrow)}
var first=(days[0]||grid).closest('.portal-screen-block');first.parentNode.insertBefore(tools,first);
function sync(){if(!ex)return;var vis=days.filter(function(t){return !t.classList.contains('tt-hide')});ex.textContent=vis.length&&vis.every(function(t){return t.classList.contains('tt-open')})?'Collapse all':'Expand all'}
function apply(){
rows.forEach(function(e){var a=e.getAttribute('data-area'),c=e.getAttribute('data-campus');
var ok=(!F.what.length||F.what.indexOf(a)!==-1)&&(!F.school.length||!c||c==='Both'||F.school.indexOf(c)!==-1);e.classList.toggle('tt-hide',!ok)});
days.forEach(function(t){var k=q('tr[data-area]:not(.tt-hide)',t).length;if(t.__n)t.__n.textContent=k+(k===1?' activity':' activities');
q('tr.tt-slot',t).forEach(function(s){var x=s.nextElementSibling,any=false;while(x&&!x.classList.contains('tt-slot')){if(x.hasAttribute('data-area')&&!x.classList.contains('tt-hide'))any=true;x=x.nextElementSibling}s.classList.toggle('tt-hide',!any)});
var off=!(!F.day.length||F.day.indexOf(t.__day)!==-1)||!k;t.classList.toggle('tt-hide',off);var blk=t.closest('.portal-screen-block');if(blk)blk.classList.toggle('tt-hide',off)});
groups.forEach(function(g){var v=F[g.__key],none=g.__multi?!v.length:v==='All';g.classList.toggle('some',!none);
q('button',g).forEach(function(b){var a=b.__v;b.classList.toggle('on',a==='All'?none:(g.__multi?v.indexOf(a)!==-1:v===a))})});
sync()}
apply()}
run()})()
