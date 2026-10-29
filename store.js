/* Browser-only data layer. Replaces a server: accounts, progress, XP, streaks, badges,
   typing stats, leaderboard and the AI tutor all live in this browser (localStorage). */
const Store=(()=>{
  const mem={};
  const LS={
    get(k){
      if(k in mem)return mem[k];
      try { return localStorage.getItem(k); }
      catch(e){ return null; }
    },
    set(k,v){try{localStorage.setItem(k,v);delete mem[k]}catch(e){mem[k]=v}}
  };
  // API keys are kept for the current tab session only, not in the persistent user database.
  // This reduces accidental long-term storage but is not a substitute for a server-side proxy.
  const aiKeyMem={};
  const aiKeyName=n=>'tyb_ai_key_'+n;
  const getAiKey=n=>{try{return sessionStorage.getItem(aiKeyName(n))||aiKeyMem[n]||''}catch(e){return aiKeyMem[n]||''}};
  const setAiKey=(n,key)=>{if(key)aiKeyMem[n]=key;else delete aiKeyMem[n];try{if(key)sessionStorage.setItem(aiKeyName(n),key);else sessionStorage.removeItem(aiKeyName(n))}catch(e){}};
  const BADGES={
    first_lesson:['First Lesson','Complete your first lesson'],
    first_typing:['First Typing Test','Finish a typing test'],
    wpm30:['30 WPM','Reach 30 words per minute'],
    wpm50:['50 WPM','Reach 50 words per minute'],
    streak3:['3-Day Streak','Learn 3 days in a row'],
    streak7:['7-Day Streak','Learn 7 days in a row'],
    course_done:['Course Complete','Finish every lesson in a course'],
    level5:['Level 5','Reach level 5']};
  const ALL=new Set(Object.values(LINES).flatMap(l=>l.c));
  const fails={};let DB={users:{}};let pendingQ=null;

  const load=()=>{
    try{DB=JSON.parse(LS.get('tyb_db')||'')||{users:{}}}catch(e){DB={users:{}}}
    if(!DB.users||typeof DB.users!=='object')DB.users={};
    // Migrate old versions that persisted AI keys in localStorage into session-only storage.
    let migrated=false;
    for(const [name,user] of Object.entries(DB.users)){
      if(user&&user.ai&&typeof user.ai.key==='string'&&user.ai.key){setAiKey(name,user.ai.key);delete user.ai.key;migrated=true;}
      if(user&&user.ai&&!user.ai.model)user.ai.model='claude-sonnet-5';
    }
    if(migrated)save();
    return DB;
  };
  const save=()=>LS.set('tyb_db',JSON.stringify(DB));
  const E=(m,s=400)=>{const e=new Error(m);e.status=s;return e};
  const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const today=()=>iso(new Date());
  const addDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)};
  const cur=()=>{load();const n=LS.get('tyb_session');return n&&DB.users[n]?{n,u:DB.users[n]}:null};
  const need=()=>{const c=cur();if(!c)throw E('Not logged in.',401);return c};
  const rand=n=>{const a=new Uint8Array(n);try{crypto.getRandomValues(a)}catch(e){for(let i=0;i<n;i++)a[i]=Math.random()*256}return a};

  async function hash(s,salt){
    const t=salt+':'+s;
    try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
    catch(e){let h=5381;for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return'f'+(h>>>0).toString(16)}
  }
  const newCode=()=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return[...rand(8)].map(x=>A[x%A.length]).join('')};
  const tooMany=k=>{const t=Date.now();fails[k]=(fails[k]||[]).filter(x=>t-x<300000);return fails[k].length>=5};
  const noteFail=k=>{(fails[k]=fails[k]||[]).push(Date.now())};

  /* ---------- progress logic ---------- */
  function streakInfo(u){const t=today();let d=u.days[t]?t:addDays(t,-1),n=0;while(u.days[d]){n++;d=addDays(d,-1)}return[n,u.days[t]||0]}
  const logAct=u=>{const t=today();u.days[t]=(u.days[t]||0)+1};
  const bestWpm=u=>u.typing.reduce((m,t)=>Math.max(m,t.wpm),0);
  function award(u){
    const out=[],lessons=Object.values(u.done).reduce((a,l)=>a+l.length,0),[streak]=streakInfo(u);
    const ck={first_lesson:lessons>=1,first_typing:u.typing.length>=1,wpm30:bestWpm(u)>=30,wpm50:bestWpm(u)>=50,
      streak3:streak>=3,streak7:streak>=7,
      course_done:Object.keys(u.done).some(c=>LESSONS[c]&&u.done[c].length>=LESSONS[c].length),level5:Math.floor(u.xp/100)+1>=5};
    for(const[c,ok]of Object.entries(ck))if(ok&&!u.badges[c]){u.badges[c]=Date.now();out.push({code:c,name:BADGES[c][0]})}
    return out}
  function profile(n,u){
    const[streak,tn]=streakInfo(u);
    return{user:n,line:u.line,xp:u.xp,level:Math.floor(u.xp/100)+1,goal:u.goal,notify:!!u.notify,onboarded:u.onboarded,
      streak,today:tn,at_risk:streak>0&&tn===0,best:bestWpm(u),sessions:u.typing.length,has_key:!!getAiKey(n),model:u.ai.model,
      courses:Object.keys(u.courses).map(c=>({name:c,rating:u.courses[c].rating||null,done:(u.done[c]||[]).length,total:LESSONS[c].length})),
      badges:Object.entries(BADGES).map(([c,[nm,d]])=>({code:c,name:nm,desc:d,earned:!!u.badges[c]}))}}
  function weakKeys(u,n=5){return Object.entries(u.keys).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,n).map(x=>x[0])}
  function weakTopics(u){
    const seen=new Set(),out=[];
    for(const a of u.attempts){const k=a.c+'|'+a.l;if(!a.ok&&!seen.has(k)&&!(u.done[a.c]||[]).includes(a.l)){seen.add(k);out.push([a.c,a.l])}}
    return out.slice(0,5)}
  const title=(c,l)=>LESSONS[c][l].t;

  /* ---------- routes (same shape a server would have) ---------- */
  async function route(method,path,body={}){
    const url=new URL(path,'http://x'),p=url.pathname;
    if(p==='/api/register'){
      const n=String(body.username||'').trim().toLowerCase(),pw=String(body.password||'');
      if(!/^[a-z0-9_.-]{3,30}$/.test(n))throw E('Username: 3-30 letters, numbers, . _ or -');
      if(pw.length<6)throw E('Password must be at least 6 characters.');
      load();if(DB.users[n])throw E('That username is already used.',409);
      const s=[...rand(8)].map(x=>x.toString(16).padStart(2,'0')).join(''),code=newCode();
      DB.users[n]={s,h:await hash(pw,s),rc:await hash(code,s),line:'cs',xp:0,goal:1,notify:false,onboarded:false,courses:{},done:{},
        attempts:[],days:{},typing:[],keys:{},badges:{},feedback:[],events:{},ai:{model:'claude-sonnet-5'},created:Date.now()};
      save();LS.set('tyb_session',n);return{profile:profile(n,DB.users[n]),recovery:code}}
    if(p==='/api/login'){
      const n=String(body.username||'').trim().toLowerCase();load();const u=DB.users[n];
      if(tooMany('l:'+n))throw E('Too many attempts. Wait a few minutes.',429);
      if(!u||u.h!==await hash(String(body.password||''),u.s)){noteFail('l:'+n);throw E('Wrong username or password.',401)}
      LS.set('tyb_session',n);return{profile:profile(n,u)}}
    if(p==='/api/logout'){LS.set('tyb_session','');return{ok:true}}
    if(p==='/api/reset'){
      const n=String(body.username||'').trim().toLowerCase();load();const u=DB.users[n];
      if(tooMany('r:'+n))throw E('Too many attempts. Wait a few minutes.',429);
      if(String(body.password||'').length<6)throw E('New password must be at least 6 characters.');
      if(!u||u.rc!==await hash(String(body.code||'').trim().toUpperCase(),u.s)){noteFail('r:'+n);throw E('Wrong username or recovery code.',401)}
      const code=newCode();u.h=await hash(String(body.password),u.s);u.rc=await hash(code,u.s);save();return{ok:true,recovery:code}}

    const{n,u}=need();
    switch(p){
      case'/api/me':return{profile:profile(n,u)};
      case'/api/password':
        if(u.h!==await hash(String(body.current||''),u.s))throw E('Current password is wrong.');
        if(String(body.new||'').length<6)throw E('New password must be at least 6 characters.');
        u.h=await hash(String(body.new),u.s);save();return{ok:true};
      case'/api/settings':{
        if('daily_goal'in body){const g=parseInt(body.daily_goal,10);if(!(g>=1&&g<=5))throw E('Daily goal must be 1 to 5.');u.goal=g}
        if('notify'in body)u.notify=!!body.notify;
        save();return{profile:profile(n,u)}}
      case'/api/aiconfig':{
        const key=body.key==='__keep__'?getAiKey(n):String(body.key||'').trim();
        setAiKey(n,key);
        u.ai={model:String(body.model||'').trim()||'claude-sonnet-5'};
        save();return{profile:profile(n,u)};
      }
      case'/api/onboard':
        if(!body.skip){if(LINES[body.line])u.line=body.line;if([1,2,3].includes(body.goal))u.goal=body.goal}
        u.onboarded=true;save();return{profile:profile(n,u)};
      case'/api/line':if(!LINES[body.line])throw E('Unknown study line.');u.line=body.line;save();return{profile:profile(n,u)};
      case'/api/courses/toggle':
        if(!ALL.has(body.course))throw E('Unknown course.');
        if(u.courses[body.course])delete u.courses[body.course];else u.courses[body.course]={rating:null};
        save();return{profile:profile(n,u)};
      case'/api/lessons':{
        const c=url.searchParams.get('course');if(!LESSONS[c])throw E('Unknown course.');
        if(!u.courses[c])throw E('Enrol in this course first.',403);
        const dn=u.done[c]||[];
        return{course:c,rating:u.courses[c].rating,lessons:LESSONS[c].map((L,i)=>({i,t:L.t,x:L.x,q:L.q,o:L.o,done:dn.includes(i)}))}}
      case'/api/lesson/answer':{
        const{course:c,lesson:i,choice:ch}=body;
        if(!LESSONS[c]||!Number.isInteger(i)||!Number.isInteger(ch)||i<0||i>=LESSONS[c].length)throw E('Invalid answer.');
        if(!u.courses[c])throw E('Enrol in this course first.',403);
        const ok=ch===LESSONS[c][i].a;u.attempts.push({c,l:i,ok});if(u.attempts.length>1000)u.attempts.shift();
        u.done[c]=u.done[c]||[];let gain=0;
        if(ok&&!u.done[c].includes(i)){u.done[c].push(i);gain=20;if(u.done[c].length>=LESSONS[c].length)gain+=50;u.xp+=gain;logAct(u)}
        const nb=award(u);save();return{correct:ok,xp_gain:gain,new_badges:nb,profile:profile(n,u)}}
      case'/api/rate':
        if(!u.courses[body.course]||!Number.isInteger(body.rating)||body.rating<1||body.rating>5)throw E('Invalid rating.');
        u.courses[body.course].rating=body.rating;save();return{profile:profile(n,u)};
      case'/api/typing':{
        const cl=(v,a,b)=>Math.max(a,Math.min(b,parseInt(v,10)||0));
        u.typing.push({ts:Date.now(),wpm:cl(body.wpm,0,300),acc:cl(body.acc,0,100),level:cl(body.level,0,2)});
        if(u.typing.length>500)u.typing.shift();
        const ms=body.misses&&typeof body.misses==='object'?body.misses:{};
        for(const[ch,k]of Object.entries(ms).slice(0,40))if(ch.length===1&&ch.trim()&&Number.isInteger(k)&&k>0&&k<=100)u.keys[ch.toLowerCase()]=(u.keys[ch.toLowerCase()]||0)+k;
        const gain=10+(cl(body.acc,0,100)>=95?5:0);u.xp+=gain;logAct(u);
        const nb=award(u);save();return{xp_gain:gain,new_badges:nb,profile:profile(n,u)}}
      case'/api/drill':{
        const keys=weakKeys(u).filter(k=>/[a-z]/.test(k));
        if(!keys.length)throw E('Finish a few typing tests first so we can find your weak keys.');
        const pool=WORDS.filter(w=>keys.some(k=>w.includes(k))).sort(()=>Math.random()-.5).slice(0,14);
        while(pool.length<10)pool.push(WORDS[Math.floor(Math.random()*WORDS.length)]);
        return{keys,text:pool.join(' ')}}
      case'/api/stats':{
        const cut=Date.now()-7*864e5,lb=[];
        for(const[name,x]of Object.entries(DB.users)){const w=x.typing.filter(t=>t.ts>=cut).reduce((m,t)=>Math.max(m,t.wpm),-1);if(w>=0)lb.push({user:name,wpm:w})}
        lb.sort((a,b)=>b.wpm-a.wpm||a.user.localeCompare(b.user));
        return{history:u.typing.slice(-20).map(t=>({ts:t.ts,wpm:t.wpm,acc:t.acc})),leaderboard:lb.slice(0,10),weak_keys:weakKeys(u)}}
      case'/api/feedback':{
        const text=String(body.text||'').slice(0,1000).trim();
        if(!['general','bug','idea','ai_up','ai_down'].includes(body.kind))throw E('Invalid feedback type.');
        if(['general','bug','idea'].includes(body.kind)&&text.length<3)throw E('Please write a few words.');
        u.feedback.push({kind:body.kind,text,ts:Date.now()});if(u.feedback.length>300)u.feedback.shift();save();return{ok:true}}
      case'/api/event':
        if(/^[a-z_]{2,30}$/.test(String(body.name))){u.events[body.name]=(u.events[body.name]||0)+1;save()}return{ok:true};
    }
    throw E('Not found.',404);
  }

  /* ---------- AI tutor ---------- */
  function context(u,course,lineKey){
    const[streak]=streakInfo(u),bits=['Study line: '+LINES[LINES[lineKey]?lineKey:u.line].n+'.','Level '+(Math.floor(u.xp/100)+1)+', '+streak+'-day streak.'];
    if(course)bits.push('Current course: "'+course+'".');
    const dn=[];for(const c in u.done)for(const l of u.done[c])dn.push(c+' - '+title(c,l));
    if(dn.length)bits.push('Finished lessons: '+dn.slice(0,12).join('; ')+'.');
    const wt=weakTopics(u);if(wt.length)bits.push('Topics the student got wrong in quizzes: '+wt.map(([c,l])=>c+' - '+title(c,l)).join('; ')+'.');
    const wk=weakKeys(u);if(wk.length)bits.push('Weak typing keys: '+wk.join(', ')+'.');
    return bits.join(' ')}

  function nextLessons(u,limit){
    const out=[];for(const c of Object.keys(u.courses))LESSONS[c].forEach((L,i)=>{if(!(u.done[c]||[]).includes(i))out.push([c,i])});
    return out.slice(0,limit)}

  function localTutor(text,course,u){
    const t=text.trim(),L=t.toLowerCase();
    if(pendingQ){
      const m=/^\(?([abc])\)?[.)]?$/i.exec(t);let idx=m?'abc'.indexOf(m[1].toLowerCase()):pendingQ.o.findIndex(o=>o.toLowerCase()===L);
      if(idx>=0){const q=pendingQ;pendingQ=null;return(idx===q.a?'✅ Correct! ':'❌ Not quite. ')+'The answer is: '+q.o[q.a]+'.\nSay "quiz me" for another question.'}
      pendingQ=null}
    if(/plan|schedule|what should i (do|study)/.test(L)){
      const nx=nextLessons(u,3);
      if(!nx.length)return'Enrol in a course first (Courses tab), then ask me again and I will build you a plan.\nTip: start with 2 courses from your study line.';
      return'Your study plan:\n'+nx.map(([c,i],k)=>'Day '+(k+1)+': '+c+' - '+title(c,i)).join('\n')+'\nDay '+(nx.length+1)+': one typing test plus a weak-key drill.\nKeep your daily goal of '+u.goal+' activity per day to protect your streak.'}
    if(/quiz|test me|weak|practi[sc]e questions?/.test(L)){
      let pick=weakTopics(u)[0]||nextLessons(u,1)[0];
      if(!pick)return'Enrol in a course first, then I can quiz you.';
      const Q=LESSONS[pick[0]][pick[1]];pendingQ={o:Q.o,a:Q.a};
      return'Quiz ('+pick[0]+' - '+Q.t+'):\n'+Q.q+'\n'+Q.o.map((o,i)=>'ABC'[i]+') '+o).join('\n')+'\nReply with A, B or C.'}
    if(/typing|drill|keys?|wpm|speed/.test(L)){
      const wk=weakKeys(u);
      return wk.length?'Your weakest keys are: '+wk.join(', ').toUpperCase()+'. Open the Typing tab and press "Weak-key drill".\nPractise 5 minutes a day; accuracy first, speed will follow.'
        :'Take a few typing tests first so I can find your weak keys. Aim for accuracy above 95% before pushing speed.'}
    for(const c of Object.keys(LESSONS))for(const les of LESSONS[c])if(new RegExp('\\b'+les.t.toLowerCase().replace(/[^a-z0-9 ]/g,'.')+'\\b').test(L))return les.t+' ('+c+'): '+les.x+'\n\nTry the quiz in the Courses tab, or say "quiz me".';
    if(/basic|explain|overview|start|learn/.test(L)){
      const pick=course&&LESSONS[course]?LESSONS[course].map((x,i)=>[course,i]).find(([c,i])=>!(u.done[c]||[]).includes(i)):nextLessons(u,1)[0];
      if(pick)return'Start here - '+pick[0]+': '+title(...pick)+'\n'+LESSONS[pick[0]][pick[1]].x+'\n\nThen answer its quiz in the Courses tab.'}
    return'I am the built-in tutor. I can:\n- build a study plan ("make my study plan")\n- quiz you on weak topics ("quiz me")\n- explain a lesson (say its title, like "Stack" or "Photosynthesis")\n- suggest typing drills ("typing tips")\nFor open-ended questions, add an AI key in Settings.'}

  async function ai(msgs,course,lineKey){
    const{n,u}=need(),last=msgs[msgs.length-1];
    const apiKey=getAiKey(n);
    if(!apiKey)return{reply:localTutor(last.content,course,u),local:true};
    let r;
    try{r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':apiKey,
      'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:u.ai.model,max_tokens:700,system:'You are the friendly AI tutor inside a learning app called Train Your Brain. Student profile: '+context(u,course,lineKey)+
        ' Use this to personalise help: build study plans, quiz weak topics, and suggest typing drills for weak keys when asked. Be clear, encouraging and concise (under 200 words) with simple language and short examples.',
        messages:msgs.slice(-8)})})}
    catch(e){throw E('Could not reach the AI service. Check your internet connection.')}
    if(!r.ok){
      if(r.status===401)throw E('The AI key was rejected. Check it in Settings.');
      if(r.status===403)throw E('The AI request was forbidden. Check your account permissions and API key.');
      if(r.status===429)throw E('The AI service is rate-limiting requests. Please wait and try again.');
      if(r.status===400)throw E('The AI request was rejected. Check the model name in Settings.');
      throw E('The AI service returned an error ('+r.status+').');
    }
    let d;try{d=await r.json()}catch(e){throw E('The AI service returned an unreadable response. Please try again.')}
    const reply=Array.isArray(d.content)?d.content.filter(b=>b.type==='text').map(b=>b.text).join(''):'';
    if(!reply)throw E('The AI service returned an empty answer. Please try again.');
    return{reply,local:false}}

  function exportData(){const{n,u}=need(),c=JSON.parse(JSON.stringify(u));delete c.h;delete c.s;delete c.rc;c.ai={model:u.ai.model};c.username=n;return JSON.stringify(c,null,2)}
  return{route,ai,exportData,resetTutor(){pendingQ=null}};
})();
