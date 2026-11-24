import './style.css';
import { createClient } from '@supabase/supabase-js';

// These are public project settings, not secret keys. Configure them in Vercel.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const API_URL = import.meta.env.VITE_API_URL || '';
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const $ = (id) => document.getElementById(id);
const fa = n => new Intl.NumberFormat('fa-IR').format(n ?? 0);
let profile = { telegram_id: null, username: 'بازیکن', first_name: 'بازیکن', points: 0, rank: '—' };
let questions = [], qIndex = 0, localScore = 0, quizActive = false;
let missions = [
  {id:'play_once', title:'یک مسابقه انجام بده', description:'حداقل یک مسابقه را کامل کن', reward:20, completed:false},
  {id:'three_correct', title:'سه پاسخ درست بده', description:'در مسابقه به سه سؤال درست جواب بده', reward:30, completed:false},
  {id:'visit_app', title:'به DOPAMINE سر بزن', description:'امروز وارد مینی‌اپ شو', reward:5, completed:false}
];

function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2300)}
function setPoints(n){profile.points=n; $('points').textContent=`${fa(n)} ⭐`; $('profile-points').textContent=fa(n)}
function renderProfile(){
  const name=profile.first_name || profile.username || 'بازیکن';
  $('username').textContent=name; $('profile-name').textContent=name;
  $('profile-id').textContent=`شناسه تلگرام: ${profile.telegram_id ? fa(profile.telegram_id) : 'نسخه آزمایشی'}`;
  const letter=(name[0]||'D').toUpperCase(); $('avatar').textContent=letter; $('profile-avatar').textContent=letter;
  setPoints(profile.points); $('rank').textContent=profile.rank || '—';
}
function renderMissions(){
  const html=missions.map(m=>`<div class="mission"><div><b>${m.title}</b><small>${m.description}</small></div><span class="reward">${m.completed?'انجام شد ✓':`+${fa(m.reward)} ⭐`}</span></div>`).join('');
  $('missions-list').innerHTML=html; $('home-missions').innerHTML=html;
}
function showTab(name){
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===name));
}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
$('home-play').onclick=()=>{showTab('play');startQuiz()};
$('start-quiz').onclick=startQuiz;

const demoQuestions=[
 {q:'پایتخت ایران کدام شهر است؟',a:['تهران','شیراز','تبریز','اصفهان'],correct:0},
 {q:'کدام سیاره به سیاره سرخ معروف است؟',a:['زهره','مریخ','مشتری','عطارد'],correct:1},
 {q:'حاصل ۷ × ۸ چند می‌شود؟',a:['۵۴','۵۶','۶۴','۴۸'],correct:1},
 {q:'کدام اقیانوس بزرگ‌تر است؟',a:['اطلس','هند','آرام','منجمد شمالی'],correct:2},
 {q:'واحد اندازه‌گیری جریان الکتریکی چیست؟',a:['ولت','آمپر','وات','اهم'],correct:1}
];
async function startQuiz(){
  questions=demoQuestions; qIndex=0; localScore=0; quizActive=true;
  $('start-quiz').hidden=true; $('quiz-score').textContent=`${fa(0)} امتیاز`; renderQuestion();
}
function renderQuestion(){
  if(qIndex>=questions.length){finishQuiz();return}
  const item=questions[qIndex]; $('question-count').textContent=`سؤال ${fa(qIndex+1)} از ${fa(questions.length)}`;
  $('question').textContent=item.q; $('answers').innerHTML='';
  item.a.forEach((answer,i)=>{const b=document.createElement('button');b.className='answer';b.textContent=answer;b.onclick=()=>answerQuestion(i,b);$('answers').appendChild(b)});
}
async function answerQuestion(choice,button){
  if(!quizActive)return; quizActive=false;
  const item=questions[qIndex]; const correct=choice===item.correct;
  document.querySelectorAll('.answer').forEach((b,i)=>{b.disabled=true;if(i===item.correct)b.classList.add('correct')});
  if(!correct)button.classList.add('wrong');
  if(correct){localScore+=10;$('quiz-feedback').textContent='آفرین! ۱۰ امتیاز گرفتی.'}else{$('quiz-feedback').textContent='این بار درست نبود؛ سؤال بعدی رو امتحان کن.'}
  $('quiz-score').textContent=`${fa(localScore)} امتیاز`;
  qIndex++;setTimeout(()=>{quizActive=true;renderQuestion()},850);
}
async function finishQuiz(){
  quizActive=false;$('question-count').textContent='مسابقه تمام شد';
  $('question').textContent=`امتیاز این مسابقه: ${fa(localScore)}`;
  $('answers').innerHTML='';$('start-quiz').hidden=false;$('start-quiz').textContent='مسابقه دوباره';
  if(localScore>0) await submitScore(localScore);
  markMission('play_once'); if(localScore>=30)markMission('three_correct');
}
async function api(action,body={}){
  if(!API_URL || !tg?.initData) return null;
  const res=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,initData:tg.initData,...body})});
  if(!res.ok)throw new Error((await res.text())||'خطای سرور');
  return res.json();
}
async function submitScore(score){
  try{
    const data=await api('submit_score',{score});
    if(data?.profile){profile={...profile,...data.profile};renderProfile()}
    else {setPoints(profile.points+score);toast(`در نسخه نمایشی ${fa(score)} امتیاز اضافه شد.`)}
  }catch(e){toast('ثبت امتیاز روی سرور انجام نشد. تنظیمات اتصال را بررسی کن.')}
}
function markMission(id){const m=missions.find(x=>x.id===id);if(m&&!m.completed){m.completed=true;renderMissions()}}
async function loadRemote(){
  try{
    if(!tg?.initData){toast('نسخه پیش‌نمایش: برای ورود واقعی، مینی‌اپ را از داخل تلگرام باز کن.');return}
    const data=await api('me');
    if(data?.profile){profile={...profile,...data.profile};renderProfile()}
    if(data?.missions){missions=data.missions;renderMissions()}
    const board=await api('leaderboard');
    if(board?.leaders)renderLeaders(board.leaders);
  }catch(e){toast('اتصال سرور آماده نیست؛ فعلاً پیش‌نمایش را می‌بینی.')}
}
function renderLeaders(rows){
  $('leader-list').innerHTML=rows.map((p,i)=>`<div class="leader"><div><b>${['🥇','🥈','🥉'][i]||`#${i+1}`} ${escapeHtml(p.display_name||'بازیکن')}</b><small>بازیکن DOPAMINE</small></div><span class="reward">${fa(p.points)} ⭐</span></div>`).join('')||'<p class="muted">هنوز بازیکنی ثبت نشده.</p>';
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const user=tg?.initDataUnsafe?.user;
if(user){profile.telegram_id=user.id;profile.username=user.username||'';profile.first_name=user.first_name||'بازیکن'}
renderProfile();renderMissions();renderLeaders([]);
if(!tg?.initData){setPoints(125);$('rank').textContent='نسخه آزمایشی';}
loadRemote();
