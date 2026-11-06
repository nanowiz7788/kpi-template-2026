/* J³ 공통 런처 — 수정 불필요. 설정은 index.html의 window.J3_APP(build.py가 app.config.json에서 생성) */
(function(){
const C=window.J3_APP, $=id=>document.getElementById(id);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const SPLASH_MS=reduce?900:2900;   // 원본 애니메이션 1.6s + 빛줄기 ~1.1s + 여유
const KEY='j3_splash_seen_'+C.id;
let stage=0, timer=0;
function show(el){el.classList.add('on');el.removeAttribute('aria-hidden')} function hide(el){el.classList.remove('on');el.setAttribute('aria-hidden','true')}
function toTitle(){ if(stage>=1)return; stage=1; clearTimeout(timer);
  try{sessionStorage.setItem(KEY,'1')}catch(e){}
  show($('title')); setTimeout(()=>{hide($('splash'));$('splashFrame').src='about:blank'},C.fade_ms);
  timer=setTimeout(toMain, reduce?Math.min(C.title_ms,800):C.title_ms); }
function toMain(){ if(stage>=2)return; stage=2; clearTimeout(timer);
  if(C.main_mode==='redirect'){location.replace(C.main_url);return}
  const f=$('mainFrame'); f.src=C.main_url; show($('main')); setTimeout(()=>hide($('title')),C.fade_ms); }
function start(){
  let seen=false; try{seen=C.skip_splash_in_session&&sessionStorage.getItem(KEY)}catch(e){}
  if(seen){ $('splash').remove(); stage=1; show($('title')); timer=setTimeout(toMain,C.title_ms); return }
  show($('splash'));
  const fr=$('splashFrame');
  fr.addEventListener('load',()=>{ // 원본 파일은 그대로, 안내 문구만 숨김(탭=건너뛰기로 바뀌므로)
    try{const d=fr.contentDocument,s=d.createElement('style');s.textContent='.hint{display:none!important}';d.head.appendChild(s)}catch(e){}
    timer=setTimeout(toTitle,SPLASH_MS); },{once:true});
  fr.src='core/j3_splash.html';
  timer=setTimeout(toTitle,SPLASH_MS+3000); // 로드 실패 대비
}
$('tap').addEventListener('pointerdown',e=>{e.preventDefault(); if(stage===0)toTitle(); else if(stage===1)toMain();});
let booted=false;
function boot(){
  if(booted)return; booted=true;
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
  start();
}
if(window.__J3_UNLOCKED) boot();
else document.addEventListener('j3-gate-open', boot, {once:true});
})();
