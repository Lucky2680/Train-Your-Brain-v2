const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TEXTS=[
 ['the quick brown fox jumps over the lazy dog','practice makes a person better every day','learn a little and type a little each day'],
 ['Typing quickly is a skill that grows with steady practice, so keep your eyes on the screen.','A curious mind asks questions, tests ideas, and learns from every mistake along the way.'],
 ['In 2026, students who practise daily (even for 10 minutes) often improve speed by 20% - accuracy, however, must come first!','"Focus," she said, "beats talent when talent does not work hard." Keep going; consistency wins.']
];

/* ---------- theme ---------- */
try{const t=localStorage.getItem('tyb_theme');if(t)document.documentElement.dataset.theme=t}catch(e){}

/* ---------- data access (Store replaces a server) ---------- */
const api=(path,body)=>Store.route(body===undefined?'GET':'POST',path,body);
let R=null,line='cs',active=null;
const ev=n=>{if(R)api('/api/event',{name:n}).catch(()=>{})};
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;$('toasts').appendChild(d);setTimeout(()=>d.remove(),3200)}
function reward(d){if(d.xp_gain)toast('+'+d.xp_gain+' XP');(d.new_badges||[]).forEach(b=>toast('🏅 New badge: '+b.name))}
function setMsg(id,t,good){const e=$(id);e.textContent=t;e.classList.toggle('good',!!good)}

/* ---------- auth ---------- */
function authView(v){['authMain','authForgot'].forEach(x=>$(x).classList.toggle('hide',x!==v));setMsg('err','')}
async function auth(create){
  const username=$('u').value.trim(),password=$('p').value;setMsg('err','');
  if(!username||password.length<6){setMsg('err','Enter a username and a password of 6+ characters.');return}
  try{const d=await api(create?'/api/register':'/api/login',{username,password});R=d.profile;
    if(d.recovery)showRecovery(d.recovery,enter);else enter()}
  catch(e){setMsg('err',e.message)}
}
$('login').onclick=()=>auth(false);$('reg').onclick=()=>auth(true);
$('p').onkeydown=e=>{if(e.key==='Enter')auth(false)};
$('forgot').onclick=e=>{e.preventDefault();authView('authForgot')};
$('fback').onclick=()=>authView('authMain');
$('fsend').onclick=async()=>{try{const d=await api('/api/reset',{username:$('fu').value,code:$('fc').value,password:$('np').value});
  showRecovery(d.recovery,()=>{authView('authMain');setMsg('err','Password updated. You can log in now.',true)},true)}
  catch(e){setMsg('err',e.message)}};
$('out').onclick=async()=>{await api('/api/logout',{});location.reload()};
let recAfter=null;
function showRecovery(code,after,isNew){recAfter=after;$('reccode').textContent=code;$('rec').classList.remove('hide');
  $('rec').querySelector('h2').textContent=isNew?'Your new recovery code':'Save your recovery code'}
$('reccopy').onclick=async()=>{
  try{
    if(!navigator.clipboard||!navigator.clipboard.writeText)throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText($('reccode').textContent);
    toast('Recovery code copied');
  }catch(e){toast('Could not copy automatically. Select the recovery code and copy it manually.')}
};
$('recdone').onclick=()=>{$('rec').classList.add('hide');const f=recAfter;recAfter=null;if(f)f()};

/* ---------- enter app ---------- */
function enter(){
  $('auth').classList.add('hide');$('app').classList.remove('hide');
  $('who').textContent='Hi, '+R.user;line=R.line||'cs';
  pickLine(line);applyProfile();newText();greet();fillSettings();
  if(!R.onboarded)$('onb').classList.remove('hide');
  if(R.at_risk&&R.notify&&'Notification' in window&&Notification.permission==='granted'){
    try{new Notification('Train Your Brain',{body:'Your '+R.streak+'-day streak ends tonight. Finish one activity to keep it!',icon:'icons/icon-192.png'})}catch(e){}}
  ev('login');loadStats();
}
function applyProfile(){
  const rb=$('riskBanner');rb.classList.toggle('hide',!R.at_risk);
  if(R.at_risk)rb.textContent='🔥 Your '+R.streak+'-day streak ends tonight. Finish one lesson or typing test to keep it!';
  const inLvl=R.xp%100;$('lvl').textContent='Level '+R.level;$('xptxt').textContent=inLvl+' / 100 XP';$('xpbar').style.width=inLvl+'%';
  $('streak').textContent=R.streak;$('goaltxt').textContent=Math.min(R.today,R.goal)+'/'+R.goal;
  $('goalbar').style.width=Math.min(100,R.today/R.goal*100)+'%';$('best').textContent=R.best;
  $('badges').innerHTML=R.badges.map(b=>`<div class="badge ${b.earned?'':'off'}" title="${esc(b.desc)}"><b>${b.earned?'🏅':'🔒'}</b>${esc(b.name)}</div>`).join('');
  drawCourses();
}

/* ---------- onboarding ---------- */
const ob={};
['o1','o2','o3'].forEach(id=>$(id).onclick=e=>{const b=e.target.closest('.chip');if(!b)return;
  $(id).querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===b));ob[id]=b.dataset.v});
async function finishOnb(skip){
  try{const d=await api('/api/onboard',skip?{skip:true}:{line:ob.o1,goal:ob.o3?+ob.o3:undefined});R=d.profile}catch(e){}
  $('onb').classList.add('hide');
  if(!skip){if(ob.o2!==undefined){lvl=+ob.o2;document.querySelectorAll('#lv .tab').forEach(b=>b.classList.toggle('on',+b.dataset.l===lvl));newText()}
    line=R.line;pickLine(line);toast('All set! Enrol in a course to begin.')}
  applyProfile();fillSettings();
}
$('odone').onclick=()=>finishOnb(false);$('oskip').onclick=()=>finishOnb(true);

/* ---------- tabs ---------- */
function showTab(t){
  document.querySelectorAll('#tabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  ['dash','courses','ai','type','settings'].forEach(x=>$('t-'+x).classList.toggle('hide',x!==t));
  ev('tab_'+t);if(t==='ai')ctx();if(t==='dash')loadStats();if(t==='type')$('ti').focus();
}
$('tabs').onclick=e=>{const t=e.target.dataset.t;if(t)showTab(t)};

/* ---------- dashboard ---------- */
function chart(el,vals,color){
  if(vals.length<2){el.innerHTML='<p class="mute">Finish 2 typing tests to see your chart.</p>';return}
  const W=300,H=120,p=16,mx=Math.max(...vals,1);
  const pts=vals.map((v,i)=>[p+i*(W-2*p)/(vals.length-1),H-p-(v/mx)*(H-2*p)]);
  el.innerHTML=`<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="chart"><line x1="${p}" y1="${H-p}" x2="${W-p}" y2="${H-p}" stroke="var(--line)"/>
  <polyline fill="none" stroke="${color}" stroke-width="2.5" points="${pts.map(x=>x.join(',')).join(' ')}"/>
  ${pts.map(x=>`<circle cx="${x[0]}" cy="${x[1]}" r="3" fill="${color}"/>`).join('')}
  <text x="${W-p}" y="12" text-anchor="end" font-size="11" fill="var(--mute)">latest ${vals[vals.length-1]}</text></svg>`}
async function loadStats(){
  try{const s=await api('/api/stats');
    chart($('c1'),s.history.map(h=>h.wpm),'var(--pri)');chart($('c2'),s.history.map(h=>h.acc),'var(--acc)');
    $('lb').innerHTML=s.leaderboard.length?'<table>'+s.leaderboard.map((r,i)=>`<tr class="${r.user===R.user?'me':''}"><td>#${i+1}</td><td>${esc(r.user)}</td><td>${r.wpm} WPM</td></tr>`).join('')+'</table>':'<p class="mute">No scores this week yet. Take a typing test!</p>'}
  catch(e){}
}

/* ---------- courses ---------- */
$('lines').innerHTML=Object.entries(LINES).map(([k,v])=>`<button class="card line" data-k="${k}"><div class="emo">${v.e}</div><h3>${v.n}</h3><span class="mute">${v.c.length} courses</span></button>`).join('');
$('lines').onclick=e=>{const b=e.target.closest('.line');if(b){line=b.dataset.k;pickLine(line);api('/api/line',{line}).then(d=>R=d.profile).catch(()=>{})}};
function pickLine(k){line=k;document.querySelectorAll('.line').forEach(b=>b.classList.toggle('on',b.dataset.k===k));$('lname').textContent=LINES[k].n+' courses';drawCourses()}
function drawCourses(){if(!R)return;
  $('clist').innerHTML=LINES[line].c.map(c=>{const e=R.courses.find(x=>x.name===c);
    return`<div class="course"><span>${esc(c)}${e?` <span class="mute">(${e.done}/${e.total} lessons)</span>`:''}</span><span class="btns">
    ${e?`<button class="btn acc" data-open="${esc(c)}">Lessons</button>`:''}<button class="btn ${e?'alt':''}" data-c="${esc(c)}">${e?'Leave':'Enrol'}</button></span></div>`}).join('')}
$('clist').onclick=async e=>{
  const o=e.target.dataset.open,c=e.target.dataset.c;
  if(o)return openCourse(o);
  if(c)try{const d=await api('/api/courses/toggle',{course:c});R=d.profile;applyProfile();ev('enrol_toggle')}catch(er){toast(er.message)}};
async function openCourse(name){
  try{const d=await api('/api/lessons?course='+encodeURIComponent(name));active=name;ev('open_course');
    $('courseHome').classList.add('hide');$('courseView').classList.remove('hide');$('cname').textContent=name;
    drawStars(d.rating);drawLessons(d.lessons)}
  catch(e){toast(e.message)}}
$('cback').onclick=()=>{$('courseView').classList.add('hide');$('courseHome').classList.remove('hide')};
function drawStars(r){$('stars').innerHTML=[1,2,3,4,5].map(n=>`<button data-s="${n}" class="${r>=n?'on':''}" aria-label="${n} stars">★</button>`).join('')}
$('stars').onclick=async e=>{const s=+e.target.dataset.s;if(!s)return;
  try{const d=await api('/api/rate',{course:active,rating:s});R=d.profile;drawStars(s);toast('Thanks for rating!')}catch(er){toast(er.message)}};
function drawLessons(ls){
  const n=ls.filter(l=>l.done).length;$('cbar').style.width=(n/ls.length*100)+'%';$('cprog').textContent=n+' of '+ls.length+' lessons complete';
  $('lessons').innerHTML=ls.map(l=>`<div class="lesson ${l.done?'done':''}" data-l="${l.i}"><h4>${l.i+1}. ${esc(l.t)} ${l.done?'✓':''}</h4><p>${esc(l.x)}</p>
   <b>${esc(l.q)}</b><div class="opts">${l.o.map((t,j)=>`<button class="opt" data-o="${j}" ${l.done?'disabled':''}>${esc(t)}</button>`).join('')}</div><div class="fb"></div></div>`).join('')}
$('lessons').onclick=async e=>{
  const b=e.target.closest('.opt');if(!b)return;const card=b.closest('.lesson'),fb=card.querySelector('.fb');
  try{const d=await api('/api/lesson/answer',{course:active,lesson:+card.dataset.l,choice:+b.dataset.o});R=d.profile;
    if(d.correct){fb.textContent='Correct!'+(d.xp_gain?' +'+d.xp_gain+' XP':'');fb.style.color='var(--ok)';card.classList.add('done');card.querySelectorAll('.opt').forEach(x=>x.disabled=true);reward(d);
      const c=R.courses.find(x=>x.name===active);if(c){$('cbar').style.width=(c.done/c.total*100)+'%';$('cprog').textContent=c.done+' of '+c.total+' lessons complete'}}
    else{fb.textContent='Not quite. Try again!';fb.style.color='var(--bad)';card.classList.remove('shake');void card.offsetWidth;card.classList.add('shake')}
    applyProfile()}
  catch(er){fb.textContent=er.message}};

/* ---------- AI tutor ---------- */
let hist=[],busy=false;
const ctx=()=>{const c=active||(R.courses[0]&&R.courses[0].name)||null;active=c;
  $('aictx').textContent=(c?'Helping you with: '+c+'. ':'Enrol in a course for focused help. ')+(R.has_key?'AI answers are on.':'Using the built-in tutor. Add an AI key in Settings for open-ended answers.');
  $('chips').innerHTML=(c?['Make my study plan','Quiz me on my weak topics','Explain the basics of '+c,'Typing tips']:['Make my study plan','Quiz me','Typing tips']).map(t=>`<button class="chip">${esc(t)}</button>`).join('')};
$('chips').onclick=e=>{if(e.target.classList.contains('chip'))ask(e.target.textContent)};
function greet(){hist=[];Store.resetTutor();$('chat').innerHTML='';bub('a','Hi! I can build study plans, quiz you on weak topics, explain lessons and suggest typing drills.')}
function bub(w,t){const d=document.createElement('div');d.className='msg '+w;d.textContent=t;$('chat').appendChild(d);$('chat').scrollTop=1e9;return d}
function rateBtns(d,text){const s=document.createElement('span');s.className='rate';s.innerHTML='<button data-k="ai_up" aria-label="Helpful">👍</button><button data-k="ai_down" aria-label="Not helpful">👎</button>';
  s.onclick=async e=>{const k=e.target.dataset.k;if(!k)return;s.remove();try{await api('/api/feedback',{kind:k,text:text.slice(0,200)});toast('Thanks for the feedback!')}catch(er){}};d.appendChild(s)}
async function ask(text){
  text=(text||$('q').value).trim();if(!text||busy)return;$('q').value='';setMsg('aierr','');
  bub('u',text);const d=bub('a','Thinking...');busy=true;hist.push({role:'user',content:text});ev('ai_ask');
  try{const r=await Store.ai(hist.slice(-6),active,line);d.textContent=r.reply;hist.push({role:'assistant',content:r.reply});rateBtns(d,r.reply)}
  catch(e){d.remove();hist.pop();setMsg('aierr',e.message)}
  finally{busy=false}}
$('ask').onclick=()=>ask();$('q').onkeydown=e=>{if(e.key==='Enter')ask()};

/* ---------- typing ---------- */
let lvl=0,txt='',t0=0,tick=null,done=false;
$('lv').onclick=e=>{if(e.target.dataset.l===undefined)return;lvl=+e.target.dataset.l;document.querySelectorAll('#lv .tab').forEach(b=>b.classList.toggle('on',b===e.target));newText()};
$('nw').onclick=newText;
function setText(t,msg){txt=t;$('ti').value='';$('ti').disabled=false;t0=0;done=false;clearInterval(tick);
  $('wpm').textContent='0';$('acc').textContent='100%';$('tm').textContent='0s';$('tres').textContent=msg||'';render('')}
function newText(){const a=TEXTS[lvl];setText(a[Math.floor(Math.random()*a.length)])}
$('drill').onclick=async()=>{try{const d=await api('/api/drill');setText(d.text,'Drill for your weak keys: '+d.keys.join(', ').toUpperCase());ev('typing_drill');$('ti').focus()}
  catch(e){$('tres').textContent=e.message}};
function render(v){$('passage').innerHTML=[...txt].map((c,i)=>{const ch=c===' '?'&nbsp;':esc(c);
  if(i<v.length)return`<span class="${v[i]===c?'ok':'bad'}">${ch}</span>`;
  return i===v.length?`<span class="cur">${ch}</span>`:ch}).join('')}
function stats(v){const s=Math.max((Date.now()-t0)/1000,1);let ok=0;for(let i=0;i<v.length;i++)if(v[i]===txt[i])ok++;
  return{s,w:Math.min(300,Math.round((ok/5)/(s/60))),a:v.length?Math.round(ok/v.length*100):100}}
$('ti').oninput=()=>{if(done)return;const v=$('ti').value.slice(0,txt.length);
  if(!t0){t0=Date.now();tick=setInterval(()=>{const x=stats($('ti').value);$('tm').textContent=Math.round(x.s)+'s';$('wpm').textContent=x.w},500)}
  render(v);const x=stats(v);$('wpm').textContent=x.w;$('acc').textContent=x.a+'%';
  if(v.length>=txt.length){done=true;clearInterval(tick);$('ti').disabled=true;$('tm').textContent=Math.round(x.s)+'s';
    const misses={};for(let i=0;i<v.length;i++)if(v[i]!==txt[i]&&txt[i].trim())misses[txt[i].toLowerCase()]=(misses[txt[i].toLowerCase()]||0)+1;
    const nb=x.w>R.best;
    $('tres').textContent='Finished: '+x.w+' WPM at '+x.a+'% accuracy'+(nb?' (new best!)':'');
    api('/api/typing',{wpm:x.w,acc:x.a,level:lvl,misses}).then(d=>{R=d.profile;reward(d);applyProfile();loadStats()}).catch(()=>{})}};

/* ---------- settings ---------- */
function fillSettings(){$('sgoal').value=R.goal;$('snot').checked=R.notify;$('amodel').value=R.model||'';$('akey').value='';
  $('akey').placeholder=R.has_key?'A key is saved (enter a new one to replace it)':'API key (starts with sk-ant-...)';
  $('dark').checked=(document.documentElement.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'))==='dark'}
$('dark').onchange=()=>{const t=$('dark').checked?'dark':'light';document.documentElement.dataset.theme=t;try{localStorage.setItem('tyb_theme',t)}catch(e){}};
$('ssave').onclick=async()=>{try{
  if($('snot').checked&&'Notification' in window&&Notification.permission==='default')await Notification.requestPermission();
  const d=await api('/api/settings',{daily_goal:+$('sgoal').value,notify:$('snot').checked});
  R=d.profile;applyProfile();setMsg('smsg','Saved.',true)}catch(e){setMsg('smsg',e.message)}};
$('asave').onclick=async()=>{try{const key=$('akey').value.trim();if(!key&&!R.has_key){setMsg('amsg','Paste your API key first.');return}
  const d=await api('/api/aiconfig',{key:key||'__keep__',model:$('amodel').value});R=d.profile;fillSettings();setMsg('amsg','Saved.',true)}catch(e){setMsg('amsg',e.message)}};
$('aclear').onclick=async()=>{const d=await api('/api/aiconfig',{key:'',model:$('amodel').value});R=d.profile;fillSettings();setMsg('amsg','Key removed.',true)};
$('psave').onclick=async()=>{try{await api('/api/password',{current:$('cp').value,new:$('cn').value});$('cp').value=$('cn').value='';setMsg('pmsg','Password changed.',true)}catch(e){setMsg('pmsg',e.message)}};
$('fsub').onclick=async()=>{try{await api('/api/feedback',{kind:$('fk').value,text:$('ft').value});$('ft').value='';setMsg('fmsg','Saved on this device. It has not been sent to the developer.',true)}catch(e){setMsg('fmsg',e.message)}};
$('export').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([Store.exportData()],{type:'application/json'}));a.download='train-your-brain-data.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
let deferred=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('install').classList.remove('hide')});
$('install').onclick=async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;$('install').classList.add('hide')};

/* ---------- start ---------- */
(async function start(){
  if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
  try{const d=await api('/api/me');R=d.profile;enter()}catch(e){}
})();
